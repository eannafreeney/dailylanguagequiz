import type { Context } from "hono";
import { buildPushPayload, type PushSubscription, type VapidKeys } from "@block65/webcrypto-web-push";
import type { LangCode } from "../types";
import { languages } from "../lib/languages";

type PushEnv = {
  DB: {
    prepare(sql: string): {
      bind(...values: unknown[]): {
        first<T = Record<string, unknown>>(): Promise<T | null>;
        run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
        all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
      };
    };
  };
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
};

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  subscription_json: string;
  timezone: string;
  reminder_time: string;
  lang_code: string;
  site_url: string;
  last_sent_local_date: string | null;
};

const envFor = (c: Context) => (c as unknown as { env: PushEnv }).env;
const validTime = (value: unknown): value is string =>
  typeof value === "string" && /^(?:[01]\d|2[0-3]):(?:00|15|30|45)$/.test(value);
const validTimezone = (value: unknown): value is string => {
  if (typeof value !== "string" || value.length > 100) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};
const validSubscription = (value: unknown): value is PushSubscription => {
  if (!value || typeof value !== "object") return false;
  const item = value as PushSubscription;
  if (typeof item.endpoint !== "string") return false;
  let endpoint: URL;
  try { endpoint = new URL(item.endpoint); } catch { return false; }
  const host = endpoint.hostname.toLowerCase();
  const allowedHost = host === "fcm.googleapis.com" ||
    host === "updates.push.services.mozilla.com" ||
    host === "push.services.mozilla.com" ||
    host === "web.push.apple.com" ||
    host.endsWith(".push.apple.com") ||
    host === "wns.windows.com" ||
    host.endsWith(".notify.windows.com");
  return endpoint.protocol === "https:" && allowedHost &&
    !!item.keys &&
    typeof item.keys.p256dh === "string" &&
    typeof item.keys.auth === "string";
};
const vapidFor = (env: PushEnv): VapidKeys | null => {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) return null;
  return {
    subject: env.VAPID_SUBJECT,
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
  };
};

export async function pushConfigHandler(c: Context) {
  const env = envFor(c);
  if (!env.VAPID_PUBLIC_KEY) return c.json({ error: "Push notifications are not configured yet." }, 503);
  return c.json({ publicKey: env.VAPID_PUBLIC_KEY });
}

export async function savePushSubscriptionHandler(c: Context) {
  const env = envFor(c);
  if (!vapidFor(env)) return c.json({ error: "Push notifications are not configured yet." }, 503);
  let body: {
    subscription?: unknown;
    timezone?: unknown;
    reminderTime?: unknown;
    langCode?: unknown;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid request body." }, 400);
  }
  if (!validSubscription(body.subscription) ||
      !validTimezone(body.timezone) ||
      !validTime(body.reminderTime) ||
      typeof body.langCode !== "string" ||
      !languages.some((language) => language.langCode === body.langCode)) {
    return c.json({ error: "Please check your notification settings and try again." }, 400);
  }

  const id = crypto.randomUUID();
  const siteUrl = new URL(c.req.url).origin;
  await env.DB.prepare(
    `INSERT INTO push_subscriptions
      (id, endpoint, subscription_json, timezone, reminder_time, lang_code, site_url, enabled, last_sent_local_date, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, NULL, datetime('now'))
     ON CONFLICT(endpoint) DO UPDATE SET
       id = excluded.id,
       subscription_json = excluded.subscription_json,
       timezone = excluded.timezone,
       reminder_time = excluded.reminder_time,
       lang_code = excluded.lang_code,
       enabled = 1,
       updated_at = datetime('now')`,
  ).bind(
    id,
    body.subscription.endpoint,
    JSON.stringify(body.subscription),
    body.timezone,
    body.reminderTime,
    body.langCode,
    siteUrl,
  ).run();

  return c.json({ token: id, enabled: true });
}

export async function disablePushSubscriptionHandler(c: Context) {
  const env = envFor(c);
  let body: { token?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid request body." }, 400);
  }
  if (typeof body.token !== "string" || body.token.length > 100) {
    return c.json({ error: "Invalid notification settings token." }, 400);
  }
  await env.DB.prepare("DELETE FROM push_subscriptions WHERE id = ?")
    .bind(body.token)
    .run();
  return c.json({ enabled: false });
}

function localParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

export async function sendDailyPushReminders(env: PushEnv, scheduledTime: number) {
  const vapid = vapidFor(env);
  if (!vapid) {
    console.log("[daily-push] Skipping: VAPID secrets are not configured.");
    return;
  }
  const { results } = await env.DB.prepare(
    "SELECT id, endpoint, subscription_json, timezone, reminder_time, lang_code, site_url, last_sent_local_date FROM push_subscriptions WHERE enabled = 1",
  ).all<PushSubscriptionRow>();

  for (const row of results) {
    let local: ReturnType<typeof localParts>;
    try {
      local = localParts(new Date(scheduledTime), row.timezone);
    } catch {
      await env.DB.prepare("DELETE FROM push_subscriptions WHERE id = ?").bind(row.id).run();
      continue;
    }
    if (local.time !== row.reminder_time || local.date === row.last_sent_local_date) continue;

    const claim = await env.DB.prepare(
      "UPDATE push_subscriptions SET last_sent_local_date = ? WHERE id = ? AND (last_sent_local_date IS NULL OR last_sent_local_date != ?)",
    ).bind(local.date, row.id, local.date).run();
    if (claim.meta?.changes !== 1) continue;

    try {
      const language = languages.find((item) => item.langCode === row.lang_code);
      const subscription = JSON.parse(row.subscription_json) as PushSubscription;
      const payload = await buildPushPayload({
        data: JSON.stringify({
          title: "Your daily language quiz is ready",
          body: `Take five minutes to practise ${language?.englishName ?? "your language"} today.`,
          url: row.site_url,
          icon: "/icons/app-icon.svg",
        }),
        options: { ttl: 60 * 60 * 12 },
      }, subscription, vapid);
      const response = await fetch(row.endpoint, payload);
      if (response.status === 404 || response.status === 410) {
        await env.DB.prepare("DELETE FROM push_subscriptions WHERE id = ?").bind(row.id).run();
      } else if (!response.ok) {
        throw new Error(`Push service returned HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("[daily-push] Delivery failed:", error);
      await env.DB.prepare(
        "UPDATE push_subscriptions SET last_sent_local_date = NULL WHERE id = ? AND last_sent_local_date = ?",
      ).bind(row.id, local.date).run();
    }
  }
}
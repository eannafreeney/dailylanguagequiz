import { Context } from "hono";
import { languages, REGISTERED_LANGS } from "./languages";
import { getDb } from "./db";
import { emailDeliveryLog, quizDailyParticipants, subscribers } from "./schema";
import { and, count, eq, sql } from "drizzle-orm";

export type Env = {
  DB: D1Database;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  ANALYTICS_PASSWORD?: string;
  ADMIN_EMAIL?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

export const getEnv = (c: Context) => (c as unknown as { env: Env }).env;

export async function sendEmail(
  env: Env,
  to: string,
  subject: string,
  html: string,
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
  });

  if (!response.ok) {
    console.error(
      "Resend email failed",
      response.status,
      await response.text(),
    );
    throw new Error("Email delivery failed");
  }
}

export async function sendDailyEmails(env: Env, scheduledTime: number) {
  // Use the scheduled instant, not runtime start time, to avoid missing the 08:00 window if execution is delayed.
  const now = new Date(scheduledTime);
  console.log("[daily-email] Scheduled time:", now.toISOString());
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";
  const dublinHour = part("hour");
  const dublinMinute = part("minute");

  console.log("[daily-email] Dublin time:", {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    hour: dublinHour,
    minute: dublinMinute,
  });

  if (dublinHour !== "08" || dublinMinute !== "00") {
    console.log("[daily-email] Skipping: not 08:00 in Dublin.");
    return;
  }

  const localDate = `${part("year")}-${part("month")}-${part("day")}`;
  await sendAdminDigest(env, localDate);

  const db = getDb(env.DB);
  const results = await db.select({
    email: subscribers.email,
    lang_code: subscribers.langCode,
    token: subscribers.token,
    site_url: subscribers.siteUrl,
  }).from(subscribers).where(and(eq(subscribers.confirmed, true), eq(subscribers.unsubscribed, false)));
  console.log("[daily-email] Eligible subscribers:", results.length);
  for (const subscriber of results) {
    const message = reminderMessage(subscriber);
    if (!message) continue;
    try {
      // Claim this recipient/date before sending so a retried scheduled event won't resend.
      const claim = await db.insert(emailDeliveryLog).values({
        email: subscriber.email, langCode: subscriber.lang_code, localDate,
      }).onConflictDoNothing().returning({ email: emailDeliveryLog.email });
      if (claim.length === 0) continue;
      console.log(
        "[daily-email] Sending reminder for language:",
        subscriber.lang_code,
      );
      await sendEmail(env, subscriber.email, message.subject, message.html);
      console.log(
        "[daily-email] Resend accepted reminder for language:",
        subscriber.lang_code,
      );
    } catch (error) {
      console.error("[daily-email] Reminder send failed:", error);
      // Remove the claim if sending failed, allowing a later scheduled retry to try again.
      try {
        await db.delete(emailDeliveryLog).where(and(
          eq(emailDeliveryLog.email, subscriber.email),
          eq(emailDeliveryLog.langCode, subscriber.lang_code),
          eq(emailDeliveryLog.localDate, localDate),
        ));
      } catch (cleanupError) {
        console.error(
          "Could not release failed email claim",
          subscriber.lang_code,
          cleanupError,
        );
      }
      console.error(
        "Could not send daily quiz email",
        subscriber.lang_code,
        error,
      );
    }
  }
}

export function reminderMessage(subscriber: Pick<Subscriber, "lang_code" | "token">) {
  const language = languages.find((item) => item.langCode === subscriber.lang_code);
  if (!language?.siteUrl) return;
  const quizUrl = new URL("/", language.siteUrl).toString();
  const unsubscribeUrl = new URL("/unsubscribe", language.siteUrl);
  unsubscribeUrl.searchParams.set("token", subscriber.token);
  return {
    subject: `Your daily ${language.englishName} quiz is ready`,
    html: `<p>Good morning!</p><p>Your daily ${language.englishName} practice is ready. Take five questions and build your skills a little every day.</p><p><a href="${quizUrl}">Start today's quiz</a></p><p style="font-size:12px;color:#666">You're receiving this because you subscribed to the daily ${language.englishName} quiz. <a href="${unsubscribeUrl}">Unsubscribe</a>.</p>`,
  };
}

export function dublinYesterday(todayYmd: string) {
  const [year, month, day] = todayYmd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - 1)).toISOString().slice(0, 10);
}

export function adminDigest(yesterday: string, rows: DigestRow[]) {
  const tracked = languages.filter((language) => REGISTERED_LANGS.has(language.langCode));
  const sections = tracked.map((language) => {
    const row = rows.find((item) => item.lang_code === language.langCode);
    const started = row?.started ?? 0;
    const finished = row?.finished ?? 0;
    return `<p>${language.englishName}: ${started} started, ${finished} finished.</p>`;
  });
  const started = rows.reduce((sum, row) => sum + row.started, 0);
  return {
    subject: `Yesterday's quiz: ${started} ${started === 1 ? "person" : "people"}`,
    html: `<p>${yesterday}</p>${sections.join("")}`,
  };
}

async function sendAdminDigest(env: Env, localDate: string) {
  if (!env.ADMIN_EMAIL) {
    console.log("[daily-email] No ADMIN_EMAIL, skipping admin digest.");
    return;
  }
  const yesterday = dublinYesterday(localDate);
  const db = getDb(env.DB);
  const claim = await db.insert(emailDeliveryLog).values({
    email: env.ADMIN_EMAIL, langCode: "admin", localDate: yesterday,
  }).onConflictDoNothing().returning({ email: emailDeliveryLog.email });
  if (claim.length === 0) return;
  try {
    const results = await db.select({
      lang_code: quizDailyParticipants.langCode,
      started: count(),
      finished: sql<number>`count(${quizDailyParticipants.completedAt})`,
    }).from(quizDailyParticipants)
      .where(eq(quizDailyParticipants.localDate, yesterday))
      .groupBy(quizDailyParticipants.langCode);
    const { subject, html } = adminDigest(yesterday, results);
    console.log("[daily-email] Sending admin digest for", yesterday);
    await sendEmail(env, env.ADMIN_EMAIL, subject, html);
  } catch (error) {
    console.error("[daily-email] Admin digest failed:", error);
    try {
      await db.delete(emailDeliveryLog).where(and(
        eq(emailDeliveryLog.email, env.ADMIN_EMAIL),
        eq(emailDeliveryLog.langCode, "admin"),
        eq(emailDeliveryLog.localDate, yesterday),
      ));
    } catch (cleanupError) {
      console.error("[daily-email] Could not release admin digest claim", cleanupError);
    }
  }
}

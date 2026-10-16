import { Context } from "hono";
import { Subscriber } from "../types";
import { languages } from "./languages";

export type Statement = {
  bind(...values: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
};

export type Env = {
  DB: { prepare(sql: string): Statement };
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  ANALYTICS_PASSWORD?: string;
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
  if (part("hour") !== "08" || part("minute") !== "00") return;
  const localDate = `${part("year")}-${part("month")}-${part("day")}`;

  const { results } = await env.DB.prepare(
    "SELECT email, lang_code, token, site_url FROM subscribers WHERE confirmed=1 AND unsubscribed=0",
  ).all<Subscriber>();
  for (const subscriber of results) {
    const language = languages.find(
      (item) => item.langCode === subscriber.lang_code,
    );
    if (!language) continue;
    const quizUrl = new URL("/", subscriber.site_url).toString();
    const unsubscribeUrl = new URL("/unsubscribe", subscriber.site_url);
    unsubscribeUrl.searchParams.set("token", subscriber.token);
    try {
      // Claim this recipient/date before sending so a retried scheduled event won't resend.
      const claim = await env.DB.prepare(
        "INSERT OR IGNORE INTO email_delivery_log (email, lang_code, local_date) VALUES (?, ?, ?)",
      )
        .bind(subscriber.email, subscriber.lang_code, localDate)
        .run();
      if (claim.meta?.changes !== 1) continue;
      await sendEmail(
        env,
        subscriber.email,
        `Your daily ${language.englishName} quiz is ready`,
        `<p>Good morning!</p><p>Your daily ${language.englishName} practice is ready. Take five questions and build your skills a little every day.</p><p><a href="${quizUrl}">Start today's quiz</a></p><p style="font-size:12px;color:#666">You're receiving this because you subscribed to the daily quiz. <a href="${unsubscribeUrl}">Unsubscribe</a>.</p>`,
      );
    } catch (error) {
      // Remove the claim if sending failed, allowing a later scheduled retry to try again.
      try {
        await env.DB.prepare(
          "DELETE FROM email_delivery_log WHERE email = ? AND lang_code = ? AND local_date = ?",
        )
          .bind(subscriber.email, subscriber.lang_code, localDate)
          .run();
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

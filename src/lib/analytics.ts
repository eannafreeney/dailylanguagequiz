import type { Context } from "hono";
import type { Env } from "./email";
import { languages } from "./languages";
import { getDb } from "./db";
import { quizDailyParticipants } from "./schema";
import { and, count, eq, gte, sql, desc } from "drizzle-orm";

const COOKIE_NAME = "quiz_visitor";

function visitorIdFromCookie(cookieHeader: string | undefined) {
  const entry = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  const value = entry?.slice(COOKIE_NAME.length + 1);
  return value && /^[a-f0-9-]{36}$/i.test(value) ? value : undefined;
}

function dublinDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export async function recordDailyParticipant(
  c: Context,
  env: Env,
  langCode: string,
  completed = false,
) {
  if (langCode !== "ga" && langCode !== "de") return;
  const visitorId =
    visitorIdFromCookie(c.req.header("Cookie")) ?? crypto.randomUUID();
  if (!visitorIdFromCookie(c.req.header("Cookie"))) {
    c.header(
      "Set-Cookie",
      `${COOKIE_NAME}=${visitorId}; Path=/; Max-Age=31536000; Secure; HttpOnly; SameSite=Lax`,
    );
  }
  const localDate = dublinDate();
  const db = getDb(env.DB);
  await db.insert(quizDailyParticipants).values({
    visitorId, localDate, langCode,
  }).onConflictDoNothing();
  if (completed) {
    await db.update(quizDailyParticipants).set({
      completedAt: sql`coalesce(${quizDailyParticipants.completedAt}, datetime('now'))`,
    }).where(and(
      eq(quizDailyParticipants.visitorId, visitorId),
      eq(quizDailyParticipants.localDate, localDate),
      eq(quizDailyParticipants.langCode, langCode),
    ));
  }
}

export async function analyticsDashboard(c: Context, env: Env) {
  if (!env.ANALYTICS_PASSWORD) {
    return c.text(
      "Analytics dashboard is not configured. Set the ANALYTICS_PASSWORD secret in Cloudflare.",
      503,
    );
  }

  const authorization = c.req.header("Authorization") ?? "";
  let suppliedPassword = "";
  try {
    if (authorization.startsWith("Basic ")) {
      const decoded = atob(authorization.slice(6));
      const separator = decoded.indexOf(":");
      if (separator >= 0) suppliedPassword = decoded.slice(separator + 1);
    }
  } catch {
    // Invalid Basic Auth header.
  }
  if (suppliedPassword !== env.ANALYTICS_PASSWORD) {
    c.header("WWW-Authenticate", 'Basic realm="Daily Quiz Analytics", charset="UTF-8"');
    return c.text("Authentication required", 401);
  }

  const results = await getDb(env.DB).select({
    local_date: quizDailyParticipants.localDate,
    lang_code: quizDailyParticipants.langCode,
    participants: count(),
    completions: sql<number>`count(${quizDailyParticipants.completedAt})`,
  }).from(quizDailyParticipants)
    .where(gte(quizDailyParticipants.localDate, sql`date('now', '-29 days')`))
    .groupBy(quizDailyParticipants.localDate, quizDailyParticipants.langCode)
    .orderBy(desc(quizDailyParticipants.localDate), quizDailyParticipants.langCode);

  const rows = results.map((row) =>
    `<tr><td>${row.local_date}</td><td>${languages.find((language) => language.langCode === row.lang_code)?.englishName ?? row.lang_code}</td><td class="number">${row.participants}</td><td class="number">${row.completions}</td></tr>`,
  ).join("");
  const total = results.reduce((sum, row) => sum + row.participants, 0);
  return c.html(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Daily Quiz Analytics</title><style>
body{font:16px/1.5 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#17231e;background:#f8faf8}
h1{font-size:2rem}.muted{color:#5c6b62}.metric,table{background:white;border:1px solid #dce5de;border-radius:12px}
.metric{padding:20px;margin:24px 0}.value{font-size:2rem;font-weight:700}table{width:100%;border-collapse:collapse;overflow:hidden}th,td{text-align:left;padding:12px;border-bottom:1px solid #e5eae6}th{background:#edf3ee}.number{text-align:right;font-variant-numeric:tabular-nums}
</style></head><body><h1>Daily quiz analytics</h1><p class="muted">Quiz starts and completions by anonymous browser, Dublin dates. Last 30 days.</p>
<div class="metric"><div class="muted">Quiz starts recorded (30-day total)</div><div class="value">${total}</div></div>
<table><thead><tr><th>Date</th><th>Quiz</th><th class="number">Started</th><th class="number">Completed</th></tr></thead><tbody>${rows || '<tr><td colspan="3">No quiz starts recorded yet.</td></tr>'}</tbody></table>
<p class="muted">One browser counts once per language per day. People using multiple browsers/devices may be counted more than once. A completion is recorded when the final question is answered correctly.</p></body></html>`);
}

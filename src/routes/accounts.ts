import type { Context } from "hono";
import type { Env } from "../lib/email";
import { getAuthenticatedUser, dublinLocalDate } from "../lib/account-auth";
import { getDb } from "../lib/db";
import { accountQuizAnswers, accountQuizCompletions, userProfiles } from "../lib/schema";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { isLangCode } from "../utils";

const getEnv = (c: Context) => (c as unknown as { env: Env }).env;

export async function meHandler(c: Context) {
  const env = getEnv(c);
  const user = await getAuthenticatedUser(c, env);
  if (!user) return c.json({ error: "Authentication required" }, 401);
  const db = getDb(env.DB);
  const [profile] = await db.select({ displayName: userProfiles.displayName })
    .from(userProfiles).where(eq(userProfiles.userId, user.id)).limit(1);
  return c.json({ id: user.id, displayName: profile?.displayName ?? null });
}

export async function profileHandler(c: Context) {
  const env = getEnv(c);
  const user = await getAuthenticatedUser(c, env);
  if (!user) return c.json({ error: "Authentication required" }, 401);
  let body: unknown;
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON" }, 400); }
  const displayName = typeof body === "object" && body !== null && "displayName" in body
    ? (body as { displayName?: unknown }).displayName : undefined;
  if (typeof displayName !== "string" || displayName.trim().length < 2 ||
      displayName.trim().length > 24 || !/^[\p{L}\p{N} _.-]+$/u.test(displayName.trim())) {
    return c.json({ error: "Display name must be 2–24 letters, numbers, spaces, dots, dashes or underscores." }, 400);
  }
  const normalized = displayName.trim().replace(/\s+/g, " ");
  await getDb(env.DB).insert(userProfiles).values({
    userId: user.id,
    displayName: normalized,
    updatedAt: sql`datetime('now')`,
  }).onConflictDoUpdate({
    target: userProfiles.userId,
    set: { displayName: normalized, updatedAt: sql`datetime('now')` },
  });
  return c.json({ displayName: normalized });
}

export async function leaderboardHandler(c: Context) {
  const env = getEnv(c);
  const langCode = c.req.query("lang");
  if (!langCode || !isLangCode(langCode)) return c.json({ error: "Invalid language" }, 400);
  const rows = await getDb(env.DB).select({
    displayName: userProfiles.displayName,
    score: count(accountQuizAnswers.questionId),
  }).from(userProfiles)
    .innerJoin(accountQuizAnswers, eq(accountQuizAnswers.userId, userProfiles.userId))
    .where(eq(accountQuizAnswers.langCode, langCode))
    .groupBy(userProfiles.userId, userProfiles.displayName)
    .orderBy(desc(count(accountQuizAnswers.questionId)), sql`lower(${userProfiles.displayName}) asc`)
    .limit(100);
  let rank = 0;
  let priorScore: number | null = null;
  const entries = rows.map((row, index) => {
    if (priorScore !== row.score) rank = index + 1;
    priorScore = row.score;
    return { rank, displayName: row.displayName, score: row.score };
  });
  return c.json({ language: langCode, entries });
}

export async function streaksHandler(c: Context) {
  const env = getEnv(c);
  const user = await getAuthenticatedUser(c, env);
  if (!user) return c.json({ error: "Authentication required" }, 401);
  const rows = await getDb(env.DB).select({
    langCode: accountQuizCompletions.langCode,
    localDate: accountQuizCompletions.localDate,
  }).from(accountQuizCompletions)
    .where(eq(accountQuizCompletions.userId, user.id))
    .orderBy(desc(accountQuizCompletions.localDate));
  const byLanguage = new Map<string, Set<string>>();
  for (const row of rows) {
    const dates = byLanguage.get(row.langCode) ?? new Set<string>();
    dates.add(row.localDate);
    byLanguage.set(row.langCode, dates);
  }
  const today = dublinLocalDate();
  const yesterdayDate = new Date(`${today}T00:00:00Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);
  const streaks = ["ga", "de", "ru", "it", "zh"].map((langCode) => {
    const dates = byLanguage.get(langCode) ?? new Set<string>();
    let cursor = dates.has(today) ? today : yesterday;
    let currentStreak = 0;
    if (dates.has(cursor)) {
      while (dates.has(cursor)) {
        currentStreak++;
        const previous = new Date(`${cursor}T00:00:00Z`);
        previous.setUTCDate(previous.getUTCDate() - 1);
        cursor = previous.toISOString().slice(0, 10);
      }
    }
    return { language: langCode, currentStreak, completedToday: dates.has(today) };
  });
  return c.json({ streaks });
}

export async function recordVerifiedCorrectAnswer(env: Env, userId: string, langCode: string, questionId: string) {
  await getDb(env.DB).insert(accountQuizAnswers).values({
    userId, localDate: dublinLocalDate(), langCode, questionId,
  }).onConflictDoNothing();
}

export async function recordAccountCompletion(env: Env, userId: string, langCode: string) {
  const localDate = dublinLocalDate();
  const [result] = await getDb(env.DB).select({
    score: count(accountQuizAnswers.questionId),
  }).from(accountQuizAnswers).where(and(
    eq(accountQuizAnswers.userId, userId),
    eq(accountQuizAnswers.localDate, localDate),
    eq(accountQuizAnswers.langCode, langCode),
  ));
  if ((result?.score ?? 0) < 5) return;
  await getDb(env.DB).insert(accountQuizCompletions).values({
    userId, localDate, langCode, score: 5,
  }).onConflictDoNothing();
}

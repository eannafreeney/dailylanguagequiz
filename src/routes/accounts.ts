import type { Context } from "hono";
import type { Env } from "../lib/email";
import { getAuthenticatedUser, dublinLocalDate } from "../lib/account-auth";
import { isLangCode } from "../utils";

const getEnv = (c: Context) => (c as unknown as { env: Env }).env;

export async function meHandler(c: Context) {
  const env = getEnv(c);
  const user = await getAuthenticatedUser(c, env);
  if (!user) return c.json({ error: "Authentication required" }, 401);
  const profile = await env.DB.prepare(
    "SELECT display_name FROM user_profiles WHERE user_id = ?",
  ).bind(user.id).first<{ display_name: string }>();
  return c.json({ id: user.id, displayName: profile?.display_name ?? null });
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
  await env.DB.prepare(
    "INSERT INTO user_profiles (user_id, display_name) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET display_name = excluded.display_name, updated_at = datetime('now')",
  ).bind(user.id, normalized).run();
  return c.json({ displayName: normalized });
}

export async function leaderboardHandler(c: Context) {
  const env = getEnv(c);
  const langCode = c.req.query("lang");
  if (!langCode || !isLangCode(langCode)) return c.json({ error: "Invalid language" }, 400);
  const { results } = await env.DB.prepare(
    "SELECT p.display_name AS displayName, COUNT(a.question_id) AS score FROM user_profiles p JOIN account_quiz_answers a ON a.user_id = p.user_id WHERE a.lang_code = ? GROUP BY p.user_id, p.display_name ORDER BY score DESC, displayName COLLATE NOCASE ASC LIMIT 100",
  ).bind(langCode).all<{ displayName: string; score: number }>();
  // The alphabetic order is presentation only; equal scores are still equal ranks.
  let rank = 0;
  let priorScore: number | null = null;
  const entries = results.map((row, index) => {
    if (priorScore !== row.score) rank = index + 1;
    priorScore = row.score;
    return { rank, displayName: row.displayName, score: row.score };
  });
  return c.json({ language: langCode, entries });
}

export async function recordVerifiedCorrectAnswer(c: Context, env: Env, userId: string, langCode: string, questionId: string) {
  const localDate = dublinLocalDate();
  await env.DB.prepare(
    "INSERT OR IGNORE INTO account_quiz_answers (user_id, local_date, lang_code, question_id) VALUES (?, ?, ?, ?)",
  ).bind(userId, localDate, langCode, questionId).run();
}

export async function recordAccountCompletion(c: Context, env: Env, userId: string, langCode: string) {
  const localDate = dublinLocalDate();
  const result = await env.DB.prepare(
    "SELECT COUNT(*) AS score FROM account_quiz_answers WHERE user_id = ? AND local_date = ? AND lang_code = ?",
  ).bind(userId, localDate, langCode).first<{ score: number }>();
  await env.DB.prepare(
    "INSERT OR IGNORE INTO account_quiz_completions (user_id, local_date, lang_code, score) VALUES (?, ?, ?, ?)",
  ).bind(userId, localDate, langCode, Math.min(5, result?.score ?? 0)).run();
}

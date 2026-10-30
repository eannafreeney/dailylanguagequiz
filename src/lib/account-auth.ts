import type { Context } from "hono";
import type { Env } from "./email";

export type AuthenticatedUser = { id: string; email?: string };

export async function getAuthenticatedUser(c: Context, env: Env): Promise<AuthenticatedUser | null> {
  const authorization = c.req.header("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ") || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  const token = authorization.slice(7).trim();
  if (!token || token.length > 8192) return null;
  try {
    const response = await fetch(new URL("/auth/v1/user", env.SUPABASE_URL), {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const user = await response.json() as { id?: unknown; email?: unknown };
    if (typeof user.id !== "string" || !/^[0-9a-f-]{36}$/i.test(user.id)) return null;
    return { id: user.id, ...(typeof user.email === "string" ? { email: user.email } : {}) };
  } catch {
    return null;
  }
}

export function hasCompletedDailyQuiz(distinctCorrectAnswers: number): boolean {
  return Number.isInteger(distinctCorrectAnswers) && distinctCorrectAnswers >= 5;
}

export function calculateCurrentStreak(completedDates: Iterable<string>, today: string) {
  const dates = new Set(completedDates);
  const previousDate = (date: string) => {
    const value = new Date(`${date}T00:00:00Z`);
    value.setUTCDate(value.getUTCDate() - 1);
    return value.toISOString().slice(0, 10);
  };
  const yesterday = previousDate(today);
  let cursor = dates.has(today) ? today : yesterday;
  let currentStreak = 0;
  while (dates.has(cursor)) {
    currentStreak++;
    cursor = previousDate(cursor);
  }
  return { currentStreak, completedToday: dates.has(today) };
}

export function rankLeaderboard<T extends { score: number }>(rows: T[]) {
  let rank = 0;
  let priorScore: number | null = null;
  return rows.map((row, index) => {
    if (priorScore !== row.score) rank = index + 1;
    priorScore = row.score;
    return { ...row, rank };
  });
}

export function dublinLocalDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Dublin", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

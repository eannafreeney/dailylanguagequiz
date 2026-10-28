import { LangCode, type Question } from "./types";
import { quizzes } from "./lib/quizzes";
import { DOMAIN_TO_LANG, HOST_REDIRECTS, languages } from "./lib/languages";
import { Context } from "hono";

const DEFAULT_DAILY_QUESTION_COUNT = 5;
const DAILY_QUESTION_COUNTS: Partial<Record<LangCode, number>> = {};
const DAY_MS = 86_400_000;
// One shuffle for the life of a bank. The day only picks the next slice.
const DECK_SEED = 0x9e3779b9;

export function getDailyQuestions(langCode: LangCode, now = new Date()): Question[] {
  const deck = [...quizzes[langCode as keyof typeof quizzes]] as Question[];
  const dailyQuestionCount =
    DAILY_QUESTION_COUNTS[langCode] ?? DEFAULT_DAILY_QUESTION_COUNT;

  let seed = DECK_SEED;
  for (let i = deck.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // Drop the incomplete final daily set so two days never share a question.
  const usable = deck.length - (deck.length % dailyQuestionCount);
  if (usable === 0) return [];
  const day = Math.floor(now.getTime() / DAY_MS);
  const start =
    (day % (usable / dailyQuestionCount)) * dailyQuestionCount;
  return deck.slice(start, start + dailyQuestionCount);
}

export const getHostLang = (c: Context) =>
  DOMAIN_TO_LANG[new URL(c.req.url).hostname];

export function redirectUrl(requestUrl: string) {
  const url = new URL(requestUrl);
  const target = HOST_REDIRECTS[url.hostname];
  if (!target) return;
  return new URL(url.pathname + url.search, target).toString();
}

export const isLangCode = (value: string): value is LangCode =>
  languages.some((item) => item.langCode === value);

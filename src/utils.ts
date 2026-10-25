import { LangCode } from "./types";
import { quizzes } from "./lib/quizzes";
import { DOMAIN_TO_LANG, HOST_REDIRECTS, languages } from "./lib/languages";
import { Context } from "hono";

const DAILY_QUESTION_COUNT = 5;
const DAY_MS = 86_400_000;
// One shuffle for the life of a bank. The day only picks the next slice.
const DECK_SEED = 0x9e3779b9;

export function getDailyQuestions(langCode: LangCode, now = new Date()) {
  const deck = [...quizzes[langCode as keyof typeof quizzes]];

  let seed = DECK_SEED;
  for (let i = deck.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // ponytail: drop length % 5 so two days never share a question.
  // Those leftovers come back once the bank is a multiple of 5.
  const usable = deck.length - (deck.length % DAILY_QUESTION_COUNT);
  const day = Math.floor(now.getTime() / DAY_MS);
  const start = (day % (usable / DAILY_QUESTION_COUNT)) * DAILY_QUESTION_COUNT;
  return deck.slice(start, start + DAILY_QUESTION_COUNT);
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

import { LangCode } from "./types";
import { quizzes } from "./lib/quizzes";

const DAILY_QUESTION_COUNT = 5;

export function getDailyQuestions(langCode: LangCode) {
  const today = new Date().toISOString().slice(0, 10);

  // Create a repeatable daily seed.
  let seed = 0;
  for (const char of today) {
    seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  }

  // Copy the bank so we don't change the original array.
  const shuffled = [...quizzes[langCode as keyof typeof quizzes]];

  // Deterministic shuffle.
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(DAILY_QUESTION_COUNT, shuffled.length));
}

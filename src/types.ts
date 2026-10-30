import { languages } from "./lib/languages";

export type Question = {
  id: string;
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  level?: string;
  phrase?: string;
  phraseReading?: string;
  correctAnswer: number;
  readings?: string[];
  variants?: Record<string, string[]>;
};

export type LangCode = (typeof languages)[number]["langCode"];

export type Subscriber = {
  email: string;
  lang_code: string;
  token: string;
  site_url: string;
};
export type SchedulerContext = { waitUntil(promise: Promise<unknown>): void };
export type SchedulerController = { cron: string; scheduledTime: number };

import { languages } from "./lib/languages";

export type Question = {
  id: string;
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  level?: string;
  phrase?: string;
  correctAnswer: number;
  simplifiedOptions?: string[];
  traditionalOptions?: string[];
  optionPinyin?: string[];
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

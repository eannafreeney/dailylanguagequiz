import { languages } from "./lib/languages";

export type Question = {
  id: string;
  question: string;
  options: string[];
  answer?: string;
  explanation?: string;
  correctAnswer: number;
};

export type LangCode = (typeof languages)[number]["langCode"];

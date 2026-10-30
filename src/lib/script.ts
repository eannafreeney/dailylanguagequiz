import { languages } from "./languages";
import type { LangCode, Question } from "../types";

export function languageView(langCode: LangCode): {
  dir: "ltr" | "rtl";
  promptLang: string;
  optionLang: string;
  scripts: { id: string; label: string }[];
} {
  const language = languages.find((item) => item.langCode === langCode);
  const scripts =
    language && "scripts" in language && language.scripts
      ? [...language.scripts]
      : [];
  return {
    dir:
      language && "dir" in language && language.dir === "rtl" ? "rtl" : "ltr",
    promptLang:
      language && "promptLang" in language && language.promptLang
        ? language.promptLang
        : langCode,
    optionLang:
      language && "optionLang" in language && language.optionLang
        ? language.optionLang
        : langCode,
    scripts,
  };
}

export function activeScript(langCode: LangCode, value: unknown) {
  const { scripts } = languageView(langCode);
  const fallback = scripts[0]?.id ?? "";
  return typeof value === "string" && scripts.some((item) => item.id === value)
    ? value
    : fallback;
}

export function optionLabel(question: Question, index: number, script: string) {
  return question.variants?.[script]?.[index] ?? question.options?.[index] ?? "";
}

export function nativeOptions(question: Question) {
  return Boolean(question.readings?.length || question.variants);
}

export function phraseReadingLine(question: Question) {
  const line = question.phraseReading ?? "";
  if (!line || line === question.readings?.[question.correctAnswer]) return "";
  return line;
}

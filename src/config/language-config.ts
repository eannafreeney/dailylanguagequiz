import type { LangCode } from "../types";

export type LanguageLink = { href: string; label: string };
export type LanguageTheme = {
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentBorder: string;
  accentText: string;
  focus: string;
  progress: string;
  radio: string;
  selectedOption: string;
};
export type LanguageConfig = { links: LanguageLink[]; theme: LanguageTheme };

const irishTheme: LanguageTheme = {
  accent: "bg-emerald-700", accentHover: "hover:bg-emerald-800",
  accentSoft: "bg-emerald-50", accentBorder: "border-emerald-200",
  accentText: "text-emerald-800", focus: "focus-visible:outline-emerald-700",
  progress: "bg-emerald-500",
  radio: "checked:border-emerald-600 checked:bg-[radial-gradient(circle,_#059669_35%,_white_40%)]",
  selectedOption: "has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50",
};

// Language navigation and visual tokens are isolated here so the German
// identity cannot bleed into the existing Irish quiz.
export const languageConfig: Record<LangCode, LanguageConfig> = {
  ga: {
    links: [
      { href: "https://langkraft.app/learn/irish?utm_source=daily-quiz&utm_medium=referral&utm_content=header", label: "Langkraft" },
      { href: "https://www.skool.com/learn-irish-with-eanna-5552/about", label: "Skool" },
      { href: "https://www.italki.com/en/teacher/3759793?lv=1", label: "Lessons" },
    ],
    theme: irishTheme,
  },
  de: {
    // Keep German navigation separate; add German-specific destinations here.
    links: [],
    theme: {
      accent: "bg-neutral-950",
      accentHover: "hover:bg-neutral-800",
      accentSoft: "bg-amber-50",
      accentBorder: "border-amber-300",
      accentText: "text-red-800",
      focus: "focus-visible:outline-red-700",
      progress: "bg-red-700",
      radio: "checked:border-red-700 checked:bg-[radial-gradient(circle,_#dc2626_35%,_white_40%)]",
      selectedOption: "has-[:checked]:border-red-700 has-[:checked]:bg-amber-50",
    },
  },
  ru: { links: [], theme: irishTheme },
};

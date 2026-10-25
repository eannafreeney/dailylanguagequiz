import type { LangCode } from "../types";

export type LanguageLink = {
  href: string;
  label: string;
};

export type LanguageConfig = {
  links: LanguageLink[];
  theme: {
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
};

// Keep navigation and theme decisions isolated by language. Irish remains on
// its existing emerald palette; German uses black, red, and gold accents.
export const languageConfig: Record<LangCode, LanguageConfig> = {
  ga: {
    links: [
      {
        href: "https://langkraft.app/learn/irish?utm_source=daily-quiz&utm_medium=referral&utm_content=header",
        label: "Langkraft",
      },
      {
        href: "https://www.skool.com/learn-irish-with-eanna-5552/about",
        label: "Skool",
      },
      {
        href: "https://www.italki.com/en/teacher/3759793?lv=1",
        label: "Lessons",
      },
    ],
    theme: {
      accent: "bg-emerald-700",
      accentHover: "hover:bg-emerald-800",
      accentSoft: "bg-emerald-50",
      accentBorder: "border-emerald-200",
      accentText: "text-emerald-800",
      focus: "focus-visible:outline-emerald-700",
      progress: "bg-emerald-500",
      radio: "checked:border-emerald-600 checked:bg-[radial-gradient(circle,_#059669_35%,_white_40%)]",
      selectedOption: "has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50",
    },
  },
  de: {
    // Add German-specific destinations here when they are ready; do not show
    // Irish learning links on the German site by default.
    links: [],
    theme: {
      accent: "bg-red-700",
      accentHover: "hover:bg-red-800",
      accentSoft: "bg-amber-50",
      accentBorder: "border-amber-300",
      accentText: "text-red-800",
      focus: "focus-visible:outline-red-700",
      progress: "bg-red-700",
      radio: "checked:border-red-700 checked:bg-[radial-gradient(circle,_#dc2626_35%,_white_40%)]",
      selectedOption: "has-[:checked]:border-red-700 has-[:checked]:bg-amber-50",
    },
  },
  ru: {
    links: [],
    theme: {
      accent: "bg-emerald-700",
      accentHover: "hover:bg-emerald-800",
      accentSoft: "bg-emerald-50",
      accentBorder: "border-emerald-200",
      accentText: "text-emerald-800",
      focus: "focus-visible:outline-emerald-700",
      progress: "bg-emerald-500",
      radio: "checked:border-emerald-600 checked:bg-[radial-gradient(circle,_#059669_35%,_white_40%)]",
      selectedOption: "has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50",
    },
  },
};

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
  progressTrack: string;
  radio: string;
  selectedOption: string;
  optionHover: string;
  kicker: string;
  headerBar: string;
  headerTitle: string;
  headerMuted: string;
  markText: string;
  footerBar: string;
};
export type LanguageConfig = { links: LanguageLink[]; theme: LanguageTheme };

const irishTheme: LanguageTheme = {
  accent: "bg-emerald-700",
  accentHover: "hover:bg-emerald-800",
  accentSoft: "bg-emerald-50",
  accentBorder: "border-emerald-200",
  accentText: "text-emerald-800",
  focus: "focus-visible:outline-emerald-700",
  progress: "bg-emerald-500",
  progressTrack: "bg-slate-200",
  radio:
    "checked:border-emerald-600 checked:bg-[radial-gradient(circle,_#059669_35%,_white_40%)]",
  selectedOption:
    "has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50",
  optionHover: "hover:border-emerald-400 hover:bg-emerald-50",
  kicker: "text-emerald-700",
  headerBar: "border-b border-slate-200 bg-white",
  headerTitle: "text-slate-900",
  headerMuted: "text-slate-500",
  markText: "text-white",
  footerBar: "mt-auto border-t border-slate-200 bg-slate-950 text-slate-300",
};

const germanTheme: LanguageTheme = {
  accent: "bg-red-700",
  accentHover: "hover:bg-red-800",
  accentSoft: "bg-amber-50",
  accentBorder: "border-amber-400",
  accentText: "text-red-800",
  focus: "focus-visible:outline-red-700",
  progress: "bg-amber-400",
  progressTrack: "bg-neutral-800",
  radio:
    "checked:border-red-700 checked:bg-[radial-gradient(circle,_#b91c1c_35%,_white_40%)]",
  selectedOption: "has-[:checked]:border-red-700 has-[:checked]:bg-amber-50",
  optionHover: "hover:border-amber-400 hover:bg-amber-50",
  kicker: "text-red-700",
  headerBar: "border-b-4 border-red-600 bg-neutral-950",
  headerTitle: "text-white",
  headerMuted: "text-amber-200",
  markText: "text-amber-300",
  footerBar:
    "mt-auto border-t-4 border-amber-400 bg-neutral-950 text-slate-300",
};

// Language navigation and visual tokens are isolated here so the German
// identity cannot bleed into the existing Irish quiz.
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
    theme: irishTheme,
  },
  de: {
    // Keep German navigation separate; add German-specific destinations here.
    links: [
      {
        href: "https://langkraft.app/learn/german?utm_source=daily-quiz&utm_medium=referral&utm_content=header",
        label: "Langkraft German",
      },
    ],
    theme: germanTheme,
  },
  ru: { links: [], theme: irishTheme },
};

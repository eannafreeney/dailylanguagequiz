import type { LangCode } from "../types";

export type LanguageLink = { href: string; title: string; description: string };
export type LanguageTheme = {
  accent: string;
  accentHover: string;
  accentBorderHover: string;
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
  accentBorderHover: "hover:border-emerald-800",
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
  kicker: "text-orange-700",
  headerBar: "bg-white",
  headerTitle: "text-slate-900",
  headerMuted: "text-slate-500",
  markText: "text-white",
  footerBar: "mt-auto border-t-2 border-orange-400 bg-slate-950 text-slate-300",
};

const germanTheme: LanguageTheme = {
  accent: "bg-red-700",
  accentHover: "hover:bg-red-800",
  accentBorderHover: "hover:border-red-800",
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
  headerBar: "bg-neutral-950 border-b-2 border-red-700",
  headerTitle: "text-white",
  headerMuted: "text-amber-200",
  markText: "text-amber-300",
  footerBar:
    "mt-auto border-t-4 border-amber-400 bg-neutral-950 text-slate-300",
};

const italianTheme: LanguageTheme = {
  accent: "bg-green-700",
  accentHover: "hover:bg-green-800",
  accentBorderHover: "hover:border-green-800",
  accentSoft: "bg-green-50",
  accentBorder: "border-green-200",
  accentText: "text-green-800",
  focus: "focus-visible:outline-green-700",
  progress: "bg-red-500",
  progressTrack: "bg-slate-200",
  radio:
    "checked:border-green-600 checked:bg-[radial-gradient(circle,_#16a34a_35%,_white_40%)]",
  selectedOption: "has-[:checked]:border-green-600 has-[:checked]:bg-green-50",
  optionHover: "hover:border-green-400 hover:bg-green-50",
  kicker: "text-red-700",
  headerBar: "bg-green-700",
  headerTitle: "text-slate-900",
  headerMuted: "text-slate-500",
  markText: "text-white",
  footerBar: "mt-auto border-t border-green-900 bg-green-950 text-green-100",
};

// Language navigation and visual tokens are isolated here so the German
// identity cannot bleed into the existing Irish quiz.
export const languageConfig: Record<LangCode, LanguageConfig> = {
  ga: {
    links: [
      {
        href: "https://langkraft.app/learn/irish",
        title: "LangKraft Irish Course",
        description: "A fun and effective way to learn Irish.",
      },
      {
        href: "https://comhra.irish",
        title: "Comhrá.Irish",
        description: "A place to practice Irish everyday with others.",
      },
      {
        href: "https://www.youtube.com/@storiesinirish7621",
        title: "Youtube",
        description: "Children's stories in Irish.",
      },
      {
        href: "https://irishstories.ie",
        title: "Lessons",
        description: "Take a lesson with a native speaker.",
      },
      {
        href: "Skool",
        title: "Skool Community",
        description: "Learn Irish with Eanna",
      },
    ],
    theme: irishTheme,
  },
  de: {
    links: [
      {
        href: "https://langkraft.ie/learn/german",
        title: "LangKraft German Course",
        description: "A fun and effective way to learn German.",
      },
    ],
    theme: germanTheme,
  },
  ru: { links: [], theme: irishTheme },
  it: { links: [], theme: italianTheme },
};

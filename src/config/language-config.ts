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
export type SeoPageSection = { heading: string; paragraphs: string[] };
export type SeoContentPage = {
  slug: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  sections: SeoPageSection[];
  ctaLabel: string;
};
export type LanguageSeoConfig = {
  homeTitle: string;
  homeDescription: string;
  homeHeading: string;
  homeIntro: string;
  homeSections: SeoPageSection[];
  pages: SeoContentPage[];
};
export type LanguageConfig = {
  links: LanguageLink[];
  theme: LanguageTheme;
  seo?: LanguageSeoConfig;
};

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
    "data-picked:border-emerald-600 data-picked:bg-[radial-gradient(circle,_#059669_35%,_white_40%)]",
  selectedOption:
    "data-picked:border-emerald-600 data-picked:bg-emerald-50",
  optionHover: "fine-hover:border-emerald-400 fine-hover:bg-emerald-50",
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
    "data-picked:border-red-700 data-picked:bg-[radial-gradient(circle,_#b91c1c_35%,_white_40%)]",
  selectedOption: "data-picked:border-red-700 data-picked:bg-amber-50",
  optionHover: "fine-hover:border-amber-400 fine-hover:bg-amber-50",
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
    "data-picked:border-green-600 data-picked:bg-[radial-gradient(circle,_#16a34a_35%,_white_40%)]",
  selectedOption: "data-picked:border-green-600 data-picked:bg-green-50",
  optionHover: "fine-hover:border-green-400 fine-hover:bg-green-50",
  kicker: "text-red-700",
  headerBar: "bg-green-700",
  headerTitle: "text-slate-900",
  headerMuted: "text-slate-500",
  markText: "text-white",
  footerBar: "mt-auto border-t border-green-900 bg-green-950 text-green-100",
};

const frenchTheme: LanguageTheme = {
  accent: "bg-blue-800",
  accentHover: "hover:bg-blue-900",
  accentBorderHover: "hover:border-blue-900",
  accentSoft: "bg-blue-50",
  accentBorder: "border-blue-200",
  accentText: "text-blue-800",
  focus: "focus-visible:outline-blue-800",
  progress: "bg-red-600",
  progressTrack: "bg-slate-200",
  radio:
    "data-picked:border-blue-800 data-picked:bg-[radial-gradient(circle,_#1e40af_35%,_white_40%)]",
  selectedOption: "data-picked:border-blue-800 data-picked:bg-blue-50",
  optionHover: "fine-hover:border-blue-400 fine-hover:bg-blue-50",
  kicker: "text-red-700",
  headerBar: "bg-blue-800 border-b-4 border-red-600",
  headerTitle: "text-white",
  headerMuted: "text-blue-100",
  markText: "text-white",
  footerBar: "mt-auto border-t-4 border-red-600 bg-blue-950 text-blue-100",
};

const hungarianTheme: LanguageTheme = {
  accent: "bg-red-700",
  accentHover: "hover:bg-red-800",
  accentBorderHover: "hover:border-red-800",
  accentSoft: "bg-red-50",
  accentBorder: "border-red-200",
  accentText: "text-red-800",
  focus: "focus-visible:outline-red-700",
  progress: "bg-green-700",
  progressTrack: "bg-slate-200",
  radio:
    "data-picked:border-red-700 data-picked:bg-[radial-gradient(circle,_#b91c1c_35%,_white_40%)]",
  selectedOption: "data-picked:border-red-700 data-picked:bg-red-50",
  optionHover: "fine-hover:border-red-300 fine-hover:bg-red-50",
  kicker: "text-green-800",
  headerBar: "bg-red-700 border-b-4 border-green-700",
  headerTitle: "text-white",
  headerMuted: "text-red-100",
  markText: "text-white",
  footerBar: "mt-auto border-t-4 border-green-600 bg-red-950 text-red-100",
};

const spanishTheme: LanguageTheme = {
  accent: "bg-red-700",
  accentHover: "hover:bg-red-800",
  accentBorderHover: "hover:border-red-800",
  accentSoft: "bg-red-50",
  accentBorder: "border-red-200",
  accentText: "text-red-800",
  focus: "focus-visible:outline-red-700",
  progress: "bg-yellow-400",
  progressTrack: "bg-slate-200",
  radio:
    "data-picked:border-red-700 data-picked:bg-[radial-gradient(circle,_#b91c1c_35%,_white_40%)]",
  selectedOption: "data-picked:border-red-700 data-picked:bg-red-50",
  optionHover: "fine-hover:border-yellow-400 fine-hover:bg-red-50",
  kicker: "text-yellow-600",
  headerBar: "bg-red-700 border-b-4 border-yellow-400",
  headerTitle: "text-white",
  headerMuted: "text-red-100",
  markText: "text-white",
  footerBar: "mt-auto border-t-4 border-yellow-400 bg-red-950 text-red-100",
};

const farsiTheme: LanguageTheme = {
  accent: "bg-green-700",
  accentHover: "hover:bg-green-800",
  accentBorderHover: "hover:border-green-800",
  accentSoft: "bg-green-50",
  accentBorder: "border-green-200",
  accentText: "text-green-800",
  focus: "focus-visible:outline-green-700",
  progress: "bg-red-600",
  progressTrack: "bg-slate-200",
  radio:
    "data-picked:border-green-700 data-picked:bg-[radial-gradient(circle,_#15803d_35%,_white_40%)]",
  selectedOption: "data-picked:border-green-700 data-picked:bg-green-50",
  optionHover: "fine-hover:border-green-400 fine-hover:bg-green-50",
  kicker: "text-red-700",
  headerBar: "bg-white border-t-4 border-b-4 border-t-green-700 border-b-red-600",
  headerTitle: "text-slate-900",
  headerMuted: "text-slate-500",
  markText: "text-white",
  footerBar: "mt-auto border-t-4 border-red-600 bg-green-950 text-green-100",
};

const chineseTheme: LanguageTheme = {
  accent: "bg-red-700",
  accentHover: "hover:bg-red-800",
  accentBorderHover: "hover:border-red-800",
  accentSoft: "bg-red-50",
  accentBorder: "border-red-200",
  accentText: "text-red-800",
  focus: "focus-visible:outline-red-700",
  progress: "bg-red-700",
  progressTrack: "bg-slate-200",
  radio:
    "data-picked:border-red-600 data-picked:bg-[radial-gradient(circle,_#dc2626_35%,_white_40%)]",
  selectedOption: "data-picked:border-red-600 data-picked:bg-red-50",
  optionHover: "fine-hover:border-red-300 fine-hover:bg-red-50",
  kicker: "text-red-700",
  headerBar: "bg-red-800 border-b-2 border-yellow-400",
  headerTitle: "text-white",
  headerMuted: "text-red-100",
  markText: "text-white",
  footerBar: "mt-auto border-t-4 border-yellow-400 bg-red-950 text-red-100",
};

const gaelicTheme: LanguageTheme = {
  accent: "bg-blue-800",
  accentHover: "hover:bg-blue-900",
  accentBorderHover: "hover:border-blue-900",
  accentSoft: "bg-blue-50",
  accentBorder: "border-blue-200",
  accentText: "text-blue-800",
  focus: "focus-visible:outline-blue-800",
  progress: "bg-blue-700",
  progressTrack: "bg-slate-200",
  radio:
    "data-picked:border-blue-800 data-picked:bg-[radial-gradient(circle,_#1e40af_35%,_white_40%)]",
  selectedOption: "data-picked:border-blue-800 data-picked:bg-blue-50",
  optionHover: "fine-hover:border-blue-400 fine-hover:bg-blue-50",
  kicker: "text-slate-600",
  headerBar: "bg-blue-900 border-b-4 border-white",
  headerTitle: "text-white",
  headerMuted: "text-blue-100",
  markText: "text-white",
  footerBar: "mt-auto border-t-4 border-white bg-blue-950 text-blue-100",
};

const welshTheme: LanguageTheme = {
  accent: "bg-red-700",
  accentHover: "hover:bg-red-800",
  accentBorderHover: "hover:border-red-800",
  accentSoft: "bg-green-50",
  accentBorder: "border-green-200",
  accentText: "text-red-800",
  focus: "focus-visible:outline-red-700",
  progress: "bg-green-700",
  progressTrack: "bg-slate-200",
  radio:
    "data-picked:border-red-700 data-picked:bg-[radial-gradient(circle,_#b91c1c_35%,_white_40%)]",
  selectedOption: "data-picked:border-red-700 data-picked:bg-green-50",
  optionHover: "fine-hover:border-green-400 fine-hover:bg-green-50",
  kicker: "text-green-800",
  headerBar: "bg-green-700 border-b-4 border-red-700",
  headerTitle: "text-white",
  headerMuted: "text-green-100",
  markText: "text-white",
  footerBar: "mt-auto border-t-4 border-red-700 bg-green-950 text-green-100",
};

const czechTheme: LanguageTheme = {
  accent: "bg-blue-800",
  accentHover: "hover:bg-blue-900",
  accentBorderHover: "hover:border-blue-900",
  accentSoft: "bg-red-50",
  accentBorder: "border-red-200",
  accentText: "text-blue-800",
  focus: "focus-visible:outline-blue-800",
  progress: "bg-red-600",
  progressTrack: "bg-slate-200",
  radio:
    "data-picked:border-blue-800 data-picked:bg-[radial-gradient(circle,_#1e40af_35%,_white_40%)]",
  selectedOption: "data-picked:border-blue-800 data-picked:bg-red-50",
  optionHover: "fine-hover:border-red-300 fine-hover:bg-red-50",
  kicker: "text-red-700",
  headerBar: "bg-blue-800 border-b-4 border-red-600",
  headerTitle: "text-white",
  headerMuted: "text-blue-100",
  markText: "text-white",
  footerBar: "mt-auto border-t-4 border-red-600 bg-blue-950 text-blue-100",
};

// Language navigation and visual tokens are isolated here so language identities stay separate.
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
    seo: {
      homeTitle: "Free Daily Irish Language Quiz | Test Your Gaeilge",
      homeDescription: "Take a free daily Irish language quiz: five fresh questions across CEFR levels A1 to B2. Answer each question correctly to move on and score how many you get right first time. No sign-up needed.",
      homeHeading: "Test your Irish with a free daily Irish language quiz",
      homeIntro: "Take five fresh Irish questions every day, with questions drawn from four CEFR levels: A1, A2, B1 and B2. The mix changes daily, so each visit brings a new challenge.",
      homeSections: [
        {
          heading: "Five questions, one at a time",
          paragraphs: [
            "Answer each question correctly to unlock the next one. Your result is based on how many questions you answer correctly on your first attempt, out of five. You can take part for free, with no account or registration.",
          ],
        },
        {
          heading: "Questions from beginner to upper-intermediate",
          paragraphs: [
            "The daily challenge includes Irish questions at A1 beginner, A2 elementary, B1 intermediate and B2 upper-intermediate level. Because the five-question mix changes each day, you get to practise different parts of your Irish over time.",
          ],
        },
      ],
      pages: [
        {
          slug: "irish-levels",
          title: "Irish Language Levels A1 to B2 Explained | Daily Irish Quiz",
          description: "Learn what A1, A2, B1 and B2 mean for Irish learners, and how the five-question Daily Irish Quiz uses these CEFR levels.",
          heading: "Irish language levels: what do A1, A2, B1 and B2 mean?",
          intro: "The Daily Irish Quiz gives you five new Irish questions each day. Questions are drawn from four CEFR levels, from A1 beginner to B2 upper-intermediate, so your daily challenge can include a mixture of easier and more demanding questions.",
          sections: [
            {
              heading: "A1 — Beginner",
              paragraphs: ["Understand and use familiar everyday expressions, introduce yourself, and answer simple questions when someone speaks slowly and clearly."],
            },
            {
              heading: "A2 — Elementary",
              paragraphs: ["Understand common phrases about everyday topics such as family, work, shopping and your immediate surroundings, and communicate in simple routine situations."],
            },
            {
              heading: "B1 — Intermediate",
              paragraphs: ["Understand the main points of clear speech and writing on familiar topics, manage many situations while travelling, and describe experiences or plans."],
            },
            {
              heading: "B2 — Upper-intermediate",
              paragraphs: ["Understand the main ideas of more complex material, communicate with greater fluency, and explain opinions on a range of topics."],
            },
            {
              heading: "How the Daily Irish Quiz works",
              paragraphs: [
                "Every day you get five fresh questions. The questions can come from any of the four levels, and the combination changes from day to day. You answer one question at a time and must get it right before you can move on to the next.",
                "Your score is based on how many of the five questions you answer correctly on your first attempt. It is a daily practice score, not an official CEFR assessment or a formal measure of your overall Irish proficiency.",
                "There is no account to create and no subscription. Just take the daily challenge and come back tomorrow for five more questions.",
              ],
            },
          ],
          ctaLabel: "Take today's Irish quiz",
        },
      ],
    },
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
  zh: { links: [], theme: chineseTheme },
  hu: { links: [], theme: hungarianTheme },
  fr: { links: [], theme: frenchTheme },
  es: { links: [], theme: spanishTheme },
  gd: { links: [], theme: gaelicTheme },
  cy: { links: [], theme: welshTheme },
  cs: { links: [], theme: czechTheme },
  fa: { links: [], theme: farsiTheme },
};

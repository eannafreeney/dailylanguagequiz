export const DOMAIN_TO_LANG: Record<string, string> = {
  "dailyirishquiz.com": "ga",
  "www.dailyirishquiz.com": "ga",
  "dailygermanquiz.com": "de",
  "www.dailygermanquiz.com": "de",
  "dailychinesequiz.com": "zh",
  "www.dailychinesequiz.com": "zh",
  localhost: "ga",
  "127.0.0.1": "ga",
  "ga.localhost": "ga",
  "de.localhost": "de",
  "it.localhost": "it",
  "zh.localhost": "zh",
  "hu.localhost": "hu",
  "fr.localhost": "fr",
  "fa.localhost": "fa",
  "es.localhost": "es",
  "gd.localhost": "gd",
  "cy.localhost": "cy",
  "cs.localhost": "cs",
};

// Hosts above the local entries. Add a domain here and the footer link appears.
export const REGISTERED_LANGS = new Set(
  Object.entries(DOMAIN_TO_LANG)
    .filter(([host]) => !host.endsWith("localhost") && host !== "127.0.0.1")
    .map(([, code]) => code),
);

// A hub lists every language. It stays out of DOMAIN_TO_LANG so it is not locked to one quiz.
export const HUB_HOSTS = new Set([
  "dailylanguagequiz.com",
  "www.dailylanguagequiz.com",
  "dailylanguagequiz.localhost",
]);

export const HOST_REDIRECTS: Record<string, string> = {
  "mydaily.irish": "https://dailyirishquiz.com",
  "www.mydaily.irish": "https://dailyirishquiz.com",
  "www.dailyirishquiz.com": "https://dailyirishquiz.com",
  "www.dailygermanquiz.com": "https://dailygermanquiz.com",
  "www.dailychinesequiz.com": "https://dailychinesequiz.com",
  "www.dailylanguagequiz.com": "https://dailylanguagequiz.com",
};

export const languages = [
  {
    langCode: "ga",
    htmlLang: "ga",
    name: "Gaeilge",
    englishName: "Irish",
    description:
      "Take a free daily Irish language quiz with five fresh questions across CEFR levels A1 to B2. Answer each question correctly to move on, and see how many you get right on your first try. No sign-up needed.",
    flag: "🇮🇪",
    siteName: "Daily Irish Quiz",
    siteUrl: "https://dailyirishquiz.com",
    published: true,
  },
  {
    langCode: "de",
    htmlLang: "de",
    name: "Deutsch",
    englishName: "German",
    description:
      "A free daily German quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇩🇪",
    siteName: "Daily German Quiz",
    siteUrl: "https://dailygermanquiz.com",
    published: true,
  },
  {
    langCode: "ru",
    htmlLang: "ru",
    name: "Русский",
    englishName: "Russian",
    description:
      "A free daily Russian quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇷🇺",
    siteName: "Daily Russian Quiz",
    published: false,
  },
  {
    langCode: "it",
    htmlLang: "it",
    name: "Italiano",
    englishName: "Italian",
    description:
      "A free daily Italian quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇮🇹",
    siteName: "Daily Italian Quiz",
    published: true,
  },
  {
    langCode: "hu",
    htmlLang: "hu",
    name: "Magyar",
    englishName: "Hungarian",
    description:
      "A free daily Hungarian quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇭🇺",
    siteName: "Daily Hungarian Quiz",
    published: true,
  },
  {
    langCode: "fr",
    htmlLang: "fr",
    name: "Français",
    englishName: "French",
    description:
      "A free daily French quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇫🇷",
    siteName: "Daily French Quiz",
    published: true,
  },
  {
    langCode: "es",
    htmlLang: "es",
    name: "Español",
    englishName: "Spanish",
    description:
      "A free daily Spanish quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇪🇸",
    siteName: "Daily Spanish Quiz",
    published: true,
  },
  {
    langCode: "gd",
    htmlLang: "gd",
    name: "Gàidhlig",
    englishName: "Scots Gaelic",
    description:
      "A free daily Scots Gaelic quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    siteName: "Daily Scots Gaelic Quiz",
    published: true,
  },
  {
    langCode: "cy",
    htmlLang: "cy",
    name: "Cymraeg",
    englishName: "Welsh",
    description:
      "A free daily Welsh quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    siteName: "Daily Welsh Quiz",
    published: true,
  },
  {
    langCode: "cs",
    htmlLang: "cs",
    name: "Čeština",
    englishName: "Czech",
    description:
      "A free daily Czech quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇨🇿",
    siteName: "Daily Czech Quiz",
    published: true,
  },
  {
    langCode: "fa",
    htmlLang: "fa",
    name: "فارسی",
    englishName: "Farsi",
    description:
      "A free daily Farsi quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇮🇷",
    siteName: "Daily Farsi Quiz",
    dir: "rtl",
    promptLang: "en",
    optionLang: "fa",
    published: false,
  },
  {
    langCode: "zh",
    htmlLang: "zh",
    name: "中文",
    englishName: "Chinese",
    description:
      "A daily Chinese quiz with five mixed-level questions. Practise Simplified and Traditional Chinese with pinyin, vocabulary, and grammar from A1 to B2.",
    flag: "🇹🇼 🇨🇳",
    siteName: "Daily Chinese Quiz",
    siteUrl: "https://dailychinesequiz.com",
    promptLang: "en",
    optionLang: "zh",
    // ponytail: the quiz switch is binary. A third orthography needs a picker.
    scripts: [
      { id: "simplified", label: "Simplified" },
      { id: "traditional", label: "Traditional" },
    ],
    published: true,
  },
];

export const publishedLanguages = languages.filter(
  (language) => language.published,
);

// Custom domains stay on their own host. Everyone else lives on the hub.
export function quizHref(
  language: { langCode: string; siteUrl?: string },
  onHub = false,
) {
  if (language.siteUrl) return language.siteUrl;
  const path = `/${language.langCode}`;
  return onHub ? path : `https://dailylanguagequiz.com${path}`;
}

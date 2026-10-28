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
    name: "Gaeilge",
    englishName: "Irish",
    description:
      "A free daily Irish quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇮🇪",
    siteName: "Daily Irish Quiz",
    siteUrl: "https://dailyirishquiz.com",
  },
  {
    langCode: "de",
    name: "Deutsch",
    englishName: "German",
    description:
      "A free daily German quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇩🇪",
    siteName: "Daily German Quiz",
    siteUrl: "https://dailygermanquiz.com",
  },
  {
    langCode: "ru",
    name: "Русский",
    englishName: "Russian",
    description:
      "A free daily Russian quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇷🇺",
    siteName: "Daily Russian Quiz",
  },
  {
    langCode: "it",
    name: "Italiano",
    englishName: "Italian",
    description:
      "A free daily Italian quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇮🇹",
    siteName: "Daily Italian Quiz",
    siteUrl: "https://dailyitalianquiz.com",
  },
  {
    langCode: "zh",
    name: "中文",
    englishName: "Chinese",
    description:
      "A daily Chinese quiz with five mixed-level questions. Practise Simplified and Traditional Chinese with pinyin, vocabulary, and grammar from A1 to B2.",
    flag: "🇹🇼 🇨🇳",
    siteName: "Daily Chinese Quiz",
    siteUrl: "https://dailychinesequiz.com",
  },
];

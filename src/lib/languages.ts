export const DOMAIN_TO_LANG: Record<string, string> = {
  "dailyirishquiz.com": "ga",
  "www.dailyirishquiz.com": "ga",
  "dailygermanquiz.com": "de",
  "www.dailygermanquiz.com": "de",
  localhost: "ga",
  "127.0.0.1": "ga",
  "ga.localhost": "ga",
  "de.localhost": "de",
  "it.localhost": "it",
  "zh.localhost": "zh",
};

export const HOST_REDIRECTS: Record<string, string> = {
  "mydaily.irish": "https://dailyirishquiz.com",
  "www.mydaily.irish": "https://dailyirishquiz.com",
  "www.dailyirishquiz.com": "https://dailyirishquiz.com",
  "www.dailygermanquiz.com": "https://dailygermanquiz.com",
};

export const languages = [
  {
    langCode: "ga",
    name: "Gaeilge",
    englishName: "Irish",
    description:
      "A free daily Irish quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇮🇪",
    siteName: "My Daily Irish",
    siteUrl: "https://dailyirishquiz.com",
  },
  {
    langCode: "de",
    name: "Deutsch",
    englishName: "German",
    description:
      "A free daily German quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇩🇪",
    siteName: "My Daily German",
    siteUrl: "https://dailygermanquiz.com",
  },
  {
    langCode: "ru",
    name: "Русский",
    englishName: "Russian",
    description:
      "A free daily Russian quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇷🇺",
    siteName: "My Daily Russian",
  },
  {
    langCode: "it",
    name: "Italiano",
    englishName: "Italian",
    description:
      "A free daily Italian quiz with five short questions. Practise phrases, grammar, and everyday sentences, a little at a time.",
    flag: "🇮🇹",
    siteName: "My Daily Italian",
    siteUrl: "https://dailyitalianquiz.com",
  },
  {
    langCode: "zh",
    name: "中文",
    englishName: "Chinese",
    description:
      "A daily Chinese quiz with ten mixed-level questions. Practise Simplified and Traditional Chinese with pinyin, vocabulary, and grammar from A1 to B2.",
    flag: "🇨🇳",
    siteName: "My Daily Chinese",
  },
];

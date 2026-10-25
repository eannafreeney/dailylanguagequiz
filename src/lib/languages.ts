export const DOMAIN_TO_LANG: Record<string, string> = {
  "dailyirishquiz.com": "ga",
  "www.dailyirishquiz.com": "ga",
  "dailygermanquiz.com": "de",
  "www.dailygermanquiz.com": "de",
  localhost: "ga",
  "127.0.0.1": "ga",
  "ga.localhost": "ga",
  "de.localhost": "de",
};

export const HOST_REDIRECTS: Record<string, string> = {
  "mydaily.irish": "https://dailyirishquiz.com",
  "www.mydaily.irish": "https://dailyirishquiz.com",
};

export const languages = [
  {
    langCode: "ga",
    name: "Gaeilge",
    englishName: "Irish",
    description: "Build your Irish, five questions at a time.",
    flag: "🇮🇪",
    siteName: "My Daily Irish",
    siteUrl: "https://dailyirishquiz.com",
  },
  {
    langCode: "de",
    name: "Deutsch",
    englishName: "German",
    description: "Practise German a little every day.",
    flag: "🇩🇪",
    siteName: "My Daily German",
    siteUrl: "https://dailygermanquiz.com",
  },
  {
    langCode: "ru",
    name: "Русский",
    englishName: "Russian",
    description: "Build your Russian vocabulary daily.",
    flag: "🇷🇺",
    siteName: "My Daily Russian",
  },
];

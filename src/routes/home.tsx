import { languages, REGISTERED_LANGS } from "../lib/languages";

const hubUrl = "https://dailylanguagequiz.com/";

const published = languages.filter(
  (language) => language.siteUrl && REGISTERED_LANGS.has(language.langCode),
);

const HomePage = () => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Daily Language Quiz</title>
      <meta
        name="description"
        content="A free daily quiz in Irish, German, and Chinese. Five short questions, a little at a time."
      />
      <link rel="canonical" href={hubUrl} />
      <meta property="og:title" content="Daily Language Quiz" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={hubUrl} />
      <link rel="stylesheet" href="/tailwind.css" />
    </head>
    <body class="bg-white text-slate-900">
      <header class="border-b border-slate-200">
        <div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            D.
          </span>
          <span class="text-lg font-bold tracking-tight">
            Daily Language Quiz
          </span>
          <a href="/account" class="ml-auto rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Account &amp; leaderboard</a>
        </div>
      </header>
      <main class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Five questions a day.
        </h1>
        <p class="mt-3 max-w-xl leading-7 text-slate-600">
          Pick a language. Each quiz is five short questions, and the set
          changes every day.
        </p>
        <ul class="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2">
          {published.map((language) => (
            <li key={language.langCode}>
              <a
                href={language.siteUrl}
                class="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400"
              >
                <span class="text-2xl" aria-hidden="true">
                  {language.flag}
                </span>
                <span class="mt-3 text-lg font-bold">
                  {language.englishName}
                </span>
                <span class="text-sm text-slate-500">{language.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </body>
  </html>
);

export default HomePage;

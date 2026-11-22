import type { PropsWithChildren } from "hono/jsx";
import Header from "./Header";
import Footer from "./Footer";
import Newsletter from "./Newsletter";
import { LangCode } from "../types";
import { languages } from "../lib/languages";

type Props = PropsWithChildren<{ langCode: LangCode }>;

const Layout = ({ langCode, children }: Props) => {
  const language = languages.find((item) => item.langCode === langCode);
  if (!language) return null;
  const { siteName, siteUrl, englishName, description } = language;

  const questionCount = 5;
  const pageTitle = `Daily ${englishName} quiz — ${questionCount} questions a day`;
  const kicker = `Daily practice — ${questionCount} questions a day.`;
  const canonical = siteUrl ? `${siteUrl}/` : undefined;

  return (
    <html lang="en" data-theme="emerald">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#047857" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icons/app-icon.svg" type="image/svg+xml" />
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        {canonical && <link rel="canonical" href={canonical} />}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="en" />
        {canonical && <meta property="og:url" content={canonical} />}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <link rel="stylesheet" href="/tailwind.css" />
        <script defer src="/register-sw.js"></script>
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@0.12.7/dist/cdn.min.js"
        ></script>
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"
        ></script>
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
        ></script>
      </head>
      <body class="bg-white">
        <Header title={siteName} langCode={langCode} />
        <main class="my-4 max-w-6xl mx-auto">{children}</main>
        <Footer title={siteName} kicker={kicker} langCode={langCode} />
        {siteUrl && <Newsletter langCode={langCode} />}
        <div class="fixed bottom-5 left-4 z-50 sm:bottom-6 sm:left-6" id="install-app-container">
          <button id="install-app-button" type="button" class="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-900/10 transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
            <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 7v8m-3-3 3 3 3-3M9 18h6"/></svg>
            Install App
          </button>
          <div id="install-app-help" hidden class="mb-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-xl">
            <p class="font-semibold text-slate-900">Add Daily Quiz to your home screen</p>
            <p id="install-app-help-copy" class="mt-2 leading-6">Use your browser menu and choose “Install app” or “Add to Home Screen”.</p>
            <button id="install-app-help-close" type="button" class="mt-3 font-semibold text-emerald-700">Got it</button>
          </div>
        </div>
      </body>
    </html>
  );
};
export default Layout;

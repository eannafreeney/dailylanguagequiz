import type { PropsWithChildren } from "hono/jsx";
import { raw } from "hono/html";
import Header from "./Header";
import Footer from "./Footer";
import Newsletter from "./Newsletter";
import { LangCode } from "../types";
import { languages } from "../lib/languages";
import { shareQuizResultClientScript } from "../../client/shareQuizResult";
import { streakClientScript } from "../lib/streak";

type Props = PropsWithChildren<{
  langCode: LangCode;
  pageTitle?: string;
  pageDescription?: string;
  canonicalPath?: string;
}>;

const Layout = ({
  langCode,
  children,
  pageTitle,
  pageDescription,
  canonicalPath = "/",
}: Props) => {
  const language = languages.find((item) => item.langCode === langCode);
  if (!language) return null;
  const { siteName, siteUrl, englishName, description } = language;
  const htmlLang = language.htmlLang ?? language.langCode;

  const questionCount = 5;
  const defaultTitle = `Daily ${englishName} quiz — ${questionCount} questions a day`;
  const title = pageTitle ?? defaultTitle;
  const metaDescription = pageDescription ?? description;
  const kicker = `Daily practice — ${questionCount} questions a day.`;
  const canonical = siteUrl ? `${siteUrl}${canonicalPath}` : undefined;

  return (
    <html lang={htmlLang} data-theme="emerald">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
        {canonical && <link rel="canonical" href={canonical} />}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content={htmlLang} />
        {canonical && <meta property="og:url" content={canonical} />}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        <link rel="stylesheet" href="/tailwind.css" />
        <script>{raw(streakClientScript())}</script>
        <script>{raw(shareQuizResultClientScript())}</script>
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
        <script
          defer
          src="https://marketing-hq.onrender.com/marketing-hq-analytics.js"
        ></script>
      </head>
      <body class="bg-white">
        <Header title={siteName} langCode={langCode} />
        <main class="my-4 max-w-6xl mx-auto">{children}</main>
        <Footer title={siteName} kicker={kicker} langCode={langCode} />
        {siteUrl && <Newsletter langCode={langCode} />}
      </body>
    </html>
  );
};
export default Layout;

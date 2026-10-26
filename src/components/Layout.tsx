import type { PropsWithChildren } from "hono/jsx";
import Header from "./Header";
import Footer from "./Footer";
import { LangCode } from "../types";
import { languages } from "../lib/languages";
import { quizzes } from "../lib/quizzes";

type Props = PropsWithChildren<{ langCode: LangCode }>;

const Layout = ({ langCode, children }: Props) => {
  const language = languages.find((item) => item.langCode === langCode);
  if (!language) return null;
  const { siteName, siteUrl, flag, englishName, description } = language;
  const title = `${flag} ${englishName}`;
  const pageTitle = `Daily ${englishName} quiz — five questions a day`;
  const kicker = "Daily practice — five questions a day.";
  const canonical = siteUrl ? `${siteUrl}/` : undefined;

  return (
    <html lang="en" data-theme="emerald">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        <script defer src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@0.12.7/dist/cdn.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
      </head>
      <body class="bg-white">
        <Header title={title} kicker={kicker} questionCount={quizzes[langCode as keyof typeof quizzes].length} langCode={langCode} />
        <main class="my-4 px-4">{children}</main>
        <Footer title={title} kicker={kicker} langCode={langCode} />
      </body>
    </html>
  );
};
export default Layout;

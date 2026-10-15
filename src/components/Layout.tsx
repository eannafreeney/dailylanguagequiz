import type { PropsWithChildren } from "hono/jsx";
import Header from "./Header";
import Footer from "./Footer";
import { LangCode } from "../types";
import { languages } from "../lib/languages";

type Props = PropsWithChildren<{
  langCode: LangCode;
}>;

const Layout = ({ langCode, children }: Props) => {
  const language = languages.find((language) => language.langCode === langCode);
  if (!language) {
    return null;
  }
  const { siteName, flag, englishName } = language;

  const title = `${flag} ${englishName}`;
  const kicker = "Daily practice — five questions a day.";

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{siteName}</title>
        <link rel="stylesheet" href="/tailwind.css" />
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
      <body>
        <Header title={title} kicker={kicker} />
        <main class="my-4 px-4">{children}</main>
        <Footer title={title} kicker={kicker} />
      </body>
    </html>
  );
};

export default Layout;

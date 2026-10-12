import type { FC, PropsWithChildren } from "hono/jsx";
import Header from "./Header";
import Footer from "./Footer";

type Props = PropsWithChildren<{
  title: string;
  languageName: string;
  siteName: string;
}>;

const Layout = ({ title, languageName, siteName, children }: Props) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
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
        <Header siteName={siteName} languageName={languageName} />
        <main class="my-4 px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
};

export default Layout;

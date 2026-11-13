import Layout from "./Layout";
import type { LangCode } from "../types";
import type { SeoContentPage } from "../config/language-config";

type Props = { langCode: LangCode; page: SeoContentPage };

const SeoPage = ({ langCode, page }: Props) => (
  <Layout
    langCode={langCode}
    pageTitle={page.title}
    pageDescription={page.description}
    canonicalPath={`/${page.slug}`}
  >
    <article class="mx-auto my-10 max-w-3xl space-y-7 px-4 leading-7 text-slate-700">
      <header class="space-y-3">
        <h1 class="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {page.heading}
        </h1>
        <p class="text-lg">{page.intro}</p>
      </header>
      {page.sections.map((section) => (
        <section key={section.heading} class="space-y-3">
          <h2 class="text-2xl font-bold text-slate-950">{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      ))}
      <section class="rounded-2xl bg-slate-100 p-6">
        <h2 class="text-xl font-bold text-slate-950">Ready for today's challenge?</h2>
        <a
          href="/"
          class="mt-4 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          {page.ctaLabel}
        </a>
      </section>
    </article>
  </Layout>
);

export default SeoPage;

import { LangCode } from "../types";
import Layout from "../components/Layout";
import QuizPanel from "../components/QuizPanel";
import { languageConfig } from "../config/language-config";
import { languages } from "../lib/languages";
import { getDailyQuestions } from "../utils";

type Props = { langCode: LangCode };

const LanguagePage = ({ langCode }: Props) => {
  const language = languages.find((item) => item.langCode === langCode);
  if (!language) return null;
  const seo = languageConfig[langCode].seo;
  const dailyQuestions = getDailyQuestions(langCode);
  const firstQuestion = dailyQuestions[0];

  return (
    <Layout
      langCode={langCode}
      pageTitle={seo?.homeTitle}
      pageDescription={seo?.homeDescription}
    >
      <section class="mx-auto flex flex-col gap-6 my-6">
        <QuizPanel
          question={firstQuestion}
          questionNumber={0}
          totalQuestions={dailyQuestions.length}
          langCode={langCode}
        />
      </section>
      {seo && (
        <section class="mx-auto my-12 max-w-3xl space-y-5 px-4 leading-7 text-slate-700">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-slate-950">
              {seo.homeHeading}
            </h1>
            <p class="mt-3">{seo.homeIntro}</p>
          </div>
          {seo.homeSections.map((section) => (
            <div key={section.heading}>
              <h2 class="text-xl font-bold text-slate-950">{section.heading}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} class="mt-2">{paragraph}</p>
              ))}
            </div>
          ))}
          {seo.pages.map((page) => (
            <p key={page.slug}>
              <a
                href={`/${page.slug}`}
                class="font-semibold text-slate-800 underline underline-offset-4 hover:text-slate-950"
              >
                {page.heading}
              </a>
            </p>
          ))}
        </section>
      )}
    </Layout>
  );
};
export default LanguagePage;

import { LangCode } from "../types";
import Layout from "../components/Layout";
import QuizPanel from "../components/QuizPanel";
import { languages } from "../lib/languages";
import { getDailyQuestions } from "../utils";

type Props = { langCode: LangCode };

const LanguagePage = ({ langCode }: Props) => {
  const language = languages.find((item) => item.langCode === langCode);
  if (!language) return null;
  const dailyQuestions = getDailyQuestions(langCode);
  const firstQuestion = dailyQuestions[0];

  return (
    <Layout
      langCode={langCode}
      pageTitle={
        langCode === "ga"
          ? "Free Daily Irish Language Quiz | Test Your Gaeilge"
          : undefined
      }
    >
      <section class="mx-auto flex flex-col gap-6 my-6">
        <QuizPanel
          question={firstQuestion}
          questionNumber={0}
          totalQuestions={dailyQuestions.length}
          langCode={langCode}
        />
      </section>
      {langCode === "ga" && (
        <section class="mx-auto my-12 max-w-3xl space-y-5 px-4 leading-7 text-slate-700">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-slate-950">
              Test your Irish with a free daily Irish language quiz
            </h1>
            <p class="mt-3">
              Take five fresh Irish questions every day, with questions drawn
              from four CEFR levels: A1, A2, B1 and B2. The mix changes daily,
              so each visit brings a new challenge.
            </p>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-950">
              Five questions, one at a time
            </h2>
            <p class="mt-2">
              Answer each question correctly to unlock the next one. Your
              result is based on how many questions you answer correctly on
              your first attempt, out of five. You can take part for free, with
              no account or registration.
            </p>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-950">
              Questions from beginner to upper-intermediate
            </h2>
            <p class="mt-2">
              The daily challenge includes Irish questions at A1 beginner, A2
              elementary, B1 intermediate and B2 upper-intermediate level.
              Because the five-question mix changes each day, you get to
              practise different parts of your Irish over time.
            </p>
            <a
              href="/irish-levels"
              class="mt-3 inline-flex font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-950"
            >
              Learn what the A1, A2, B1 and B2 levels mean
            </a>
          </div>
        </section>
      )}
    </Layout>
  );
};
export default LanguagePage;

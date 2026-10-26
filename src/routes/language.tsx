import { LangCode } from "../types";
import Layout from "../components/Layout";
import Question from "../components/Question";
import { languages } from "../lib/languages";
import { getDailyQuestions } from "../utils";
import ReminderPanel from "../components/ReminderPanel";

type Props = { langCode: LangCode };

const LanguagePage = ({ langCode }: Props) => {
  const language = languages.find((item) => item.langCode === langCode);
  if (!language) return null;
  const dailyQuestions = getDailyQuestions(langCode);
  const firstQuestion = dailyQuestions[0];

  return (
    <Layout langCode={langCode}>
      <section class="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">
            Daily {language.englishName} quiz
          </h1>
          <p class="mt-2 text-base leading-relaxed text-slate-600">{language.description}</p>
        </div>
        <ReminderPanel langCode={langCode} />
        <div id="quiz">
          <Question
            question={firstQuestion}
            questionNumber={0}
            totalQuestions={dailyQuestions.length}
            langCode={langCode}
          />
        </div>
      </section>
    </Layout>
  );
};
export default LanguagePage;

import { LangCode } from "../types";
import Layout from "../components/Layout";
import Question from "../components/Question";
import { languages } from "../lib/languages";
import { getDailyQuestions } from "../utils";
import ReminderPanel from "../components/ReminderPanel";

type Props = { langCode: LangCode };

const LanguagePage = ({ langCode }: Props) => {
  const dailyQuestions = getDailyQuestions(langCode);
  const firstQuestion = dailyQuestions[0];
  const language = languages.find((language) => language.langCode === langCode);
  return (
    <Layout langCode={langCode}>
      <section class="mx-auto flex max-w-2xl flex-col gap-6">
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

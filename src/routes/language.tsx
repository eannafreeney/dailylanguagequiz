import { LangCode } from "../types";
import Layout from "../components/Layout";
import Question from "../components/Question";
import { languages } from "../lib/languages";
import { getDailyQuestions } from "../utils";
import SponsorStack from "../components/SponsorStack";

type Props = { langCode: LangCode };

const LanguagePage = ({ langCode }: Props) => {
  const language = languages.find((item) => item.langCode === langCode);
  if (!language) return null;
  const dailyQuestions = getDailyQuestions(langCode);
  const firstQuestion = dailyQuestions[0];

  return (
    <Layout langCode={langCode}>
      <section class="mx-auto flex flex-col gap-6 my-6">
        <Question
          question={firstQuestion}
          questionNumber={0}
          totalQuestions={dailyQuestions.length}
          langCode={langCode}
        />
      </section>
      <SponsorStack langCode={langCode} />
    </Layout>
  );
};
export default LanguagePage;

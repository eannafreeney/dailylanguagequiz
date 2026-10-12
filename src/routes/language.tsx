import { LangCode } from "../types";
import Layout from "../components/Layout";
import Question from "../components/Question";
import { languages } from "../lib/languages";
import { getDailyQuestions } from "../utils";

type Props = {
  langCode: LangCode;
};

const LanguagePage = ({ langCode }: Props) => {
  const dailyQuestions = getDailyQuestions(langCode);
  const firstQuestion = dailyQuestions[0];

  const language = languages.find((language) => language.langCode === langCode);

  return (
    <Layout
      title={language?.siteName ?? ""}
      languageName={language?.name ?? ""}
      siteName={language?.siteName ?? ""}
    >
      <section class="flex flex-col gap-6 mx-auto max-w-2xl ">
        <div>
          <h1 class="text-3xl font-bold">
            {language?.flag} {language?.name}
          </h1>
          <p class=" text-gray-600">
            {language?.englishName} practice — five questions a day.
          </p>
        </div>

        <div id="quiz" class="">
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

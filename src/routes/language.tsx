import { LangCode } from "../types";
import Layout from "../components/Layout";
import Question from "../components/Question";
import { languages } from "../lib/languages";
import { getDailyQuestions } from "../utils";

type Props = { langCode: LangCode };

const LanguagePage = ({ langCode }: Props) => {
  const dailyQuestions = getDailyQuestions(langCode);
  const firstQuestion = dailyQuestions[0];
  const language = languages.find((language) => language.langCode === langCode);
  return (
    <Layout title={language?.siteName ?? ""} languageName={language?.name ?? ""} siteName={language?.siteName ?? ""}>
      <section class="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 class="text-3xl font-bold">{language?.flag} {language?.name}</h1>
          <p class="text-gray-600">{language?.englishName} practice — five questions a day.</p>
        </div>
        <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 class="text-lg font-semibold text-slate-900">Get your daily quiz by email</h2>
          <p class="mt-1 text-sm text-slate-600">A gentle reminder at 8:00 AM Dublin time, with a link straight back to the quiz.</p>
          <form action="/subscribe" method="post" class="mt-4 flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="langCode" value={langCode} />
            <label class="sr-only" for="daily-quiz-email">Email address</label>
            <input id="daily-quiz-email" type="email" name="email" required autocomplete="email" placeholder="you@example.com" class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2" />
            <button type="submit" class="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">Remind me</button>
          </form>
          <p class="mt-3 text-xs text-slate-600">Please confirm your email to subscribe. Unsubscribe anytime.</p>
        </div>
        <div id="quiz"><Question question={firstQuestion} questionNumber={0} totalQuestions={dailyQuestions.length} langCode={langCode} /></div>
      </section>
    </Layout>
  );
};
export default LanguagePage;

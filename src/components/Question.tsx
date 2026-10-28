import type { LangCode, Question as QuizQuestion } from "../types";
import { languageConfig } from "../config/language-config";

type Props = {
  question: QuizQuestion;
  langCode: LangCode;
  questionNumber: number;
  totalQuestions: number;
};

const Question = ({
  question,
  langCode,
  questionNumber,
  totalQuestions,
}: Props) => {
  const progress = ((questionNumber + 1) / totalQuestions) * 100;
  const { theme } = languageConfig[langCode];
  const isChinese = langCode === "zh";

  return (
    <div
      id="quiz"
      class="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8 lg:px-8"
    >
      <section
        class="flex w-full min-w-0 flex-col gap-4"
        {...(isChinese
          ? {
              "x-data":
                "{ script: localStorage.getItem('zh-script') || 'simplified' }",
              "x-init":
                "if (!localStorage.getItem('zh-script')) localStorage.setItem('zh-script', script)",
            }
          : {})}
      >
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2 text-sm font-medium text-slate-500">
            Daily practice
            {question.level && (
              <span
                class={`rounded-lg px-2 py-0.5 text-xs font-bold ${theme.accentSoft} ${theme.accentText}`}
              >
                {question.level}
              </span>
            )}
          </span>
          <span class="text-sm font-semibold text-slate-700">
            Question {questionNumber + 1} of {totalQuestions}
          </span>
        </div>
        <div class={`h-2 overflow-hidden rounded-full ${theme.progressTrack}`}>
          <div
            class={`h-full rounded-full ${theme.progress} transition-all`}
            style={`width: ${progress}%`}
          />
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          {isChinese ? (
            <div class="mb-5 flex items-center justify-between gap-3">
              <p
                class={`text-sm font-semibold uppercase tracking-wider ${theme.kicker}`}
              >
                Chinese · 中文
              </p>
              <div
                class="flex items-center gap-2 text-sm"
                aria-label="Chinese script"
              >
                <span x-bind:class="script === 'simplified' ? 'font-bold text-blue-900' : 'text-slate-500'">
                  Simplified
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-label="Toggle Simplified or Traditional Chinese"
                  x-bind:aria-checked="script === 'traditional'"
                  x-on:click="script = script === 'simplified' ? 'traditional' : 'simplified'; localStorage.setItem('zh-script', script)"
                  class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  x-bind:class="script === 'traditional' ? 'bg-blue-800' : 'bg-slate-300'"
                >
                  <span
                    class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                    x-bind:class="script === 'traditional' ? 'translate-x-5' : 'translate-x-0.5'"
                  ></span>
                </button>
                <span x-bind:class="script === 'traditional' ? 'font-bold text-blue-900' : 'text-slate-500'">
                  Traditional
                </span>
              </div>
            </div>
          ) : (
            <p
              class={`mb-3 text-sm font-semibold uppercase tracking-wider ${theme.kicker}`}
            >
              Complete the sentence
            </p>
          )}
          <h2
            lang={isChinese ? "en" : langCode}
            class="mb-8 text-2xl font-bold leading-snug text-slate-900 sm:text-3xl"
          >
            {question.question}
          </h2>
          <form
            x-data="{ selectedAnswer: '', status: '' }"
            {...{
              "x-on:ajax:after":
                "status = document.getElementById('answer')?.dataset.status || ''",
            }}
            x-bind:class="status === 'correct' && 'pointer-events-none'"
            method="post"
            action={`/${langCode}/answer/${questionNumber}`}
            x-target="answer"
            class="space-y-3"
          >
            <input type="hidden" name="id" value={question.id} />
            <input type="hidden" name="number" value={questionNumber} />
            {isChinese && (
              <input type="hidden" name="script" x-bind:value="script" />
            )}
            {(isChinese ? question.simplifiedOptions ?? [] : question.options ?? []).map((option, index) => (
              <label
                key={option}
                class="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 p-4 transition"
                x-bind:class={`selectedAnswer === ${JSON.stringify(option)} && status === 'correct' ? 'border-emerald-600 bg-emerald-50' : selectedAnswer === ${JSON.stringify(option)} && status === 'incorrect' ? 'border-orange-200 bg-orange-50' : ${JSON.stringify(`${theme.optionHover} ${theme.selectedOption}`)}`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  x-model="selectedAnswer"
                  x-on:change="$el.form.requestSubmit()"
                  required
                  class={`h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-slate-300 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.focus}`}
                  x-bind:class={`selectedAnswer === ${JSON.stringify(option)} && status === 'correct' ? 'checked:border-emerald-600 checked:bg-[radial-gradient(circle,_#059669_35%,_white_40%)]' : selectedAnswer === ${JSON.stringify(option)} && status === 'incorrect' ? 'checked:border-orange-700 checked:bg-[radial-gradient(circle,_#c2410c_35%,_white_40%)]' : ${JSON.stringify(theme.radio)}`}
                />
                <span class="flex-1">
                  {isChinese ? (
                    <>
                      <span
                        lang="zh"
                        class="block text-xl font-semibold leading-relaxed text-slate-900"
                        x-text={`script === 'traditional' ? ${JSON.stringify(question.traditionalOptions?.[index] ?? option)} : ${JSON.stringify(question.simplifiedOptions?.[index] ?? option)}`}
                      >
                        {question.simplifiedOptions?.[index] ?? option}
                      </span>
                      <span class="mt-0.5 block text-sm font-medium text-red-700">
                        {question.optionPinyin?.[index] ?? ""}
                      </span>
                    </>
                  ) : (
                    <span
                      lang={langCode}
                      class="text-base font-medium text-slate-800"
                    >
                      {option}
                    </span>
                  )}
                </span>
                <span class="text-sm text-slate-400">
                  {String.fromCharCode(65 + index)}
                </span>
              </label>
            ))}
          </form>
        </div>
      </section>
      <aside
        id="answer"
        aria-live="polite"
        class="w-full min-w-0 lg:sticky lg:top-6"
      >
        <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 sm:p-8">
          <p class="text-lg font-bold text-slate-800">Your answer</p>
          <p class="mt-2 leading-relaxed text-slate-600">
            Choose an option on the left.
          </p>
        </div>
      </aside>
    </div>
  );
};
export default Question;

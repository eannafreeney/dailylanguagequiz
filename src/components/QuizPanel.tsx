import type { LangCode, Question as QuizQuestion } from "../types";
import { LanguageConfig, languageConfig } from "../config/language-config";
import { languages } from "../lib/languages";
import { languageView, nativeOptions } from "../lib/script";

type Props = {
  question: QuizQuestion;
  langCode: LangCode;
  questionNumber: number;
  totalQuestions: number;
};

const QuizPanel = ({
  question,
  langCode,
  questionNumber,
  totalQuestions,
}: Props) => {
  const progress = ((questionNumber + 1) / totalQuestions) * 100;
  const { theme } = languageConfig[langCode];
  const language = languages.find((item) => item.langCode === langCode)!;
  const view = languageView(langCode);
  const hasScripts = view.scripts.length > 1;
  const scriptKey = `${langCode}-script`;
  const defaultScript = view.scripts[0]?.id ?? "";

  const alpineAttributes = hasScripts
    ? {
        "x-data": `{ script: localStorage.getItem('${scriptKey}') || '${defaultScript}' }`,
        "x-init": `if (!localStorage.getItem('${scriptKey}')) localStorage.setItem('${scriptKey}', script)`,
      }
    : {};

  return (
    <div
      id="quiz"
      class="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-4 px-3 sm:gap-6 sm:px-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8 lg:px-8"
    >
      <div class="flex w-full min-w-0 flex-col gap-3 sm:gap-4 lg:col-span-2">
        <Header
          question={question}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          theme={theme}
        />
        <ProgressBar progress={progress} theme={theme} />
      </div>
      <section
        class="flex w-full min-w-0 flex-col gap-3 sm:gap-4"
        {...alpineAttributes}
      >
        <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-9">
          <Bar
            theme={theme}
            hasScripts={hasScripts}
            englishName={language.englishName}
            nativeName={language.name}
            scripts={view.scripts}
            scriptKey={scriptKey}
          />

          <Question question={question} promptLang={view.promptLang} />

          <AnswerCard
            question={question}
            langCode={langCode}
            questionNumber={questionNumber}
            theme={theme}
            hasScripts={hasScripts}
            optionLang={view.optionLang}
            dir={view.dir}
            alternateScript={view.scripts[1]?.id}
          />
        </div>
      </section>
      <AnswerAside />
    </div>
  );
};
export default QuizPanel;

type HeaderProps = {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  theme: LanguageConfig["theme"];
};

const Header = ({
  question,
  questionNumber,
  totalQuestions,
  theme,
}: HeaderProps) => (
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
);

const ProgressBar = ({
  progress,
  theme,
}: {
  progress: number;
  theme: LanguageConfig["theme"];
}) => (
  <div class={`h-2 overflow-hidden rounded-full ${theme.progressTrack}`}>
    <div
      class={`h-full rounded-full ${theme.progress} transition-all`}
      style={`width: ${progress}%`}
    />
  </div>
);

const Bar = ({
  theme,
  hasScripts,
  englishName,
  nativeName,
  scripts,
  scriptKey,
}: {
  theme: LanguageConfig["theme"];
  hasScripts: boolean;
  englishName: string;
  nativeName: string;
  scripts: { id: string; label: string }[];
  scriptKey: string;
}) => {
  const primary = scripts[0];
  const alternate = scripts[1];
  if (hasScripts && primary && alternate)
    return (
      <div class="mb-5 flex items-center justify-between gap-3">
        <p
          class={`text-sm font-semibold uppercase tracking-wider ${theme.kicker}`}
        >
          {englishName} · {nativeName}
        </p>
        <div class="flex items-center gap-2 text-sm" aria-label={`${englishName} script`}>
          <span x-bind:class={`script === '${primary.id}' ? 'font-bold text-blue-900' : 'text-slate-500'`}>
            {primary.label}
          </span>
          <button
            type="button"
            role="switch"
            aria-label={`Toggle ${primary.label} or ${alternate.label}`}
            x-bind:aria-checked={`script === '${alternate.id}'`}
            x-on:click={`script = script === '${primary.id}' ? '${alternate.id}' : '${primary.id}'; localStorage.setItem('${scriptKey}', script)`}
            class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            x-bind:class={`script === '${alternate.id}' ? 'bg-blue-800' : 'bg-slate-300'`}
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
              x-bind:class={`script === '${alternate.id}' ? 'translate-x-5' : 'translate-x-0.5'`}
            ></span>
          </button>
          <span x-bind:class={`script === '${alternate.id}' ? 'font-bold text-blue-900' : 'text-slate-500'`}>
            {alternate.label}
          </span>
        </div>
      </div>
    );

  return (
    <p
      class={`hidden md:block mb-3 text-sm font-semibold uppercase tracking-wider ${theme.kicker}`}
    >
      Complete the sentence
    </p>
  );
};

const Question = ({
  question,
  promptLang,
}: {
  question: QuizQuestion;
  promptLang: string;
}) => (
  <h2
    lang={promptLang}
    class="mb-5 text-xl font-bold leading-snug text-slate-900 sm:mb-8 sm:text-3xl"
  >
    {question.question}
  </h2>
);

type AnswerCardProps = {
  question: QuizQuestion;
  langCode: LangCode;
  questionNumber: number;
  theme: LanguageConfig["theme"];
  hasScripts: boolean;
  optionLang: string;
  dir: "ltr" | "rtl";
  alternateScript?: string;
};

const AnswerCard = ({
  question,
  langCode,
  questionNumber,
  theme,
  hasScripts,
  optionLang,
  dir,
  alternateScript,
}: AnswerCardProps) => (
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
    class="space-y-2.5 sm:space-y-3"
  >
    <input type="hidden" name="id" value={question.id} />
    <input type="hidden" name="number" value={questionNumber} />
    {hasScripts && <input type="hidden" name="script" x-bind:value="script" />}
    {(question.options ?? []).map((option, index) => {
      const reading = question.readings?.[index];
      const native = nativeOptions(question);
      return (
      <label
        key={option}
        class="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 p-3 transition sm:p-4"
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
          {native ? (
            <>
              <span
                lang={optionLang}
                dir={dir === "rtl" ? "rtl" : undefined}
                class="block text-lg font-semibold leading-relaxed text-slate-900 sm:text-xl"
                {...(alternateScript
                  ? {
                      "x-text": `script === ${JSON.stringify(alternateScript)} ? ${JSON.stringify(question.variants?.[alternateScript]?.[index] ?? option)} : ${JSON.stringify(option)}`,
                    }
                  : {})}
              >
                {option}
              </span>
              {reading && (
                <span
                  dir="ltr"
                  class={`mt-0.5 block text-sm font-medium ${theme.accentText}`}
                >
                  {reading}
                </span>
              )}
            </>
          ) : (
            <span lang={langCode} class="text-base font-medium text-slate-800">
              {option}
            </span>
          )}
        </span>
        <span class="text-sm text-slate-400">
          {String.fromCharCode(65 + index)}
        </span>
      </label>
      );
    })}
  </form>
);

const AnswerAside = () => (
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
);

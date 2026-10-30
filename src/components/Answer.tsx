import NextQuestionButton from "./NextQuestionButton";
import type { Question, LangCode } from "../types";
import CompleteBanner from "./CompleteBanner";
import { languageConfig } from "../config/language-config";
import { languageView, nativeOptions, optionLabel, phraseReadingLine } from "../lib/script";

type AnswerStatus = "correct" | "incorrect" | "invalid";
type Props = {
  status: AnswerStatus;
  question?: Question;
  nextNumber: number;
  langCode: LangCode;
  dailyQuestionsLength: number;
  message?: string;
  script?: string;
};

const Answer = ({
  status,
  question,
  nextNumber,
  langCode,
  dailyQuestionsLength,
  message,
  script = "",
}: Props) => {
  const isCorrect = status === "correct";
  const view = languageView(langCode);
  const native = Boolean(question && nativeOptions(question));
  const shown = question
    ? optionLabel(question, question.correctAnswer, script)
    : "";
  const reading = question?.readings?.[question.correctAnswer];
  const phraseLine = question ? phraseReadingLine(question) : "";
  const theme = languageConfig[langCode].theme;
  const isComplete = isCorrect && nextNumber >= dailyQuestionsLength;
  const styles = {
    correct: {
      card: "border-emerald-200 bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-700",
      heading: "text-emerald-900",
      text: "text-emerald-800",
      iconText: "✓",
      title: "Correct!",
      description: "Well done! You got it right.",
    },
    incorrect: {
      card: "border-orange-200 bg-orange-50",
      icon: "bg-orange-100 text-orange-700",
      heading: "text-orange-900",
      text: "text-orange-800",
      iconText: "↻",
      title: "Not quite!",
      description: "Try another choice. You can do it!",
    },
    invalid: {
      card: "border-blue-200 bg-blue-50",
      icon: "bg-blue-100 text-blue-700",
      heading: "text-blue-900",
      text: "text-blue-800",
      iconText: "i",
      title: "Choose an answer",
      description: "Please select one of the choices above.",
    },
  }[status];
  return (
    <div
      id="answer"
      data-status={status}
      class={`w-full min-w-0 rounded-2xl border p-4 shadow-sm sm:p-6 lg:sticky lg:top-6 ${styles.card}`}
    >
      <div class="flex items-start gap-3">
        <div class="min-w-0 flex-1">
          <span
            aria-hidden="true"
            class={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl font-bold ${styles.icon}`}
          >
            {styles.iconText}
          </span>
          {!isCorrect && (
            <p class={`mt-2 leading-relaxed ${styles.text}`}>
              {message ?? styles.description}
            </p>
          )}
          {isCorrect && question && native && (
            <div class="mt-3 rounded-xl border border-slate-200 bg-white/80 p-4">
              <p class="text-sm font-medium text-slate-500">Correct answer</p>
              <p
                lang={view.optionLang}
                dir={view.dir === "rtl" ? "rtl" : undefined}
                class="mt-1 text-2xl font-bold text-slate-900"
              >
                {shown}
              </p>
              {reading && (
                <p
                  dir="ltr"
                  class={`mt-1 text-sm font-semibold ${theme.accentText}`}
                >
                  {reading}
                </p>
              )}
              <p class="mt-1 text-sm text-slate-600">{question.question}</p>
            </div>
          )}
          {isCorrect && (
            <div class="mt-2 flex flex-col gap-4">
              {question?.phrase && (
                <div>
                  <p
                    lang={view.dir === "rtl" ? view.optionLang : undefined}
                    dir={view.dir === "rtl" ? "rtl" : undefined}
                    class={`text-lg font-semibold ${styles.heading}`}
                  >
                    {question.phrase}
                  </p>
                  {phraseLine && (
                    <p
                      dir="ltr"
                      class={`mt-0.5 text-sm font-semibold ${theme.accentText}`}
                    >
                      {phraseLine}
                    </p>
                  )}
                </div>
              )}
              {question?.explanation && (
                <p class={`leading-relaxed ${styles.text}`}>
                  {question.explanation}
                </p>
              )}
              {!isComplete && (
                <NextQuestionButton
                  nextNumber={nextNumber}
                  langCode={langCode}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {isComplete && <CompleteBanner langCode={langCode} />}
    </div>
  );
};
export default Answer;

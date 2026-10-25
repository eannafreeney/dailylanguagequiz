import NextQuestionButton from "./NextQuestionButton";
import type { Question, LangCode } from "../types";
import CompleteBanner from "./CompleteBanner";
import { languageConfig } from "../config/language-config";

type AnswerStatus = "correct" | "incorrect" | "invalid";
type Props = {
  status: AnswerStatus;
  question?: Question;
  nextNumber: number;
  langCode: LangCode;
  dailyQuestionsLength: number;
  message?: string;
};

const Answer = ({ status, question, nextNumber, langCode, dailyQuestionsLength, message }: Props) => {
  const isCorrect = status === "correct";
  const isComplete = isCorrect && nextNumber >= dailyQuestionsLength;
  const theme = languageConfig[langCode].theme;
  const styles = {
    correct: {
      card: langCode === "de" ? "border-amber-300 bg-amber-50" : "border-emerald-200 bg-emerald-50",
      icon: langCode === "de" ? "bg-neutral-200 text-neutral-950" : "bg-emerald-100 text-emerald-700",
      heading: langCode === "de" ? "text-neutral-950" : "text-emerald-900",
      text: langCode === "de" ? "text-neutral-800" : "text-emerald-800",
      iconText: "✓", title: "Correct!", description: "Well done! You got it right.",
    },
    incorrect: {
      card: "border-orange-200 bg-orange-50", icon: "bg-orange-100 text-orange-700",
      heading: "text-orange-900", text: "text-orange-800", iconText: "↻",
      title: "Not quite!", description: "Try another choice. You can do it!",
    },
    invalid: {
      card: "border-blue-200 bg-blue-50", icon: "bg-blue-100 text-blue-700",
      heading: "text-blue-900", text: "text-blue-800", iconText: "i",
      title: "Choose an answer", description: "Please select one of the choices above.",
    },
  }[status];

  return (
    <div id="answer" class={`mt-6 rounded-2xl border p-5 shadow-sm sm:p-6 ${styles.card}`}>
      <div class="flex items-start gap-3">
        <span aria-hidden="true" class={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl font-bold ${styles.icon}`}>{styles.iconText}</span>
        <div class="min-w-0 flex-1">
          <p class={`text-lg font-bold ${styles.heading}`}>{styles.title}</p>
          {!isCorrect && <p class={`mt-2 leading-relaxed ${styles.text}`}>{message ?? styles.description}</p>}
          {isCorrect && (
            <div class="mt-2 flex flex-col gap-4">
              {question?.explanation && <p class={`leading-relaxed ${styles.text}`}>{question.explanation}</p>}
              {!isComplete && <NextQuestionButton nextNumber={nextNumber} langCode={langCode} />}
            </div>
          )}
        </div>
      </div>
      {isComplete && <CompleteBanner langCode={langCode} />}
    </div>
  );
};
export default Answer;

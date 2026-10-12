import NextQuestionButton from "./NextQuestionButton";
import type { Question } from "../types";

type AnswerStatus = "correct" | "incorrect" | "invalid";

type Props = {
  status: AnswerStatus;
  question?: Question;
  nextNumber: number;
  langCode: string;
  dailyQuestionsLength: number;
  message?: string;
};

const Answer = ({
  status,
  question,
  nextNumber,
  langCode,
  dailyQuestionsLength,
  message,
}: Props) => {
  const isCorrect = status === "correct";
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
      role="status"
      aria-live="polite"
      class={`mt-6 rounded-2xl border p-5 shadow-sm sm:p-6 ${styles.card}`}
    >
      <div class="flex items-start gap-3">
        <span
          aria-hidden="true"
          class={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl font-bold ${styles.icon}`}
        >
          {styles.iconText}
        </span>

        <div class="min-w-0 flex-1">
          <p class={`text-lg font-bold ${styles.heading}`}>{styles.title}</p>

          {!isCorrect && (
            <p class={`mt-2 leading-relaxed ${styles.text}`}>
              {message ?? styles.description}
            </p>
          )}

          {isCorrect && (
            <div class="mt-2 flex flex-col gap-4">
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

      {isComplete && (
        <div class="mt-6 border-t border-emerald-200 pt-6">
          <p class="text-xl font-bold text-emerald-950">
            🎉 You’ve completed today’s quiz!
          </p>

          <p class="mt-2 leading-relaxed text-emerald-800">
            Five questions done. Come back tomorrow to keep building your
            language skills.
          </p>

          <div class="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <p class="text-lg font-bold text-slate-900">
              Ready to go beyond the daily quiz?
            </p>

            <p class="mt-2 leading-relaxed text-slate-600">
              Langkraft helps you learn grammar through real sentences. Reveal
              each sentence one chunk at a time, and practise with 20 sentences
              for every grammar point.
            </p>

            <a
              href="https://langkraft.app/?utm_source=daily-quiz&utm_medium=referral&utm_campaign=quiz-completion"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 p-4 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:w-auto"
            >
              Explore Langkraft
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Answer;

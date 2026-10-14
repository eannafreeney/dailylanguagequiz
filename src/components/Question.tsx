import { LangCode } from "../types";
import CheckAnswerButton from "./CheckAnswerButton";

type Props = {
  question: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  };
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

  return (
    <section id="quiz" class="flex flex-col gap-4 mx-auto w-full max-w-2xl">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-500">Daily practice</span>
        <span class="text-sm font-semibold text-slate-700">
          Question {questionNumber + 1} of {totalQuestions}
        </span>
      </div>

      <div class="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          class="h-full rounded-full bg-emerald-500 transition-all"
          style={`width: ${progress}%`}
        />
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p class="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Complete the sentence
        </p>

        <h1 class="mb-8 text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
          {question.question}
        </h1>

        <form
          x-data="{ selectedAnswer: '' }"
          method="post"
          action={`/${langCode}/answer/${questionNumber}`}
          x-target="answer check-answer-button"
          class="space-y-3"
        >
          <input type="hidden" name="id" value={question.id} />
          <input type="hidden" name="number" value={questionNumber} />

          {question.options.map((option, index) => (
            <label class="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-400 hover:bg-emerald-50 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="answer"
                value={option}
                x-model="selectedAnswer"
                required
                class="cursor-pointer h-5 w-5 accent-emerald-600"
              />

              <span class="flex-1 text-base font-medium text-slate-800">
                {option}
              </span>

              <span class="text-sm text-slate-400">
                {String.fromCharCode(65 + index)}
              </span>
            </label>
          ))}

          <CheckAnswerButton />
        </form>

        <div id="answer" class="mt-5" />
      </div>

      <p class="mt-5 text-center text-sm text-slate-500">
        Five minutes a day can make a difference.
      </p>
    </section>
  );
};

export default Question;

// import { Question } from "../../types";

// type Props = {
//   question: Question;
//   questionNumber: number;
//   dailyQuestionsLength: number;
//   langCode: string;
// };

// const Question = ({
//   question,
//   questionNumber,
//   dailyQuestionsLength,
//   langCode,
// }: Props) => {
//   console.log("langCode", langCode);

//   return (
//     <section
//       id="quiz"
//       class="mx-auto my-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
//     >
//       <div class="mb-6 flex items-center justify-between gap-3">
//         <p class="text-sm font-semibold uppercase tracking-wider text-emerald-700">
//           Gaeilge · Daily quiz
//         </p>
//         <span class="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
//           Question {questionNumber + 1} of {dailyQuestionsLength}
//         </span>
//       </div>

//       <div class="mb-8 h-1.5 overflow-hidden rounded-full bg-slate-100">
//         <div
//           class="h-full rounded-full bg-emerald-600 transition-all"
//           style={`width: ${((questionNumber + 1) / dailyQuestionsLength) * 100}%`}
//         />
//       </div>

//       <h2 class="mb-3 text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl">
//         {question.question}
//       </h2>

//       <p class="mb-6 text-sm text-slate-500">Choose one answer below.</p>

//       <form
//         x-data="{ selectedAnswer: '' }"
//         method="post"
//         action={`/${langCode}/answer/${questionNumber}`}
//         x-target="answer"
//         class="space-y-3"
//       >
//         <input type="hidden" name="id" value={question.id} />
//         <input type="hidden" name="number" value={questionNumber} />

//         {question.options.map((option) => (
//           <label
//             key={option}
//             class="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-400 hover:bg-emerald-50 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50"
//           >
//             <input
//               type="radio"
//               name="answer"
//               value={option}
//               required
//               x-model="selectedAnswer"
//               class="h-4 w-4 accent-emerald-700 cursor-pointer"
//             />
//             <span class="flex-1 text-base font-medium text-slate-700">
//               {option}
//             </span>
//           </label>
//         ))}

//         <button
//           type="submit"
//           disabled
//           x-bind:disabled="selectedAnswer === ''"
//           class="cursor-pointer mt-4 w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
//         >
//           Check answer
//           <span aria-hidden="true"> →</span>
//         </button>
//       </form>

//       <div id="answer" class="mt-5" aria-live="polite" />
//     </section>
//   );
// };

// export default Question;

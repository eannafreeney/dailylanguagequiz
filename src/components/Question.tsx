import { LangCode } from "../types";
import { languageConfig } from "../config/language-config";
import CheckAnswerButton from "./CheckAnswerButton";

type Props = {
  question: { id: string; question: string; options: string[]; correctAnswer: number; explanation?: string };
  langCode: LangCode;
  questionNumber: number;
  totalQuestions: number;
};

const Question = ({ question, langCode, questionNumber, totalQuestions }: Props) => {
  const progress = ((questionNumber + 1) / totalQuestions) * 100;
  const { theme } = languageConfig[langCode];

  return (
    <section id="quiz" class="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-500">Daily practice</span>
        <span class="text-sm font-semibold text-slate-700">Question {questionNumber + 1} of {totalQuestions}</span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-slate-200">
        <div class={`h-full rounded-full ${theme.progress} transition-all`} style={`width: ${progress}%`} />
      </div>
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p class={`mb-3 text-sm font-semibold uppercase tracking-wider ${theme.accentText}`}>Complete the sentence</p>
        <h1 class="mb-8 text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">{question.question}</h1>
        <form x-data="{ selectedAnswer: '' }" method="post" action={`/${langCode}/answer/${questionNumber}`} x-target="answer check-answer-button" class="space-y-3">
          <input type="hidden" name="id" value={question.id} />
          <input type="hidden" name="number" value={questionNumber} />
          {question.options.map((option, index) => (
            <label key={option} class={`flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-red-400 hover:bg-amber-50 ${theme.selectedOption}`}>
              <input type="radio" name="answer" value={option} x-model="selectedAnswer" required class={`h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-slate-300 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.radio} ${theme.focus}`} />
              <span class="flex-1 text-base font-medium text-slate-800">{option}</span>
              <span class="text-sm text-slate-400">{String.fromCharCode(65 + index)}</span>
            </label>
          ))}
          <CheckAnswerButton langCode={langCode} />
        </form>
        <div id="answer" class="mt-5" />
      </div>
      <p class="mt-5 text-center text-sm text-slate-500">Five minutes a day can make a difference.</p>
    </section>
  );
};

export default Question;

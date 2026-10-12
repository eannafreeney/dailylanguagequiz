type Props = {
  langCode: string;
  nextNumber: number;
};

const NextQuestionButton = ({ langCode, nextNumber }: Props) => {
  return (
    <a
      href={`/${langCode}/question/${nextNumber}`}
      x-target="quiz"
      class="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
    >
      Next question
      <span aria-hidden="true">→</span>
    </a>
  );
};

export default NextQuestionButton;

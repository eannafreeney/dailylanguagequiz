const CheckAnswerButton = () => {
  return (
    <button
      id="check-answer-button"
      type="submit"
      disabled
      x-bind:disabled="selectedAnswer === ''"
      class="cursor-pointer mt-4 w-full rounded-2xl bg-emerald-600 px-6 py-4 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Check answer
      <span aria-hidden="true">→</span>
    </button>
  );
};

export default CheckAnswerButton;

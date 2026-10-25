import type { LangCode } from "../types";
import { languageConfig } from "../config/language-config";

const CheckAnswerButton = ({ langCode }: { langCode: LangCode }) => {
  const { theme } = languageConfig[langCode];
  const buttonColor = `${theme.accent} ${theme.accentHover}`;

  return (
    <button
      id="check-answer-button"
      type="submit"
      disabled
      x-bind:disabled="selectedAnswer === ''"
      class={`mt-4 w-full cursor-pointer rounded-2xl px-6 py-4 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${buttonColor} ${theme.focus}`}
    >
      Check answer <span aria-hidden="true">→</span>
    </button>
  );
};
export default CheckAnswerButton;

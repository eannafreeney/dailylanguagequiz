import type { LangCode } from "../types";
import { languageConfig } from "../config/language-config";

type Props = { langCode: LangCode; nextNumber: number };

const NextQuestionButton = ({ langCode, nextNumber }: Props) => {
  const { theme } = languageConfig[langCode];
  return (
    <a href={`/${langCode}/question/${nextNumber}`} x-target="quiz"
      class={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.accent} ${theme.accentHover} ${theme.focus}`}>
      Next question <span aria-hidden="true">→</span>
    </a>
  );
};
export default NextQuestionButton;

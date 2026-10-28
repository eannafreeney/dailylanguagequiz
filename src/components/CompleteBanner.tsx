import type { LangCode } from "../types";
import { languageConfig } from "../config/language-config";
import { languages } from "../lib/languages";

const CompleteBanner = ({ langCode }: { langCode: LangCode }) => {
  const language = languages.find((item) => item.langCode === langCode)!;
  const { theme } = languageConfig[langCode];
  const questionCount = 5;
  return (
    <div
      class={`mt-6 border-t pt-6 ${langCode === "ga" ? "border-emerald-200" : theme.accentBorder}`}
    >
      <p
        class={`text-xl font-bold ${langCode === "ga" ? "text-emerald-950" : theme.accentText}`}
      >
        🎉 You’ve completed today’s quiz!
      </p>
      <p
        class={`mt-2 leading-relaxed ${langCode === "ga" ? "text-emerald-800" : "text-slate-700"}`}
      >
        {questionCount} questions done. Come back tomorrow to keep building your{" "}
        {language.englishName} skills.
      </p>
      <a
        href={`/${langCode}/question/0`}
        x-target="quiz"
        onclick="window.scrollTo(0, 0)"
        class={`mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.accent} ${theme.accentHover} ${theme.focus}`}
      >
        Restart quiz
      </a>
    </div>
  );
};
export default CompleteBanner;

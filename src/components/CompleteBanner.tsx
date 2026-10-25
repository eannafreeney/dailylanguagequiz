import type { LangCode } from "../types";
import { languageConfig } from "../config/language-config";
import { languages } from "../lib/languages";

const CompleteBanner = ({ langCode }: { langCode: LangCode }) => {
  const language = languages.find((item) => item.langCode === langCode)!;
  const { theme } = languageConfig[langCode];
  return (
    <div class={`mt-6 border-t pt-6 ${theme.accentBorder}`}>
      <p class={`text-xl font-bold ${theme.accentText}`}>🎉 You’ve completed today’s quiz!</p>
      <p class="mt-2 leading-relaxed text-slate-700">
        Five questions done. Come back tomorrow to keep building your {language.englishName} skills.
      </p>
    </div>
  );
};
export default CompleteBanner;

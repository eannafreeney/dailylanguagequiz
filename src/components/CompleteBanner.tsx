import type { LangCode } from "../types";
import { languageConfig } from "../config/language-config";
import { languages } from "../lib/languages";

const CompleteBanner = ({ langCode }: { langCode: LangCode }) => {
  const language = languages.find((item) => item.langCode === langCode)!;
  const { theme } = languageConfig[langCode];
  const questionCount = 5;
  const text = langCode === "ga" ? "text-emerald-800" : "text-slate-700";
  const host = language.siteUrl?.replace(/^https?:\/\//, "");
  return (
    <div
      x-data="{ line: '', count: 0, status: '' }"
      x-init={`if (window.recordQuizStreak) { var next = recordQuizStreak('${langCode}'); count = next.count; line = finishedLine(next.count, $el.dataset.site) }`}
      data-site={language.siteName}
      data-url={language.siteUrl ?? ""}
      class={`mt-6 border-t pt-6 ${langCode === "ga" ? "border-emerald-200" : theme.accentBorder}`}
    >
      <p
        class={`text-xl font-bold ${langCode === "ga" ? "text-emerald-950" : theme.accentText}`}
      >
        🎉 You’ve completed today’s quiz!
      </p>
      <p class={`mt-2 leading-relaxed ${text}`}>
        {questionCount} questions done. Come back tomorrow to keep building your{" "}
        {language.englishName} skills.
      </p>
      <div
        x-cloak
        x-show="count"
        class={`mt-4 rounded-xl border bg-white/80 p-4 ${langCode === "ga" ? "border-emerald-200" : theme.accentBorder}`}
      >
        <p
          x-text="line"
          class={`font-bold ${langCode === "ga" ? "text-emerald-950" : theme.accentText}`}
        ></p>

        {host && <p class={`mt-1 text-sm ${text}`}>{host}</p>}
        <button
          type="button"
          x-on:click="shareQuizResult(count, $root.dataset.site, $root.dataset.url).then(function (result) { status = result })"
          class={`mt-3 flex w-full cursor-pointer items-center justify-center rounded-xl border px-5 py-3 font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.accentBorder} ${theme.accentText} ${theme.focus}`}
        >
          <span x-show="status !== 'copied' && status !== 'shared'">Share</span>
          <span x-cloak x-show="status === 'copied'">
            Copied
          </span>
          <span x-cloak x-show="status === 'shared'">
            Shared
          </span>
        </button>
      </div>
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

import { languageConfig } from "../config/language-config";
import { languages, REGISTERED_LANGS } from "../lib/languages";
import type { LangCode } from "../types";

type Props = { title: string; kicker: string; langCode: LangCode };

const Footer = ({ title, kicker, langCode }: Props) => {
  const { links, theme } = languageConfig[langCode];
  const language = languages.find((item) => item.langCode === langCode);

  if (!language) {
    return null;
  }

  const { siteName, description } = language;
  const otherQuizzes = languages.filter(
    (item) =>
      item.langCode !== langCode &&
      item.siteUrl &&
      REGISTERED_LANGS.has(item.langCode),
  );

  const logoHover = `hover:text-${theme.accentText}`;
  const linkColor = `text-${theme.accentText} hover:text-${theme.accentText}200`;

  return (
    <footer class={theme.footerBar}>
      <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <a
              href={langCode === "zh" ? "/zh" : "/"}
              class={`inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white ${logoHover}`}
            >
              <span
                class={`flex h-8 w-8 items-center justify-center rounded-lg ${theme.accent} text-sm ${theme.markText}`}
                aria-hidden="true"
              >
                D.
              </span>
              {title}
            </a>
            <p class="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              {kicker}
            </p>
            <p class="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              {description}
            </p>
          </div>
          {otherQuizzes.length > 0 && (
            <div class="flex flex-col gap-2">
              <p class="font-semibold text-white">Other daily quizzes</p>
              {otherQuizzes.map((quiz) => (
                <a
                  key={quiz.langCode}
                  href={quiz.siteUrl}
                  class="font-semibold text-slate-200 transition hover:text-white"
                >
                  {quiz.flag} {quiz.englishName}
                </a>
              ))}
            </div>
          )}
          {links.length > 0 && (
            <div class="flex md:hidden flex-col gap-2 text-right">
              <p class="font-semibold text-white">Want to keep learning?</p>
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  class={`font-semibold transition ${linkColor}`}
                >
                  {link.title}
                  <span aria-hidden="true"> ↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
        <div class="mt-8 border-t border-slate-800 pt-5">
          <p class="text-xs text-slate-500">
            © {new Date().getFullYear()} {siteName}. Made for curious learners.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

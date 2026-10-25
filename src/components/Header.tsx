import { languageConfig } from "../config/language-config";
import type { LangCode } from "../types";

type Props = {
  title: string;
  kicker: string;
  questionCount: number;
  langCode: LangCode;
};

const Header = ({ title, kicker, questionCount, langCode }: Props) => {
  const { links, theme } = languageConfig[langCode];
  return (
    <header class="border-b border-slate-200 bg-white">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="/" class={`flex items-center gap-3 rounded-lg focus-visible:outline-2 ${theme.focus}`}>
          <span class={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.accent} text-xl text-white`}>
            <span class="font-bold">D.</span>
          </span>
          <span>
            <span class="block text-lg font-bold tracking-tight text-slate-900">{title}</span>
            <span class="block text-xs text-slate-500">{kicker}</span>
          </span>
        </a>
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-slate-500">{questionCount} questions</span>
          {links.length > 0 && (
            <details class="dropdown dropdown-end">
              <summary class={`inline-flex cursor-pointer items-center gap-1 rounded-lg ${theme.accentSoft} px-3 py-2 text-sm font-semibold ${theme.accentText} transition`}>
                Links <span aria-hidden="true">↗</span>
              </summary>
              <ul class="dropdown-content menu z-50 mt-2 w-52 rounded-box border border-slate-200 bg-white p-2 shadow-lg">
                {links.map((link) => <Link key={link.href} href={link.href} label={link.label} theme={theme} />)}
              </ul>
            </details>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

const Link = ({ href, label, theme }: { href: string; label: string; theme: { accentSoft: string; accentText: string } }) => (
  <li>
    <a href={href} target="_blank" rel="noopener noreferrer" class={`block px-4 py-2 text-sm font-medium text-slate-700 hover:${theme.accentSoft} hover:${theme.accentText}`}>
      {label} <span aria-hidden="true">↗</span>
    </a>
  </li>
);

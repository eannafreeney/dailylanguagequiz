import { languageConfig } from "../config/language-config";
import type { LangCode } from "../types";

type Props = { title: string; kicker: string; langCode: LangCode };

const Footer = ({ title, kicker, langCode }: Props) => {
  const { links, theme } = languageConfig[langCode];
  const logoHover = langCode === "ga" ? "hover:text-emerald-300" : "hover:text-red-300";
  const linkColor = langCode === "ga" ? "text-emerald-300 hover:text-emerald-200" : "text-red-300 hover:text-white";
  return (
    <footer class="mt-auto border-t border-slate-200 bg-slate-950 text-slate-300">
      <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <a href="/" class={`inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white ${logoHover}`}>
              <span class={`flex h-8 w-8 items-center justify-center rounded-lg ${theme.accent} text-sm`} aria-hidden="true">D.</span>
              {title}
            </a>
            <p class="mt-3 max-w-sm text-sm leading-6 text-slate-400">{kicker}</p>
          </div>
          {links.length > 0 && (
            <div class="flex flex-col gap-2 text-right">
              <p class="font-semibold text-white">Want to keep learning?</p>
              {links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" class={`font-semibold transition ${linkColor}`}>
                  {link.label}<span aria-hidden="true"> ↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
        <div class="mt-8 border-t border-slate-800 pt-5">
          <p class="text-xs text-slate-500">© {new Date().getFullYear()} Daily Words. Made for curious learners.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

import { languageConfig } from "../config/language-config";
import { LangCode } from "../types";

export default function SponsorStack({ langCode }: { langCode: LangCode }) {
  const { theme, links } = languageConfig[langCode];

  return (
    <aside
      aria-label="Sponsors"
      className="hidden md:flex flex-col gap-2 fixed bottom-24 right-4 z-20 w-44"
    >
      {links.length > 0 &&
        links.map((link) => (
          <a
            href={link.href}
            key={link.title}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div
              key={link.title}
              className={`flex cursor-pointer items-start gap-2.5 rounded-xl border ${theme.accentBorder} px-3 py-2.5 shadow-[0_10px_24px_-14px_rgba(28,25,23,0.7)] transition duration-200 ease-out ${theme.accentBorderHover}`}
            >
              <span className="min-w-0">
                <span className="block text-xs font-medium text-stone-800">
                  {link.title}
                </span>
                <span className="block text-[11px] leading-snug text-stone-500">
                  {link.description}
                </span>
              </span>
            </div>
          </a>
        ))}
    </aside>
  );
}

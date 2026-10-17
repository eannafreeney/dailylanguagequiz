import { LINKS } from "../constants/constants";

type Props = {
  title: string;
  kicker: string;
};

const Header = ({ title, kicker }: Props) => {
  return (
    <header class="border-b border-slate-200 bg-white">
      <nav
        class="mx-auto flex max-w-6xl items-center
                 justify-between px-4 py-4 sm:px-6 lg:px-8"
      >
        <a
          href="/"
          class="flex items-center gap-3 rounded-lg
                   focus-visible:outline-2
                   focus-visible:outline-emerald-700"
        >
          <span
            class="flex h-10 w-10 items-center
                     justify-center rounded-xl
                     bg-emerald-700 text-xl text-white"
          >
            <span class="font-bold">D.</span>
          </span>

          <span>
            <span
              class="block text-lg font-bold
                           tracking-tight text-slate-900"
            >
              {title}
            </span>
            <span class="block text-xs text-slate-500">{kicker}</span>
          </span>
        </a>

        <details class="dropdown dropdown-end">
          <summary
            class="cursor-pointer inline-flex items-center gap-1
                     rounded-lg bg-emerald-50 px-3 py-2
                     text-sm font-semibold text-emerald-800
                     transition hover:bg-emerald-100"
          >
            Links <span aria-hidden="true">↗</span>
          </summary>

          <ul class="dropdown-content menu z-50 mt-2 w-52 rounded-box border border-slate-200 bg-white p-2 shadow-lg">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} label={link.label} />
            ))}
          </ul>
        </details>
      </nav>
    </header>
  );
};

export default Header;

const Link = ({ href, label }: { href: string; label: string }) => {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        class="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
      >
        {label} <span aria-hidden="true">↗</span>
      </a>
    </li>
  );
};

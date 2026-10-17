import { LINKS } from "../constants/constants";

type Props = {
  title: string;
  kicker: string;
};

const Footer = ({ title, kicker }: Props) => {
  return (
    <footer
      class="mt-auto border-t border-slate-200
                     bg-slate-950 text-slate-300"
    >
      <div
        class="mx-auto max-w-6xl px-4 py-10
                    sm:px-6 lg:px-8"
      >
        <div class="flex flex-col sm:flex-row sm:justify-between gap-8">
          <div>
            <a
              href="/"
              class="inline-flex items-center gap-2
                       text-lg font-bold tracking-tight
                       text-white hover:text-emerald-300"
            >
              <span
                class="flex h-8 w-8 items-center
                         justify-center rounded-lg
                         bg-emerald-700 text-sm"
                aria-hidden="true"
              >
                D.
              </span>
              {title}
            </a>

            <p
              class="mt-3 max-w-sm text-sm leading-6
                        text-slate-400"
            >
              {kicker}
            </p>
          </div>

          <div class="text-right flex flex-col gap-2">
            <p class="font-semibold text-white">Want to keep learning?</p>
            {LINKS.map((link) => (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                class="font-semibold text-emerald-300
                       transition hover:text-emerald-200"
              >
                {link.label}
                <span aria-hidden="true"> ↗</span>
              </a>
            ))}
          </div>
        </div>

        <div class="mt-8 border-t border-slate-800 pt-5">
          <p class="text-xs text-slate-500">
            © {new Date().getFullYear()} Daily Words. Made for curious learners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

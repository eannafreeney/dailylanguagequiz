import { languageConfig } from "../config/language-config";
import { quizzes } from "../lib/quizzes";
import type { LangCode } from "../types";

type Props = {
  title: string;
  langCode: LangCode;
};

const Header = ({ title, langCode }: Props) => {
  const { theme } = languageConfig[langCode];
  const questionCount = quizzes[langCode as keyof typeof quizzes].length;
  return (
    <header class={theme.headerBar}>
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a
          href={langCode === "zh" ? "/zh" : "/"}
          class={`flex items-center gap-3 rounded-lg focus-visible:outline-2 ${theme.focus}`}
        >
          <span
            class={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.accent} text-xl ${theme.markText}`}
          >
            <span class="font-bold">D.</span>
          </span>
          <span>
            <span
              class={`block text-lg font-bold tracking-tight ${theme.headerTitle}`}
            >
              {title}
            </span>
          </span>
        </a>
        <div class="flex items-center gap-3">
          <span
            class={`hidden sm:block text-sm font-medium ${theme.headerMuted}`}
          >
            {questionCount} questions
          </span>
        </div>
      </nav>
    </header>
  );
};
export default Header;

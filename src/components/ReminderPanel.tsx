import { LangCode } from "../types";
import { languageConfig } from "../config/language-config";

type Props = { langCode: LangCode };

const ReminderPanel = ({ langCode }: Props) => {
  const { theme } = languageConfig[langCode];
  return (
    <div x-data="{ open: false, dismissed: false }">
      <button type="button" x-show="!dismissed" x-on:click="open = true"
        class={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold text-white ${theme.accent} ${theme.accentHover}`}>
        <span aria-hidden="true">🔔</span><span>Get a daily reminder</span>
      </button>
      <ReminderForm langCode={langCode} />
    </div>
  );
};

export default ReminderPanel;

const ReminderForm = ({ langCode }: { langCode: string }) => {
  const { theme } = languageConfig[langCode as LangCode];
  return (
    <div x-show="open" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform scale-95" x-transition:enter-end="opacity-100 transform scale-100" x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100 transform scale-100" x-transition:leave-end="opacity-0 transform scale-95"
      class={`mt-4 rounded-xl border p-5 ${theme.accentBorder} ${theme.accentSoft}`}>
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold text-slate-900">Get your daily quiz by email</h2>
        <button type="button" x-on:click="open = !open" aria-label="Close signup box" class="cursor-pointer rounded-md px-2 py-1 text-xl text-slate-500 hover:bg-white">×</button>
      </div>
      <p class="mt-1 text-sm text-slate-600">A gentle reminder at 8:00 AM Dublin time, with a link straight back to the quiz.</p>
      <form action="/subscribe" method="post" class="mt-4 flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="langCode" value={langCode} />
        <label class="sr-only" for="daily-quiz-email">Email address</label>
        <input id="daily-quiz-email" type="email" name="email" required autocomplete="email" placeholder="you@example.com" class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2" />
        <button type="submit" class={`cursor-pointer rounded-lg px-4 py-2 font-semibold text-white ${theme.accent} ${theme.accentHover}`}>Remind me</button>
      </form>
      <p class="mt-3 text-xs text-slate-600">Please confirm your email to subscribe. Unsubscribe anytime.</p>
    </div>
  );
};

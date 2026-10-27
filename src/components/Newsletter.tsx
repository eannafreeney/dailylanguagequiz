import type { LangCode } from "../types";

function Newsletter({ langCode }: { langCode: LangCode }) {
  return (
    <div x-data="{ open: false }" class="fixed bottom-4 left-4 z-40">
      <button
        type="button"
        x-show="!open"
        x-cloak
        x-on:click="open = true"
        class="cursor-pointer rounded-full border border-stone-200 bg-[#fffefa] px-3 py-2 text-sm font-semibold text-emerald-800 shadow-lg hover:bg-emerald-50"
      >
        Remind me
      </button>
      <section
        x-show="open"
        x-cloak
        class="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-stone-200 bg-[#fffefa] p-4 shadow-lg"
      >
        <div class="flex items-start justify-between gap-3">
          <h2 class="m-0 text-base font-semibold text-stone-800">
            A gentle reminder, every day
          </h2>
          <button
            type="button"
            aria-label="Dismiss newsletter"
            x-on:click="open = false"
            class="cursor-pointer rounded-full text-stone-500 transition hover:bg-emerald-50 hover:text-emerald-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
              {...{
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
              }}
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="mt-1 text-sm leading-6 text-stone-500">
          A gentle reminder at 8:00 AM Dublin time, with a link straight back to
          the quiz.{" "}
        </p>
        <NewsletterForm langCode={langCode} />
      </section>
    </div>
  );
}

export function NewsletterForm({
  langCode,
  error,
  email,
  done,
}: {
  langCode: string;
  error?: string;
  email?: string;
  done?: boolean;
}) {
  if (done) {
    return (
      <p
        id="newsletter-form"
        role="status"
        class="mt-3 text-sm text-emerald-800"
      >
        You're on the list. We'll remind you to practise.
      </p>
    );
  }

  return (
    <form
      id="newsletter-form"
      method="post"
      action="/subscribe"
      x-target="newsletter-form"
      class="mt-3 flex flex-col gap-2"
    >
      {error && (
        <p role="alert" class="text-sm text-red-800">
          {error}
        </p>
      )}
      <input type="hidden" name="langCode" value={langCode} />
      <label class="sr-only" for="daily-reminder-email">
        Email address
      </label>
      <input
        id="daily-reminder-email"
        name="email"
        class="min-h-11 min-w-0 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 placeholder:text-stone-400"
        type="email"
        required
        value={email}
        autocomplete="email"
        placeholder="you@example.com"
      />
      <button
        class="min-h-11 cursor-pointer rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900"
        type="submit"
      >
        Remind me
      </button>
    </form>
  );
}

export default Newsletter;

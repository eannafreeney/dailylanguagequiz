import type { Context } from "hono";
import type { Env } from "../lib/email";

const AccountPage = ({ supabaseUrl, anonKey }: { supabaseUrl: string; anonKey: string }) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Account &amp; leaderboard — Daily Language Quiz</title>
      <link rel="stylesheet" href="/tailwind.css" />
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js"></script>
      <script defer src="/account.js"></script>

    </head>
    <body
      class="min-h-screen bg-slate-50 text-slate-900"
      data-supabase-url={supabaseUrl}
      data-supabase-anon-key={anonKey}
      x-data="accountPage"
      x-init="init()"
    >
      <header class="border-b border-slate-200 bg-white">
        <nav class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" class="text-lg font-bold tracking-tight">Daily Language Quiz</a>
          <a href="/" class="text-sm font-medium text-slate-600 hover:text-slate-900">Choose a quiz</a>
        </nav>
      </header>
      <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 class="text-3xl font-bold tracking-tight">Your account</h1>
        <p class="mt-2 max-w-2xl leading-7 text-slate-600">
          Quizzes stay free to play without an account. Sign in to save correct answers, build streaks, and appear on language leaderboards.
        </p>
        <p class="mt-5 rounded-xl bg-white p-4 text-sm text-slate-700" role="status" aria-live="polite" x-text="status"></p>
        <section x-show="!signedIn" x-cloak class="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold">Sign in with email</h2>
          <p class="mt-1 text-sm leading-6 text-slate-600">We’ll email you a secure sign-in link. No password needed.</p>
          <form x-on:submit="$event.preventDefault(); sendMagicLink()" class="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
            <label class="sr-only" for="email">Email address</label>
            <input x-model="email" id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com" class="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3" />
            <button x-bind:disabled="sendingLink || !supabaseUrl || !anonKey" class="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50" type="submit" x-text="sendingLink ? 'Sending…' : 'Email me a link'"></button>
          </form>
        </section>
        <section x-show="signedIn" x-cloak class="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-semibold">Leaderboard profile</h2>
            <button x-on:click="signOut()" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50" type="button">Sign out</button>
          </div>
          <p class="mt-1 text-sm text-slate-600">Only your display name and aggregate correct-answer score appear publicly.</p>
          <form x-on:submit="$event.preventDefault(); saveProfile()" class="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
            <label class="sr-only" for="display-name">Display name</label>
            <input x-model="displayName" id="display-name" name="displayName" minlength={2} maxlength={24} required placeholder="Choose a display name" class="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3" />
            <button x-bind:disabled="savingProfile" class="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50" type="submit" x-text="savingProfile ? 'Saving…' : 'Save name'"></button>
          </form>
          <h3 class="mt-7 text-lg font-semibold">Your streaks</h3>
          <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <template x-for="item in streaks" x-bind:key="item.language">
              <div class="rounded-xl bg-slate-50 p-3">
                <p class="text-sm font-semibold" x-text="languageNames[item.language] || item.language"></p>
                <p class="mt-1 text-2xl font-bold"><span x-text="item.currentStreak"></span> <span class="text-sm font-medium text-slate-500">days</span></p>
                <p class="mt-1 text-xs text-slate-500" x-text="item.completedToday ? 'Completed today' : 'Complete all 5 correctly to keep your streak'"></p>
              </div>
            </template>
            <p x-show="streaks.length === 0" class="text-sm text-slate-500">Your streaks will appear here after you complete a quiz.</p>
          </div>
        </section>
        <section class="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold">Language leaderboard</h2>
              <p class="mt-1 text-sm text-slate-600">All-time total correct answers. Equal scores share the same rank.</p>
            </div>
            <label class="text-sm font-medium">Language
              <select x-model="selectedLanguage" x-on:change="loadLeaderboard()" class="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
                <template x-for="language in languages" x-bind:key="language.code">
                  <option x-bind:value="language.code" x-text="language.name"></option>
                </template>
              </select>
            </label>
          </div>
          <div class="mt-4 overflow-x-auto">
            <p x-show="leaderboardLoading" class="text-sm text-slate-500">Loading leaderboard…</p>
            <p x-show="leaderboardError" class="text-sm text-red-700" x-text="leaderboardError"></p>
            <p x-show="!leaderboardLoading && !leaderboardError && leaderboardEntries.length === 0" class="text-sm text-slate-500">No scores yet. Sign in and answer questions correctly to be the first!</p>
            <table x-show="!leaderboardLoading && !leaderboardError && leaderboardEntries.length > 0" class="w-full text-left text-sm">
              <thead><tr class="border-b border-slate-200 text-slate-500"><th class="py-3 pr-4">Rank</th><th class="py-3 pr-4">Display name</th><th class="py-3 text-right">Correct answers</th></tr></thead>
              <tbody>
                <template x-for="entry in leaderboardEntries" x-bind:key="entry.displayName + '-' + entry.rank + '-' + entry.score">
                  <tr class="border-b border-slate-100"><td class="py-3 pr-4" x-text="entry.rank"></td><td class="py-3 pr-4 font-medium" x-text="entry.displayName"></td><td class="py-3 text-right tabular-nums" x-text="entry.score"></td></tr>
                </template>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </body>
  </html>
);

export function accountPageHandler(c: Context) {
  const env = (c as unknown as { env: Env }).env;
  return c.html(<AccountPage supabaseUrl={env.SUPABASE_URL ?? ""} anonKey={env.SUPABASE_ANON_KEY ?? ""} />);
}

export default AccountPage;

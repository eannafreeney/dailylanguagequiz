import type { Context } from "hono";
import type { Env } from "../lib/email";

const AccountPage = ({ supabaseUrl, anonKey }: { supabaseUrl: string; anonKey: string }) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Account & leaderboard — Daily Language Quiz</title>
      <link rel="stylesheet" href="/tailwind.css" />
    </head>
    <body
      class="min-h-screen bg-slate-50 text-slate-900"
      data-supabase-url={supabaseUrl}
      data-supabase-anon-key={anonKey}
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
        <p id="status" class="mt-5 rounded-xl bg-white p-4 text-sm text-slate-700" role="status" aria-live="polite">
          Checking account setup…
        </p>
        <section id="signin-panel" class="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold">Sign in with email</h2>
          <p class="mt-1 text-sm leading-6 text-slate-600">We’ll email you a secure sign-in link. No password needed.</p>
          <form id="signin-form" class="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
            <label class="sr-only" for="email">Email address</label>
            <input id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com" class="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3" />
            <button class="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700" type="submit">Email me a link</button>
          </form>
        </section>
        <section id="profile-panel" class="mt-5 hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-semibold">Leaderboard profile</h2>
            <button id="signout" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50" type="button">Sign out</button>
          </div>
          <p class="mt-1 text-sm text-slate-600">Only your display name and aggregate correct-answer score appear publicly.</p>
          <form id="profile-form" class="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
            <label class="sr-only" for="display-name">Display name</label>
            <input id="display-name" name="displayName" minlength={2} maxlength={24} required placeholder="Choose a display name" class="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3" />
            <button class="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700" type="submit">Save name</button>
          </form>
          <h3 class="mt-7 text-lg font-semibold">Your streaks</h3>
          <div id="streaks" class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><p class="text-sm text-slate-500">Loading streaks…</p></div>
        </section>
        <section class="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold">Language leaderboard</h2>
              <p class="mt-1 text-sm text-slate-600">All-time total correct answers. Equal scores share the same rank.</p>
            </div>
            <label class="text-sm font-medium">Language
              <select id="leaderboard-language" class="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
                <option value="ga">Irish</option><option value="de">German</option><option value="ru">Russian</option><option value="it">Italian</option><option value="zh">Chinese</option>
              </select>
            </label>
          </div>
          <div id="leaderboard" class="mt-4 overflow-x-auto"><p class="text-sm text-slate-500">Loading leaderboard…</p></div>
        </section>
      </main>
      <script dangerouslySetInnerHTML={{ __html: `
(() => {
  const root = document.body;
  const supabaseUrl = root.dataset.supabaseUrl || "";
  const anonKey = root.dataset.supabaseAnonKey || "";
  const status = document.getElementById("status");
  const signinPanel = document.getElementById("signin-panel");
  const profilePanel = document.getElementById("profile-panel");
  const tokenKey = "dlq_access_token";
  const languageNames = {ga:"Irish",de:"German",ru:"Russian",it:"Italian",zh:"Chinese"};
  let token = localStorage.getItem(tokenKey) || "";
  const setStatus = (message) => { status.textContent = message; };
  const api = async (path, options = {}) => {
    const headers = Object.assign({"Content-Type":"application/json"}, options.headers || {});
    if (token) headers.Authorization = "Bearer " + token;
    const response = await fetch(path, Object.assign({}, options, {headers}));
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed (" + response.status + ")");
    return data;
  };
  const escapeText = (value) => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const loadLeaderboard = async () => {
    const lang = document.getElementById("leaderboard-language").value;
    const target = document.getElementById("leaderboard");
    target.textContent = "Loading leaderboard…";
    try {
      const data = await api("/api/leaderboard?lang=" + encodeURIComponent(lang), {headers:{}});
      if (!data.entries.length) { target.innerHTML = '<p class="text-sm text-slate-500">No scores yet. Sign in and answer questions correctly to be the first!</p>'; return; }
      target.innerHTML = '<table class="w-full text-left text-sm"><thead><tr class="border-b border-slate-200 text-slate-500"><th class="py-3 pr-4">Rank</th><th class="py-3 pr-4">Display name</th><th class="py-3 text-right">Correct answers</th></tr></thead><tbody>' +
        data.entries.map((entry) => '<tr class="border-b border-slate-100"><td class="py-3 pr-4">' + entry.rank + '</td><td class="py-3 pr-4 font-medium">' + escapeText(entry.displayName) + '</td><td class="py-3 text-right tabular-nums">' + entry.score + '</td></tr>').join("") +
        '</tbody></table>';
    } catch (error) { target.textContent = error.message || "Could not load leaderboard."; }
  };
  const loadStreaks = async () => {
    const target = document.getElementById("streaks");
    try {
      const data = await api("/api/streaks");
      target.innerHTML = data.streaks.map((item) => '<div class="rounded-xl bg-slate-50 p-3"><p class="text-sm font-semibold">' + languageNames[item.language] + '</p><p class="mt-1 text-2xl font-bold">' + item.currentStreak + ' <span class="text-sm font-medium text-slate-500">day' + (item.currentStreak === 1 ? '' : 's') + '</span></p><p class="mt-1 text-xs text-slate-500">' + (item.completedToday ? 'Completed today' : 'Complete all 5 correctly to keep your streak') + '</p></div>').join("");
    } catch (error) { target.textContent = error.message || "Could not load streaks."; }
  };
  const showSignedIn = async () => {
    signinPanel.classList.add("hidden");
    profilePanel.classList.remove("hidden");
    try {
      const me = await api("/api/me");
      document.getElementById("display-name").value = me.displayName || "";
      setStatus("Signed in. Save a display name to appear on leaderboards.");
      await loadStreaks();
    } catch (error) {
      localStorage.removeItem(tokenKey); token = "";
      signinPanel.classList.remove("hidden"); profilePanel.classList.add("hidden");
      setStatus("Your sign-in link may have expired. Please request a new one.");
    }
  };
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const incomingToken = hash.get("access_token");
  if (incomingToken) {
    token = incomingToken;
    localStorage.setItem(tokenKey, token);
    history.replaceState(null, "", location.pathname + location.search);
  }
  if (!supabaseUrl || !anonKey) {
    setStatus("Account sign-in is not configured on this deployment yet. Guest quizzes remain available.");
    document.querySelector("#signin-form button").disabled = true;
  } else if (token) {
    showSignedIn();
  } else {
    setStatus("You can browse leaderboards without an account. Sign in to save your own progress.");
  }
  document.getElementById("signin-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabaseUrl || !anonKey) return;
    const button = event.currentTarget.querySelector("button");
    button.disabled = true;
    try {
      const email = document.getElementById("email").value.trim();
      const response = await fetch(new URL("/auth/v1/otp?redirect_to=" + encodeURIComponent(location.origin + "/account"), supabaseUrl), {
        method:"POST", headers:{"Content-Type":"application/json", apikey:anonKey},
        body:JSON.stringify({email, create_user:true})
      });
      if (!response.ok) throw new Error("Could not send sign-in email. Check the address and try again.");
      setStatus("Check your inbox for your secure sign-in link. You can close this page while you wait.");
    } catch (error) { setStatus(error.message || "Could not send sign-in email."); }
    finally { button.disabled = false; }
  });
  document.getElementById("profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const data = await api("/api/profile", {method:"PUT", body:JSON.stringify({displayName:document.getElementById("display-name").value})});
      document.getElementById("display-name").value = data.displayName;
      setStatus("Display name saved.");
      await loadLeaderboard();
    } catch (error) { setStatus(error.message || "Could not save display name."); }
  });
  document.getElementById("signout").addEventListener("click", () => {
    localStorage.removeItem(tokenKey); token = "";
    profilePanel.classList.add("hidden"); signinPanel.classList.remove("hidden");
    document.getElementById("streaks").textContent = "";
    setStatus("You are signed out. Your saved scores remain on the leaderboard.");
  });
  document.getElementById("leaderboard-language").addEventListener("change", loadLeaderboard);
  loadLeaderboard();
})();
` }} />
    </body>
  </html>
);

export function accountPageHandler(c: Context) {
  const env = (c as unknown as { env: Env }).env;
  return c.html(<AccountPage supabaseUrl={env.SUPABASE_URL ?? ""} anonKey={env.SUPABASE_ANON_KEY ?? ""} />);
}

export default AccountPage;

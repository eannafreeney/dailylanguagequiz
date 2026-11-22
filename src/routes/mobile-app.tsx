import Layout from "../components/Layout";
import type { LangCode } from "../types";

type Props = { langCode: LangCode };

const MobileAppPage = ({ langCode }: Props) => (
  <Layout langCode={langCode}>
    <section class="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div class="grid items-center gap-12 md:grid-cols-2">
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-emerald-700">Daily Language Quiz · Mobile</p>
          <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">Your daily language practice. Now on your home screen.</h1>
          <p class="mt-5 text-lg leading-8 text-slate-600">Install Daily Language Quiz for an app-like experience. Open it with one tap, practise wherever you are, and build a little momentum every day.</p>
          <button type="button" data-install-app-trigger class="mt-8 inline-flex items-center justify-center rounded-xl bg-emerald-700 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-emerald-800">Install the app</button>
          <p class="mt-3 text-sm text-slate-500">Free to install. No app store required.</p>
        </div>
        <div class="relative mx-auto w-full max-w-sm">
          <div class="rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-950 p-3 shadow-2xl">
            <div class="overflow-hidden rounded-[1.8rem] bg-white">
              <div class="flex items-center justify-between bg-emerald-700 px-5 py-4 text-white"><span class="font-bold">Daily Quiz</span><span class="text-xs">5 questions</span></div>
              <div class="p-6">
                <div class="text-xs font-bold uppercase tracking-wider text-emerald-700">Your daily practice</div>
                <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full w-1/5 rounded-full bg-emerald-600"></div></div>
                <h2 class="mt-6 text-xl font-bold text-slate-900">Ready for today's challenge?</h2>
                <p class="mt-2 text-sm leading-6 text-slate-500">Five short questions. Learn something new every day.</p>
                <div class="mt-6 space-y-3"><div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-slate-800">Start today's quiz</div><div class="rounded-xl border border-slate-200 p-3 text-sm text-slate-500">Track your daily progress</div></div>
              </div>
            </div>
          </div>
          <div class="absolute -bottom-5 -left-5 rounded-2xl bg-amber-300 px-4 py-3 font-bold text-slate-900 shadow-lg">5 minutes a day</div>
        </div>
      </div>
      <div class="mt-20 grid gap-8 border-t border-slate-200 pt-10 sm:grid-cols-3">
        <div><div class="text-2xl">⚡</div><h2 class="mt-3 font-bold text-slate-900">One-tap access</h2><p class="mt-2 text-sm leading-6 text-slate-600">Add the quiz to your home screen and launch it like any other app.</p></div>
        <div><div class="text-2xl">📚</div><h2 class="mt-3 font-bold text-slate-900">A little every day</h2><p class="mt-2 text-sm leading-6 text-slate-600">Five focused questions make daily language practice easy to keep up.</p></div>
        <div><div class="text-2xl">🌍</div><h2 class="mt-3 font-bold text-slate-900">Learn anywhere</h2><p class="mt-2 text-sm leading-6 text-slate-600">Choose Irish, German or Chinese and practise on the go. An internet connection is needed for quizzes and answer submissions.</p></div>
      </div>
      <div class="mt-14 rounded-3xl bg-slate-950 px-6 py-10 text-center text-white sm:px-10">
        <h2 class="text-2xl font-bold">Make language learning a daily habit.</h2>
        <p class="mx-auto mt-3 max-w-xl text-slate-300">Install Daily Language Quiz and keep your next five questions just a tap away.</p>
        <button type="button" data-install-app-trigger class="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-50">Install App</button>
      </div>
    </section>
  </Layout>
);

export default MobileAppPage;

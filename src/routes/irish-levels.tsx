import Layout from "../components/Layout";

const IrishLevelsPage = () => (
  <Layout
    langCode="ga"
    pageTitle="Irish Language Levels A1 to B2 Explained | Daily Irish Quiz"
    pageDescription="Learn what A1, A2, B1 and B2 mean for Irish learners, and how the five-question Daily Irish Quiz uses these CEFR levels."
    canonicalPath="/irish-levels"
  >
    <article class="mx-auto my-10 max-w-3xl space-y-7 px-4 leading-7 text-slate-700">
      <header class="space-y-3">
        <p class="text-sm font-semibold uppercase tracking-wide text-emerald-800">
          Irish language learning
        </p>
        <h1 class="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Irish language levels: what do A1, A2, B1 and B2 mean?
        </h1>
        <p class="text-lg">
          The Daily Irish Quiz gives you five new Irish questions each day.
          Questions are drawn from four CEFR levels, from A1 beginner to B2
          upper-intermediate, so your daily challenge can include a mixture of
          easier and more demanding questions.
        </p>
      </header>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold text-slate-950">The four levels</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <section class="rounded-2xl border border-slate-200 p-5">
            <h3 class="text-xl font-bold text-slate-950">A1 — Beginner</h3>
            <p class="mt-2">
              Understand and use familiar everyday expressions, introduce
              yourself, and answer simple questions when someone speaks slowly
              and clearly.
            </p>
          </section>
          <section class="rounded-2xl border border-slate-200 p-5">
            <h3 class="text-xl font-bold text-slate-950">A2 — Elementary</h3>
            <p class="mt-2">
              Understand common phrases about everyday topics such as family,
              work, shopping and your immediate surroundings, and communicate
              in simple routine situations.
            </p>
          </section>
          <section class="rounded-2xl border border-slate-200 p-5">
            <h3 class="text-xl font-bold text-slate-950">B1 — Intermediate</h3>
            <p class="mt-2">
              Understand the main points of clear speech and writing on
              familiar topics, manage many situations while travelling, and
              describe experiences or plans.
            </p>
          </section>
          <section class="rounded-2xl border border-slate-200 p-5">
            <h3 class="text-xl font-bold text-slate-950">B2 — Upper-intermediate</h3>
            <p class="mt-2">
              Understand the main ideas of more complex material, communicate
              with greater fluency, and explain opinions on a range of topics.
            </p>
          </section>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-2xl font-bold text-slate-950">
          How the Daily Irish Quiz works
        </h2>
        <p>
          Every day you get five fresh questions. The questions can come from
          any of the four levels, and the combination changes from day to day.
          You answer one question at a time and must get it right before you
          can move on to the next.
        </p>
        <p>
          Your score is based on how many of the five questions you answer
          correctly on your first attempt. It is a daily practice score, not
          an official CEFR assessment or a formal measure of your overall
          Irish proficiency.
        </p>
        <p>
          There is no account to create and no subscription. Just take the
          daily challenge and come back tomorrow for five more questions.
        </p>
      </section>

      <section class="rounded-2xl bg-emerald-50 p-6">
        <h2 class="text-xl font-bold text-emerald-950">
          Ready to test your Gaeilge?
        </h2>
        <p class="mt-2 text-emerald-950">
          Try today's free five-question Irish quiz and see how many you can
          get right first time.
        </p>
        <a
          href="/"
          class="mt-4 inline-flex rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-900"
        >
          Take today's Irish quiz
        </a>
      </section>
    </article>
  </Layout>
);

export default IrishLevelsPage;

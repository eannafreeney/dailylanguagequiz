const CompleteBanner = () => {
  return (
    <div class="mt-6 border-t border-emerald-200 pt-6">
      <p class="text-xl font-bold text-emerald-950">
        🎉 You’ve completed today’s quiz!
      </p>

      <p class="mt-2 leading-relaxed text-emerald-800">
        Five questions done. Come back tomorrow to keep building your Irish
        skills.
      </p>

      <div class="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <p class="text-lg font-bold text-slate-900">
          Ready to go beyond the daily quiz?
        </p>

        <a
          href="https://langkraft.app/learn/ga?utm_source=daily-quiz&utm_medium=referral&utm_campaign=quiz-completion"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 p-4 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:w-auto"
        >
          Explore Langkraft
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
};

export default CompleteBanner;

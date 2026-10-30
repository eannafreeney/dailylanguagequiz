import assert from "node:assert/strict";
import { app } from "../index";
import { getDailyQuestions } from "../utils";
import { nextStreak, streakClientScript, streakLabel } from "./streak";

assert.deepEqual(nextStreak(null, "2026-10-30"), { count: 1, last: "2026-10-30" });
assert.deepEqual(nextStreak({ count: 4, last: "2026-10-30" }, "2026-10-30"), {
  count: 4,
  last: "2026-10-30",
});
assert.deepEqual(nextStreak({ count: 4, last: "2026-10-29" }, "2026-10-30"), {
  count: 5,
  last: "2026-10-30",
});
assert.deepEqual(nextStreak({ count: 4, last: "2026-10-28" }, "2026-10-30"), {
  count: 1,
  last: "2026-10-30",
});
assert.deepEqual(nextStreak({ count: 9, last: "2025-12-31" }, "2026-01-01"), {
  count: 10,
  last: "2026-01-01",
});
assert.deepEqual(nextStreak({ count: 0, last: "2026-10-29" }, "2026-10-30"), {
  count: 1,
  last: "2026-10-30",
});
assert.equal(streakLabel(1), "1 day in a row.");
assert.equal(streakLabel(4), "4 days in a row.");

const script = streakClientScript();
assert.match(script, /function nextStreak/);
assert.match(script, /function recordQuizStreak/);
assert.doesNotMatch(script, /: string|: number/);

const store = new Map<string, string>();
const recordQuizStreak = new Function(
  "localStorage",
  `${script}; return recordQuizStreak;`,
)({
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
}) as (langCode: string) => string;
assert.equal(recordQuizStreak("ga"), "1 day in a row.");
assert.equal(recordQuizStreak("ga"), "1 day in a row.");
assert.equal(JSON.parse(store.get("quiz-streak:ga")!).count, 1);

const page = await app.request("https://dailyirishquiz.com/");
const pageHtml = await page.text();
assert.match(pageHtml, /function recordQuizStreak/);

const questions = getDailyQuestions("ga");
const last = questions[questions.length - 1];
const finished = await app.request("https://dailyirishquiz.com/ga/answer/4", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    id: last.id,
    number: "4",
    answer: last.options![last.correctAnswer],
  }),
});
assert.equal(finished.status, 200);
assert.match(await finished.text(), /recordQuizStreak\(&#39;ga&#39;\)/);

import assert from "node:assert/strict";
import { app } from "../index";
import { getDailyQuestions } from "../utils";
import { nextStreak, ordinal, shareQuizResult, streakClientScript, streakLabel } from "./streak";

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
assert.equal(ordinal(1), "1st");
assert.equal(ordinal(2), "2nd");
assert.equal(ordinal(3), "3rd");
assert.equal(ordinal(11), "11th");
assert.equal(ordinal(12), "12th");
assert.equal(ordinal(13), "13th");
assert.equal(ordinal(21), "21st");

const script = streakClientScript();
assert.match(script, /function nextStreak/);
assert.match(script, /function recordQuizStreak/);
assert.match(script, /function shareQuizResult/);
assert.match(script, /function finishedLine/);
assert.doesNotMatch(script, /: string|: number/);

const store = new Map<string, string>();
const recordQuizStreak = new Function(
  "localStorage",
  `${script}; return recordQuizStreak;`,
)({
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
}) as (langCode: string) => { label: string; count: number };
assert.deepEqual(recordQuizStreak("ga"), { label: "1 day in a row.", count: 1 });
assert.deepEqual(recordQuizStreak("ga"), { label: "1 day in a row.", count: 1 });
assert.equal(JSON.parse(store.get("quiz-streak:ga")!).count, 1);

const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
const setNavigator = (value: unknown) =>
  Object.defineProperty(globalThis, "navigator", { configurable: true, value });
let shared = "";
setNavigator({
  share(data: { text: string }) {
    shared = data.text;
    return Promise.resolve();
  },
});
assert.equal(
  await shareQuizResult(12, "Daily Irish Quiz", "https://dailyirishquiz.com"),
  "shared",
);
assert.equal(
  shared,
  "I just finished my 12th day on the Daily Irish Quiz.\nhttps://dailyirishquiz.com",
);

let copied = "";
setNavigator({
  clipboard: {
    writeText(text: string) {
      copied = text;
      return Promise.resolve();
    },
  },
});
assert.equal(await shareQuizResult(1, "Daily Irish Quiz", ""), "copied");
assert.equal(copied, "I just finished my 1st day on the Daily Irish Quiz.");

setNavigator({ share: () => Promise.reject(new Error("cancel")) });
assert.equal(
  await shareQuizResult(2, "Daily Irish Quiz", "https://dailyirishquiz.com"),
  "",
);
if (navigatorDescriptor) Object.defineProperty(globalThis, "navigator", navigatorDescriptor);

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
const finishedHtml = await finished.text();
assert.match(finishedHtml, /recordQuizStreak\(&#39;ga&#39;\)/);
assert.match(finishedHtml, /shareQuizResult/);
assert.match(finishedHtml, /finishedLine/);
assert.match(finishedHtml, /data-site="Daily Irish Quiz"/);
assert.match(finishedHtml, /data-url="https:\/\/dailyirishquiz.com"/);
if (last.phrase) assert.ok(finishedHtml.includes(last.phrase));

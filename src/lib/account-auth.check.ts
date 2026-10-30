import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { calculateCurrentStreak, dublinLocalDate, hasCompletedDailyQuiz, rankLeaderboard } from "./account-auth";

assert.equal(hasCompletedDailyQuiz(0), false);
assert.equal(hasCompletedDailyQuiz(4), false);
assert.equal(hasCompletedDailyQuiz(5), true);
assert.equal(hasCompletedDailyQuiz(6), true);
assert.equal(hasCompletedDailyQuiz(4.5), false);

// Date capture must use the Dublin calendar, including DST and year boundaries.
assert.equal(dublinLocalDate(new Date("2026-10-28T23:30:00.000Z")), "2026-10-28");
assert.equal(dublinLocalDate(new Date("2026-10-28T00:30:00.000Z")), "2026-10-28");
assert.equal(dublinLocalDate(new Date("2026-06-30T23:30:00.000Z")), "2026-07-01", "summer Dublin midnight boundary");
assert.equal(dublinLocalDate(new Date("2026-10-24T23:30:00.000Z")), "2026-10-25", "autumn DST boundary");
assert.equal(dublinLocalDate(new Date("2026-01-01T00:30:00.000Z")), "2026-01-01");

// A gap after yesterday breaks the streak; completing today keeps it alive.
assert.deepEqual(
  calculateCurrentStreak(["2026-10-28", "2026-10-27", "2026-10-26"], "2026-10-28"),
  { currentStreak: 3, completedToday: true },
);
assert.deepEqual(
  calculateCurrentStreak(["2026-10-27", "2026-10-26"], "2026-10-28"),
  { currentStreak: 2, completedToday: false },
);
assert.deepEqual(
  calculateCurrentStreak(["2026-10-25"], "2026-10-28"),
  { currentStreak: 0, completedToday: false },
);

// Each language's streak is computed from its own completion-date set.
const irish = calculateCurrentStreak(["2026-10-28", "2026-10-27"], "2026-10-28");
const german = calculateCurrentStreak(["2026-10-26"], "2026-10-28");
assert.equal(irish.currentStreak, 2);
assert.equal(german.currentStreak, 0);

// Competition ranking preserves ties (1, 1, 3) while presentation order is pre-sorted.
assert.deepEqual(
  rankLeaderboard([
    { displayName: "Ada", score: 10 },
    { displayName: "Bea", score: 10 },
    { displayName: "Cleo", score: 8 },
  ]),
  [
    { displayName: "Ada", score: 10, rank: 1 },
    { displayName: "Bea", score: 10, rank: 1 },
    { displayName: "Cleo", score: 8, rank: 3 },
  ],
);


const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync("migrations/20261028000000_accounts_leaderboard.sql", "utf8"));
sqlite.prepare("INSERT INTO user_profiles (user_id, display_name) VALUES (?, ?)").run("user-1", "Ada");
const insertAnswer = sqlite.prepare("INSERT OR IGNORE INTO account_quiz_answers (user_id, local_date, lang_code, question_id) VALUES (?, ?, ?, ?)");
assert.equal(insertAnswer.run("user-1", "2026-10-28", "ga", "q1").changes, 1);
assert.equal(insertAnswer.run("user-1", "2026-10-28", "ga", "q1").changes, 0, "duplicate correct answer should not earn another point");
assert.equal(insertAnswer.run("user-1", "2026-10-28", "de", "q1").changes, 1, "answer credit is language-specific");
assert.throws(() => sqlite.prepare("INSERT INTO account_quiz_answers (user_id, local_date, lang_code, question_id) VALUES (?, ?, ?, ?)").run("user-1", "2026-10-28", "xx", "q2"));
assert.throws(() => sqlite.prepare("INSERT INTO user_profiles (user_id, display_name) VALUES (?, ?)").run("user-2", "x"));
const insertCompletion = sqlite.prepare("INSERT OR IGNORE INTO account_quiz_completions (user_id, local_date, lang_code, score) VALUES (?, ?, ?, ?)");
assert.equal(insertCompletion.run("user-1", "2026-10-28", "ga", 5).changes, 1);
assert.equal(insertCompletion.run("user-1", "2026-10-28", "ga", 5).changes, 0, "only one completion per language/date");
assert.throws(() => sqlite.prepare("INSERT INTO account_quiz_completions (user_id, local_date, lang_code, score) VALUES (?, ?, ?, ?)").run("user-1", "2026-10-29", "ga", 6));
sqlite.close();

console.log("account scoring helpers and D1-compatible constraints ok");

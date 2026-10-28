import assert from "node:assert/strict";
import { calculateCurrentStreak, dublinLocalDate, hasCompletedDailyQuiz, rankLeaderboard } from "./account-auth";

assert.equal(hasCompletedDailyQuiz(0), false);
assert.equal(hasCompletedDailyQuiz(4), false);
assert.equal(hasCompletedDailyQuiz(5), true);
assert.equal(hasCompletedDailyQuiz(6), true);
assert.equal(hasCompletedDailyQuiz(4.5), false);

// Date capture must use the Dublin calendar, including DST and year boundaries.
assert.equal(dublinLocalDate(new Date("2026-10-28T23:30:00.000Z")), "2026-10-28");
assert.equal(dublinLocalDate(new Date("2026-10-28T00:30:00.000Z")), "2026-10-28");
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

console.log("account scoring helpers ok");

import assert from "node:assert/strict";
import { buildDailySocialCaption } from "./social";

const caption = buildDailySocialCaption("ga", {
  id: "test-question",
  question: "Cén chaoi a bhfuil tú?",
  options: ["Tá mé go maith.", "Slán.", "Oíche mhaith."],
  level: "A1",
  correctAnswer: 0,
});

assert.match(caption, /Cén chaoi a bhfuil tú\?/);
assert.match(caption, /A\. Tá mé go maith\./);
assert.match(caption, /B\. Slán\./);
assert.match(caption, /C\. Oíche mhaith\./);
assert.match(caption, /A1/);
assert.match(caption, /dailyirishquiz\.com/);
console.log("Social caption checks passed.");

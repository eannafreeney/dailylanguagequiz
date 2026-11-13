import assert from "node:assert/strict";
import { buildDailySocialCaption } from "./social";

const caption = buildDailySocialCaption("ga");
assert.match(caption, /Daily Irish Quiz/);
assert.match(caption, /Five questions/);
assert.match(caption, /dailyirishquiz\.com/);
assert.doesNotMatch(caption, /Tá mé go maith/);
console.log("Social carousel caption checks passed.");

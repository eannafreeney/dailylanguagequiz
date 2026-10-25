import assert from "node:assert/strict";
import { adminDigest, dublinYesterday, reminderMessage } from "./email";

assert.equal(dublinYesterday("2026-03-01"), "2026-02-28");
assert.equal(dublinYesterday("2024-03-01"), "2024-02-29");
assert.equal(dublinYesterday("2026-01-01"), "2025-12-31");

const { subject, html } = adminDigest("2026-10-22", [
  { lang_code: "ga", started: 2, finished: 1 },
  { lang_code: "de", started: 1, finished: 0 },
]);

assert.equal(subject, "Yesterday's quiz: 3 people");
assert.match(html, /2026-10-22/);
assert.match(html, /Irish: 2 started, 1 finished/);
assert.match(html, /German: 1 started, 0 finished/);
assert.doesNotMatch(html, /@/);

const one = adminDigest("2026-10-22", [{ lang_code: "ga", started: 1, finished: 1 }]);
assert.equal(one.subject, "Yesterday's quiz: 1 person");
assert.match(one.html, /German: 0 started, 0 finished/);

const ga = reminderMessage({ lang_code: "ga", token: "ga-token" });
const de = reminderMessage({ lang_code: "de", token: "de-token" });
assert.equal(ga?.subject, "Your daily Irish quiz is ready");
assert.match(ga?.html ?? "", /https:\/\/dailyirishquiz.com\//);
assert.doesNotMatch(ga?.html ?? "", /German|dailygermanquiz/);
assert.equal(de?.subject, "Your daily German quiz is ready");
assert.match(de?.html ?? "", /https:\/\/dailygermanquiz.com\//);
assert.doesNotMatch(de?.html ?? "", /Irish|dailyirishquiz/);
assert.equal(reminderMessage({ lang_code: "ru", token: "ru-token" }), undefined);

console.log("admin digest ok");

import assert from "node:assert/strict";
import { app } from "./index";
import { getDailyQuestions, redirectUrl } from "./utils";

const start = new Date("2026-01-01T12:00:00.000Z");
const day = (n: number) => new Date(start.getTime() + n * 86_400_000);

for (const lang of ["ga", "de", "ru", "it"] as const) {
  const first = getDailyQuestions(lang, start);
  const seen = new Set<string>();
  let period = 0;

  for (let d = 0; period === 0 && d < 500; d++) {
    const ids = getDailyQuestions(lang, day(d)).map((q) => q.id);
    assert.equal(ids.length, 5);
    assert.equal(new Set(ids).size, 5);
    if (d > 0 && ids[0] === first[0].id) period = d;
    else for (const id of ids) assert.equal(seen.has(id), false, id);
    for (const id of ids) seen.add(id);
  }
  assert.ok(period > 0);

  assert.deepEqual(
    getDailyQuestions(lang, day(period)).map((q) => q.id),
    first.map((q) => q.id),
  );
  assert.deepEqual(
    getDailyQuestions(lang, new Date("2026-01-01T23:30:00.000Z")).map((q) => q.id),
    first.map((q) => q.id),
  );
  console.log(lang, "unique days", period, "questions", seen.size);
}

assert.equal(
  redirectUrl("https://mydaily.irish/ga/question/2?x=1"),
  "https://dailyirishquiz.com/ga/question/2?x=1",
);
assert.equal(
  redirectUrl("https://www.mydaily.irish/confirm?token=abc"),
  "https://dailyirishquiz.com/confirm?token=abc",
);
assert.equal(redirectUrl("https://dailyirishquiz.com/"), undefined);
assert.equal(redirectUrl("https://dailygermanquiz.com/"), undefined);
assert.equal(
  redirectUrl("https://www.dailyirishquiz.com/ga/question/1"),
  "https://dailyirishquiz.com/ga/question/1",
);
assert.equal(
  redirectUrl("https://www.dailygermanquiz.com/"),
  "https://dailygermanquiz.com/",
);
assert.equal(
  redirectUrl("https://www.dailychinesequiz.com/zh"),
  "https://dailychinesequiz.com/zh",
);
assert.equal(redirectUrl("https://dailychinesequiz.com/"), undefined);
assert.equal(
  redirectUrl("https://www.dailylanguagequiz.com/zh"),
  "https://dailylanguagequiz.com/zh",
);
assert.equal(redirectUrl("https://dailylanguagequiz.com/"), undefined);

const irish = await app.request("https://dailyirishquiz.com/");
assert.equal(irish.status, 200);
const irishHtml = await irish.text();
assert.match(irishHtml, /<html lang="en"/);
assert.match(irishHtml, /<title>Daily Irish quiz — 5 questions a day<\/title>/);
assert.match(irishHtml, /rel="canonical" href="https:\/\/dailyirishquiz.com\/"/);
assert.match(irishHtml, /Daily Irish Quiz/);
assert.match(irishHtml, /lang="ga"/);
assert.match(irishHtml, /Question 1 of 5/);

const german = await app.request("https://dailygermanquiz.com/");
const germanHtml = await german.text();
assert.match(germanHtml, /Daily German quiz/);
assert.match(germanHtml, /rel="canonical" href="https:\/\/dailygermanquiz.com\/"/);

const chinese = await app.request("https://dailychinesequiz.com/");
const chineseHtml = await chinese.text();
assert.match(chineseHtml, /Daily Chinese quiz/);
assert.match(chineseHtml, /rel="canonical" href="https:\/\/dailychinesequiz.com\/"/);
assert.equal((await app.request("https://dailychinesequiz.com/ga")).status, 404);

const www = await app.request("https://www.dailyirishquiz.com/confirm?token=abc");
assert.equal(www.status, 301);
assert.equal(www.headers.get("location"), "https://dailyirishquiz.com/confirm?token=abc");

const hub = await app.request("https://dailylanguagequiz.com/");
assert.equal(hub.status, 200);
const hubHtml = await hub.text();
assert.match(hubHtml, /<h1[^>]*>Five questions a day\.<\/h1>/);
assert.match(hubHtml, /href="https:\/\/dailyirishquiz\.com"/);
assert.match(hubHtml, /href="https:\/\/dailygermanquiz\.com"/);
assert.match(hubHtml, /href="https:\/\/dailychinesequiz\.com"/);
assert.doesNotMatch(hubHtml, /Russian|Italian|href="\/(?:ru|it)"/);
assert.equal((await app.request("https://dailylanguagequiz.com/zh")).status, 200);
assert.equal((await app.request("https://www.dailylanguagequiz.com/")).status, 301);
assert.equal((await app.request("https://example.com/")).status, 404);
assert.doesNotMatch(irishHtml, /Five questions a day/);

const fragment = await app.request("https://dailyirishquiz.com/ga/question/1");
assert.equal(fragment.headers.get("x-robots-tag"), "noindex");

import assert from "node:assert/strict";
import { app } from "../index";
import { xml } from "../routes/hv";
import { languageView, optionLabel } from "./script";
import { getDailyQuestions } from "../utils";

const env = {
  DB: {
    prepare: () => ({
      bind: () => ({ run: async () => {} }),
    }),
  },
};

const request = (input: string, init?: RequestInit) => app.request(input, init, env);

assert.equal(xml(`A & B <C> "D"`), "A &amp; B &lt;C&gt; &quot;D&quot;");

const entry = await request("https://dailylanguagequiz.com/hv");
assert.equal(entry.status, 200);
assert.equal(entry.headers.get("content-type"), "application/vnd.hyperview+xml");
assert.match(await entry.text(), /nav-route id="home" href="\/hv\/home"/);

const home = await request("https://dailylanguagequiz.com/hv/home");
const homeXml = await home.text();
assert.match(homeXml, /Irish/);
assert.match(homeXml, /German/);
assert.match(homeXml, /Chinese/);
assert.doesNotMatch(homeXml, /Russian/);
assert.doesNotMatch(homeXml, /Italian/);

const questions = getDailyQuestions("ga");
const question = questions[0];
assert.ok(question.phrase);
question.phraseReading = "phrase-reading-check";
const screen = await request("https://dailylanguagequiz.com/hv/ga/question/0");
const screenXml = await screen.text();
assert.equal(screen.status, 200);
assert.ok(screenXml.includes(xml(question.question)));
assert.ok(screenXml.includes(`value="${xml(question.options![0])}"`));
assert.match(screenXml, /id="feedback"/);
assert.match(screenXml, /target="answers"/);
assert.doesNotMatch(screenXml, /Choose an option/);

const wrong = question.options!.find((_, index) => index !== question.correctAnswer)!;
const right = question.options![question.correctAnswer];
const missed = await request(
  `https://dailylanguagequiz.com/hv/ga/answer/0?id=${question.id}`,
  {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ answer: wrong }),
  },
);
assert.equal(missed.status, 200);
const missedXml = await missed.text();
assert.match(missedXml, /id="answers"/);
assert.match(missedXml, /style="OptionWrong"/);
assert.doesNotMatch(missedXml, /OptionRight/);
assert.match(missedXml, /target="feedback"/);
assert.match(missedXml, /Correct answer/);
assert.ok(missedXml.includes(`>${xml(right)}<`));
assert.match(missedXml, /select-single/);

const hit = await request(
  `https://dailylanguagequiz.com/hv/ga/answer/0?id=${question.id}`,
  {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ answer: right }),
  },
);
const hitXml = await hit.text();
assert.match(hitXml, /style="OptionRight"/);
assert.doesNotMatch(hitXml, /OptionWrong/);
assert.match(hitXml, /select-single/);
assert.match(hitXml, /href="\/hv\/ga\/question\/1"/);
assert.ok(hitXml.includes("phrase-reading-check"));

const last = questions[questions.length - 1];
const done = await request(
  `https://dailylanguagequiz.com/hv/ga/answer/${questions.length - 1}?id=${last.id}`,
  {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ answer: last.options![last.correctAnswer] }),
  },
);
const doneBody = await done.text();
assert.match(doneBody, /I just finished my 1st day on the Daily Irish Quiz/);
assert.match(doneBody, /dailyirishquiz.com/);
assert.match(doneBody, /action="share"/);
assert.match(doneBody, /Restart quiz/);
assert.ok(done.headers.getSetCookie().some((cookie) => cookie.startsWith("quiz-streak-ga=1.")));
const today = new Date().toISOString().slice(0, 10);
const repeat = await request(
  `https://dailylanguagequiz.com/hv/ga/answer/${questions.length - 1}?id=${last.id}`,
  {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: `quiz-streak-ga=4.${today}`,
    },
    body: new URLSearchParams({ answer: last.options![last.correctAnswer] }),
  },
);
assert.match(await repeat.text(), /my 4th day/);

const zh = getDailyQuestions("zh")[0];
const traditional = await request(
  "https://dailylanguagequiz.com/hv/zh/question/0?script=traditional",
);
const traditionalXml = await traditional.text();
assert.equal(languageView("fa").dir, "rtl");
assert.equal(languageView("zh").scripts[1]?.id, "traditional");
assert.equal(languageView("ga").dir, "ltr");
const traditionalLabel = optionLabel(zh, 0, "traditional");
if (traditionalLabel !== zh.options![0]) {
  assert.ok(traditionalXml.includes(xml(traditionalLabel)));
}
assert.ok(traditionalXml.includes(`value="${xml(zh.options![0])}"`));
assert.ok(zh.readings?.[0] && traditionalXml.includes(xml(zh.readings[0])));

const web = await request("https://dailyirishquiz.com/ga/answer/0", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    id: question.id,
    number: "0",
    answer: right,
  }),
});
assert.equal(web.status, 200);
const webHtml = await web.text();
assert.match(webHtml, /data-status="correct"/);
assert.ok(webHtml.includes("phrase-reading-check"));
assert.match(webHtml, /dir="ltr"/);

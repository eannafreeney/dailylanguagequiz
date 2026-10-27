import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getDailyQuestions } from "../src/utils";

const WIDTH = 1080;
const HEIGHT = 1350;
const outDir = resolve("out");
const htmlPath = resolve(outDir, "instagram-ga.html");
const pngPath = resolve(outDir, "instagram-ga.png");

const day = process.argv[2] ? new Date(process.argv[2]) : new Date();
if (Number.isNaN(day.getTime())) {
  console.error("Usage: tsx scripts/instagram-card.ts [YYYY-MM-DD]");
  process.exit(1);
}

const question = getDailyQuestions("ga", day)[0];
const letters = "ABC";

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );

const options = question.options
  .map(
    (option, index) => `
      <div class="option">
        <span class="radio"></span>
        <span class="label">${esc(option)}</span>
        <span class="letter">${letters[index]}</span>
      </div>`,
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
    body {
      font-family: system-ui, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 72px 72px 64px;
      display: flex;
      flex-direction: column;
    }
    .brand { display: flex; align-items: center; gap: 20px; }
    .mark {
      width: 72px; height: 72px; border-radius: 18px;
      background: #047857; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 32px; font-weight: 700;
    }
    .name { font-size: 36px; font-weight: 700; letter-spacing: -0.02em; }
    .meta { margin-top: 48px; display: flex; justify-content: space-between; align-items: center; }
    .practice { color: #64748b; font-size: 26px; font-weight: 500; display: flex; gap: 14px; align-items: center; }
    .level { background: #ecfdf5; color: #065f46; border-radius: 12px; padding: 4px 14px; font-size: 22px; font-weight: 700; }
    .count { font-size: 26px; font-weight: 650; }
    .track { margin-top: 18px; height: 14px; border-radius: 999px; background: #e2e8f0; overflow: hidden; }
    .bar { width: 20%; height: 100%; background: #10b981; }
    .card {
      margin-top: 36px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 36px;
      padding: 56px 52px 48px;
      box-shadow: 0 1px 2px rgb(15 23 42 / 0.06);
    }
    .kicker { margin: 0 0 22px; color: #c2410c; font-size: 22px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    h1 { margin: 0 0 40px; font-size: 48px; line-height: 1.25; letter-spacing: -0.02em; }
    .option {
      display: flex; align-items: center; gap: 22px;
      border: 2px solid #e2e8f0; border-radius: 22px;
      padding: 26px 28px; margin-top: 16px;
    }
    .radio { width: 32px; height: 32px; border-radius: 999px; border: 3px solid #cbd5e1; flex: none; }
    .label { flex: 1; font-size: 30px; font-weight: 550; line-height: 1.3; }
    .letter { color: #94a3b8; font-size: 24px; }
    .foot { margin-top: auto; text-align: center; }
    .foot p { margin: 0; color: #64748b; font-size: 28px; }
    .url { margin-top: 10px !important; color: #047857; font-size: 36px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="brand">
    <div class="mark">D.</div>
    <div class="name">My Daily Irish</div>
  </div>
  <div class="meta">
    <div class="practice">Daily practice${question.level ? `<span class="level">${esc(question.level)}</span>` : ""}</div>
    <div class="count">Question 1 of 5</div>
  </div>
  <div class="track"><div class="bar"></div></div>
  <section class="card">
    <p class="kicker">Complete the sentence</p>
    <h1 lang="ga">${esc(question.question)}</h1>
    ${options}
  </section>
  <footer class="foot">
    <p>Four more questions today</p>
    <p class="url">dailyirishquiz.com</p>
  </footer>
</body>
</html>`;

if (question.explanation) assert.equal(html.includes(question.explanation), false);
assert.equal(html.includes(question.question), true);
for (const option of question.options) assert.equal(html.includes(option), true);

mkdirSync(dirname(htmlPath), { recursive: true });
writeFileSync(htmlPath, html);

const chrome = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].find((path) => spawnSync("test", ["-x", path]).status === 0);

if (!chrome) {
  console.error(`No Chrome found. Open ${htmlPath}`);
  process.exit(1);
}

const shot = spawnSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`,
  ],
  { encoding: "utf8" },
);

if (shot.status !== 0) {
  console.error(shot.stderr || shot.stdout);
  process.exit(shot.status ?? 1);
}

const info = spawnSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", pngPath], { encoding: "utf8" });
const size = info.stdout ?? "";
assert.match(size, /pixelWidth: 1080/);
assert.match(size, /pixelHeight: 1350/);
console.log(`${question.id} ${day.toISOString().slice(0, 10)}`);
console.log(pngPath);

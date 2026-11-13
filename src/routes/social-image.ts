import { Resvg } from "@cf-wasm/resvg/workerd";
import { getDailyQuestions, isLangCode } from "../utils";
import { languages, quizHref } from "../lib/languages";
import type { Context } from "hono";

const W = 1080;
const H = 1350;
const GREEN = "#173F35";
const CREAM = "#F7F4EC";
const LIME = "#D5E8B5";
const INK = "#1D302B";
const MUTED = "#65756D";

type FontSubset = { url: string; ranges: Array<[number, number]> };
const fontBufferCache = new Map<string, Promise<Uint8Array>>();

function parseFontRanges(value: string): Array<[number, number]> {
  return [...value.matchAll(/U\+([0-9A-F?]+)(?:-([0-9A-F?]+))?/gi)].map((match) => {
    const min = Number.parseInt(match[1].replace(/\?/g, "0"), 16);
    const max = Number.parseInt((match[2] ?? match[1]).replace(/\?/g, "F"), 16);
    return [min, max] as [number, number];
  });
}

async function getFontSubsets(text: string): Promise<FontSubset[]> {
  const stylesheetUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&display=swap&text=${encodeURIComponent(text)}`;
  return fetch(stylesheetUrl)
    .then(async (response) => {
      if (!response.ok) throw new Error("Could not load social image font stylesheet");
      const css = await response.text();
      return [...css.matchAll(/@font-face\s*{([^}]+)}/g)].flatMap((match) => {
        const block = match[1];
        if (!/font-family:\s*['"]?Noto Sans SC['"]?/i.test(block)) return [];
        const url = /src:\s*url\(([^)]+)\)/i.exec(block)?.[1]?.replace(/['"]/g, "");
        const range = /unicode-range:\s*([^;]+)/i.exec(block)?.[1];
        if (!url) return [];
        return [{ url, ranges: range ? parseFontRanges(range) : [[0, 0x10ffff] as [number, number]] }];
      });
    });
}

async function getFontBuffers(svg: string): Promise<Uint8Array[]> {
  const visibleText = [...svg.matchAll(/>([^<>]+)</g)].map((match) => match[1]).join("");
  const codePoints = [...visibleText].map((character) => character.codePointAt(0) ?? 0);
  const subsets = await getFontSubsets([...new Set([...visibleText])].join(""));
  const urls = [...new Set(subsets
    .filter((subset) => codePoints.some((point) => subset.ranges.some(([min, max]) => point >= min && point <= max)))
    .map((subset) => subset.url))];
  if (!urls.length) throw new Error("No font subsets matched the carousel text");

  return Promise.all(urls.map((url) => {
    let cached = fontBufferCache.get(url);
    if (!cached) {
      cached = fetch(url).then(async (response) => {
        if (!response.ok) throw new Error("Could not load social image font subset");
        return new Uint8Array(await response.arrayBuffer());
      });
      fontBufferCache.set(url, cached);
    }
    return cached;
  }));
}

function xml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[ch] ?? ch);
}

function lines(value: string, limit: number) {
  const result: string[] = [];
  let current = "";
  let width = 0;
  for (const ch of Array.from(value.trim())) {
    const next = (ch.codePointAt(0) ?? 0) > 0x2e7f ? 1.8 : ch === " " ? 0.45 : 1;
    if (current && width + next > limit) {
      result.push(current.trim());
      current = ch.trimStart();
      width = next;
    } else {
      current += ch;
      width += next;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result.length ? result : [""];
}

function text(value: string, x: number, y: number, limit: number, size: number, fill = INK, weight = 600) {
  return lines(value, limit).map((line, i) =>
    `<text x="${x}" y="${y + i * Math.round(size * 1.3)}" fill="${fill}" font-family="Noto Sans SC" font-size="${size}" font-weight="${weight}">${xml(line)}</text>`,
  ).join("");
}

function frame(content: string, page: string, siteName: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${CREAM}"/>
    <circle cx="1010" cy="90" r="210" fill="${LIME}" opacity=".55"/>
    <circle cx="65" cy="1260" r="190" fill="#E9A16D" opacity=".14"/>
    <path d="M0 0H1080V28H0Z" fill="${GREEN}"/>
    <rect x="72" y="72" width="936" height="1206" rx="42" fill="none" stroke="#D9DED2" stroke-width="2"/>
    ${content}
    <text x="100" y="1210" fill="${MUTED}" font-family="Noto Sans SC" font-size="25" font-weight="600">${xml(siteName)}</text>
    <text x="980" y="1210" text-anchor="end" fill="${MUTED}" font-family="Noto Sans SC" font-size="25" font-weight="700">${page}</text>
    <rect x="100" y="1240" width="880" height="5" rx="3" fill="#D9DED2"/>
    <rect x="100" y="1240" width="880" height="5" rx="3" fill="${GREEN}"/>
  </svg>`;
}

function cover(language: (typeof languages)[number]) {
  return frame(`
    <rect x="100" y="140" width="255" height="58" rx="29" fill="${GREEN}"/>
    <text x="227" y="178" text-anchor="middle" fill="#FFFFFF" font-family="Noto Sans SC" font-size="25" font-weight="700" letter-spacing="2">DAILY LANGUAGE QUIZ</text>
    <circle cx="865" cy="350" r="118" fill="${LIME}"/>
    <circle cx="865" cy="350" r="78" fill="${GREEN}"/>
    <path d="M820 350l31 31 61-70" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    ${text(language.name, 100, 535, 18, 94, GREEN, 800)}
    <text x="104" y="720" fill="${INK}" font-family="Noto Sans SC" font-size="48" font-weight="700">Today's five-question challenge</text>
    <text x="104" y="800" fill="${MUTED}" font-family="Noto Sans SC" font-size="34">Swipe through, choose your answers,</text>
    <text x="104" y="850" fill="${MUTED}" font-family="Noto Sans SC" font-size="34">then take the full quiz online.</text>
    <rect x="100" y="955" width="410" height="92" rx="46" fill="${GREEN}"/>
    <text x="305" y="1013" text-anchor="middle" fill="#FFFFFF" font-family="Noto Sans SC" font-size="32" font-weight="700">SWIPE TO START  →</text>
  `, "01 / 07", language.siteName);
}

function question(language: (typeof languages)[number], q: { question: string; options?: string[]; level?: string }, index: number) {
  const promptLines = lines(q.question, 22);
  const prompt = promptLines.map((line, i) =>
    `<text x="105" y="${405 + i * 70}" fill="${GREEN}" font-family="Noto Sans SC" font-size="55" font-weight="750">${xml(line)}</text>`,
  ).join("");
  const options = q.options ?? [];
  const startY = 435 + promptLines.length * 70 + 58;
  const gap = 18;
  const cardHeight = Math.min(132, Math.max(94, (1120 - startY - gap * Math.max(0, options.length - 1)) / Math.max(1, options.length)));
  const optionMarkup = options.map((option, i) => {
    const y = startY + i * (cardHeight + gap);
    const optionLines = lines(option, 32).slice(0, 2);
    const textY = y + (optionLines.length === 1 ? cardHeight / 2 + 11 : cardHeight / 2 - 7);
    return `<rect x="100" y="${y}" width="880" height="${cardHeight}" rx="24" fill="#FFFFFF" stroke="#E2E5DC" stroke-width="2"/>
      <circle cx="151" cy="${y + cardHeight / 2}" r="25" fill="${GREEN}"/>
      <text x="151" y="${y + cardHeight / 2 + 9}" text-anchor="middle" fill="#FFFFFF" font-family="Noto Sans SC" font-size="25" font-weight="700">${String.fromCharCode(65 + i)}</text>
      <text x="200" y="${textY}" fill="${INK}" font-family="Noto Sans SC" font-size="30" font-weight="600">${optionLines.map((line, n) => `<tspan x="200" dy="${n === 0 ? 0 : 38}">${xml(line)}</tspan>`).join("")}</text>`;
  }).join("");
  const level = q.level ? `<rect x="790" y="260" width="190" height="54" rx="27" fill="${LIME}"/><text x="885" y="296" text-anchor="middle" fill="${GREEN}" font-family="Noto Sans SC" font-size="25" font-weight="700">${xml(q.level)}</text>` : "";
  return frame(`
    <text x="100" y="165" fill="${MUTED}" font-family="Noto Sans SC" font-size="25" font-weight="700" letter-spacing="3">DAILY CHALLENGE</text>
    <text x="100" y="285" fill="${GREEN}" font-family="Noto Sans SC" font-size="36" font-weight="700">QUESTION ${index + 1} <tspan fill="${MUTED}" font-size="28">/ 5</tspan></text>
    ${level}${prompt}${optionMarkup}
  `, `0${index + 2} / 07`, language.siteName);
}

function ending(language: (typeof languages)[number]) {
  const domain = quizHref(language).replace(/^https?:\/\//, "");
  return frame(`
    <text x="100" y="190" fill="${MUTED}" font-family="Noto Sans SC" font-size="25" font-weight="700" letter-spacing="3">YOU MADE IT TO THE END</text>
    <circle cx="540" cy="450" r="190" fill="${LIME}"/>
    <circle cx="540" cy="450" r="132" fill="${GREEN}"/>
    <path d="M465 450l52 52 102-118" fill="none" stroke="#FFFFFF" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="540" y="770" text-anchor="middle" fill="${GREEN}" font-family="Noto Sans SC" font-size="68" font-weight="800">How many did</text>
    <text x="540" y="850" text-anchor="middle" fill="${GREEN}" font-family="Noto Sans SC" font-size="68" font-weight="800">you get right?</text>
    <text x="540" y="940" text-anchor="middle" fill="${MUTED}" font-family="Noto Sans SC" font-size="32">Try all five questions on today's quiz.</text>
    <rect x="210" y="1010" width="660" height="92" rx="46" fill="${GREEN}"/>
    <text x="540" y="1068" text-anchor="middle" fill="#FFFFFF" font-family="Noto Sans SC" font-size="31" font-weight="700">TAKE THE FULL QUIZ  →</text>
    <text x="540" y="1160" text-anchor="middle" fill="${MUTED}" font-family="Noto Sans SC" font-size="27">${xml(domain)}</text>
  `, "07 / 07", language.siteName);
}

export async function socialImageHandler(c: Context) {
  const langCode = c.req.param("langCode");
  const date = c.req.param("date");
  const slide = c.req.param("slide").replace(/[.]png$/, "");
  if (!isLangCode(langCode) || !date || !slide || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return c.notFound();

  const language = languages.find((item) => item.langCode === langCode);
  if (!language?.published) return c.notFound();
  const dateAtNoon = new Date(`${date}T12:00:00.000Z`);
  if (Number.isNaN(dateAtNoon.getTime()) || dateAtNoon.toISOString().slice(0, 10) !== date) return c.notFound();

  const daily = getDailyQuestions(langCode, dateAtNoon);
  if (daily.length !== 5) return c.notFound();

  let svg: string;
  if (slide === "cover") svg = cover(language);
  else if (slide === "end") svg = ending(language);
  else {
    const match = /^q([1-5])$/.exec(slide);
    if (!match) return c.notFound();
    const index = Number(match[1]) - 1;
    svg = question(language, daily[index], index);
  }

  const fontBuffers = await getFontBuffers(svg);
  const renderer = await Resvg.async(svg, { font: { fontBuffers, defaultFontFamily: "Noto Sans SC", sansSerifFamily: "Noto Sans SC" } });
  const png = renderer.render().asPng();
  const body = new ArrayBuffer(png.byteLength);
  new Uint8Array(body).set(png);
  return new Response(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

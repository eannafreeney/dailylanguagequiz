import { Resvg } from "@cf-wasm/resvg/workerd";
import { getDailyQuestions, isLangCode } from "../utils";
import { languages, quizHref } from "../lib/languages";
import type { Context } from "hono";

const W = 1080;
const H = 1350;

type Palette = {
  accent: string;
  accentDark: string;
  accentSoft: string;
  highlight: string;
  background: string;
  ink: string;
  muted: string;
  border: string;
  header: string;
  headerText: string;
};

function paletteFor(langCode: string): Palette {
  const palettes: Record<string, Palette> = {
    ga: { accent: "#047857", accentDark: "#065F46", accentSoft: "#ECFDF5", highlight: "#C2410C", background: "#FFFFFF", ink: "#0F172A", muted: "#64748B", border: "#E2E8F0", header: "#FFFFFF", headerText: "#0F172A" },
    de: { accent: "#B91C1C", accentDark: "#7F1D1D", accentSoft: "#FFFBEB", highlight: "#D97706", background: "#FFFFFF", ink: "#171717", muted: "#737373", border: "#E5E5E5", header: "#171717", headerText: "#FFFFFF" },
    it: { accent: "#15803D", accentDark: "#166534", accentSoft: "#F0FDF4", highlight: "#DC2626", background: "#FFFFFF", ink: "#0F172A", muted: "#64748B", border: "#E2E8F0", header: "#15803D", headerText: "#FFFFFF" },
    zh: { accent: "#B91C1C", accentDark: "#7F1D1D", accentSoft: "#FEF2F2", highlight: "#EAB308", background: "#FFFFFF", ink: "#1F2937", muted: "#6B7280", border: "#FECACA", header: "#991B1B", headerText: "#FFFFFF" },
    hu: { accent: "#B91C1C", accentDark: "#7F1D1D", accentSoft: "#FEF2F2", highlight: "#15803D", background: "#FFFFFF", ink: "#0F172A", muted: "#64748B", border: "#E2E8F0", header: "#B91C1C", headerText: "#FFFFFF" },
    fr: { accent: "#1E40AF", accentDark: "#1E3A8A", accentSoft: "#EFF6FF", highlight: "#DC2626", background: "#FFFFFF", ink: "#0F172A", muted: "#64748B", border: "#DBEAFE", header: "#1E40AF", headerText: "#FFFFFF" },
    es: { accent: "#B91C1C", accentDark: "#7F1D1D", accentSoft: "#FEF2F2", highlight: "#EAB308", background: "#FFFFFF", ink: "#0F172A", muted: "#64748B", border: "#FEE2E2", header: "#B91C1C", headerText: "#FFFFFF" },
    gd: { accent: "#1E40AF", accentDark: "#1E3A8A", accentSoft: "#EFF6FF", highlight: "#FFFFFF", background: "#FFFFFF", ink: "#0F172A", muted: "#64748B", border: "#DBEAFE", header: "#1E3A8A", headerText: "#FFFFFF" },
    cy: { accent: "#B91C1C", accentDark: "#7F1D1D", accentSoft: "#F0FDF4", highlight: "#15803D", background: "#FFFFFF", ink: "#0F172A", muted: "#64748B", border: "#E2E8F0", header: "#15803D", headerText: "#FFFFFF" },
    cs: { accent: "#1E40AF", accentDark: "#1E3A8A", accentSoft: "#EFF6FF", highlight: "#DC2626", background: "#FFFFFF", ink: "#0F172A", muted: "#64748B", border: "#DBEAFE", header: "#1E40AF", headerText: "#FFFFFF" },
    fa: { accent: "#15803D", accentDark: "#166534", accentSoft: "#F0FDF4", highlight: "#DC2626", background: "#FFFFFF", ink: "#0F172A", muted: "#64748B", border: "#E2E8F0", header: "#FFFFFF", headerText: "#0F172A" },
  };
  return palettes[langCode] ?? palettes.ga;
}

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
  return fetch(stylesheetUrl).then(async (response) => {
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

function charUnits(ch: string) {
  const point = ch.codePointAt(0) ?? 0;
  if (/\s/.test(ch)) return 0.35;
  return point > 0x2e7f ? 1.8 : 1;
}

// Wrap at word boundaries for space-separated languages. For scripts such as
// Chinese that do not normally separate words with spaces, wrap by character.
function wrapLines(value: string, limit: number) {
  const input = value.trim();
  if (!input) return [""];
  const hasSpaces = /\s/.test(input);
  const tokens = hasSpaces ? input.split(/\s+/) : Array.from(input);
  const result: string[] = [];
  let line = "";
  let width = 0;

  for (const token of tokens) {
    const tokenWidth = Array.from(token).reduce((sum, ch) => sum + charUnits(ch), 0);
    const separator = line && hasSpaces ? " " : "";
    const separatorWidth = separator ? 0.35 : 0;
    if (line && width + separatorWidth + tokenWidth > limit) {
      result.push(line);
      line = token;
      width = tokenWidth;
    } else {
      line += separator + token;
      width += separatorWidth + tokenWidth;
    }
  }
  if (line) result.push(line);
  return result;
}

function svgText(value: string, x: number, y: number, fontSize: number, fill: string, weight = 600, anchor = "start") {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-family="Noto Sans SC" font-size="${fontSize}" font-weight="${weight}">${xml(value)}</text>`;
}

function frame(content: string, page: string, siteName: string, theme: Palette) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${theme.background}"/>
    <rect x="0" y="0" width="${W}" height="22" fill="${theme.accent}"/>
    <rect x="72" y="72" width="936" height="1206" rx="36" fill="none" stroke="${theme.border}" stroke-width="2"/>
    <rect x="100" y="112" width="12" height="64" rx="6" fill="${theme.highlight}"/>
    ${content}
    ${svgText(siteName, 100, 1210, 25, theme.muted, 600)}
    ${svgText(page, 980, 1210, 25, theme.muted, 700, "end")}
    <rect x="100" y="1240" width="880" height="5" rx="3" fill="${theme.border}"/>
    <rect x="100" y="1240" width="880" height="5" rx="3" fill="${theme.accent}"/>
  </svg>`;
}

function cover(language: (typeof languages)[number], theme: Palette) {
  const title = wrapLines(language.name, 16);
  const titleSize = title.length > 2 ? 76 : 92;
  const titleMarkup = title.map((line, i) => svgText(line, 100, 510 + i * (titleSize + 14), titleSize, theme.accentDark, 800)).join("");
  const titleBottom = 510 + title.length * (titleSize + 14);
  return frame(`
    <rect x="100" y="140" width="330" height="58" rx="29" fill="${theme.accent}"/>
    ${svgText("DAILY LANGUAGE QUIZ", 265, 178, 23, "#FFFFFF", 700, "middle")}
    <circle cx="865" cy="350" r="118" fill="${theme.accentSoft}"/>
    <circle cx="865" cy="350" r="78" fill="${theme.accent}"/>
    <path d="M820 350l31 31 61-70" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    ${titleMarkup}
    ${svgText("Today's five-question challenge", 104, Math.max(titleBottom + 72, 720), 42, theme.ink, 700)}
    ${svgText("Swipe through, choose your answers,", 104, Math.max(titleBottom + 150, 800), 32, theme.muted, 500)}
    ${svgText("then take the full quiz online.", 104, Math.max(titleBottom + 198, 850), 32, theme.muted, 500)}
    <rect x="100" y="955" width="410" height="92" rx="46" fill="${theme.accent}"/>
    ${svgText("SWIPE TO START  →", 305, 1013, 30, "#FFFFFF", 700, "middle")}
  `, "01 / 07", language.siteName, theme);
}

function question(language: (typeof languages)[number], q: { question: string; options?: string[]; level?: string }, index: number, theme: Palette) {
  const promptLines = wrapLines(q.question, 27);
  const promptSize = promptLines.length > 3 ? 43 : promptLines.length > 2 ? 48 : 54;
  const promptLineHeight = Math.round(promptSize * 1.28);
  const promptStart = 385;
  const prompt = promptLines.map((line, i) => svgText(line, 105, promptStart + i * promptLineHeight, promptSize, theme.accentDark, 750)).join("");
  const options = q.options ?? [];
  const startY = promptStart + promptLines.length * promptLineHeight + 54;
  const gap = 16;
  const availableHeight = Math.max(0, 1120 - startY);
  const cardHeight = Math.min(148, Math.max(82, (availableHeight - gap * Math.max(0, options.length - 1)) / Math.max(1, options.length)));
  const optionMarkup = options.map((option, i) => {
    const y = startY + i * (cardHeight + gap);
    const optionLines = wrapLines(option, 33);
    const optionFont = optionLines.length >= 3 ? 24 : optionLines.length === 2 ? 27 : 30;
    const lineHeight = Math.round(optionFont * 1.28);
    const textHeight = (optionLines.length - 1) * lineHeight;
    const firstBaseline = y + cardHeight / 2 - textHeight / 2 + optionFont * 0.35;
    const optionText = optionLines.map((line, n) =>
      `<text x="200" y="${firstBaseline + n * lineHeight}" fill="${theme.ink}" font-family="Noto Sans SC" font-size="${optionFont}" font-weight="600">${xml(line)}</text>`,
    ).join("");
    return `<rect x="100" y="${y}" width="880" height="${cardHeight}" rx="22" fill="#FFFFFF" stroke="${theme.border}" stroke-width="2"/>
      <circle cx="151" cy="${y + cardHeight / 2}" r="25" fill="${theme.accent}"/>
      ${svgText(String.fromCharCode(65 + i), 151, y + cardHeight / 2 + 9, 25, "#FFFFFF", 700, "middle")}
      ${optionText}`;
  }).join("");
  const level = q.level
    ? `<rect x="790" y="260" width="190" height="54" rx="27" fill="${theme.accentSoft}"/>${svgText(q.level, 885, 296, 25, theme.accentDark, 700, "middle")}`
    : "";
  return frame(`
    ${svgText("DAILY CHALLENGE", 100, 165, 25, theme.muted, 700)}
    ${svgText(`QUESTION ${index + 1} / 5`, 100, 285, 36, theme.accent, 700)}
    ${level}${prompt}${optionMarkup}
  `, `0${index + 2} / 07`, language.siteName, theme);
}

function ending(language: (typeof languages)[number], theme: Palette) {
  const domain = quizHref(language).replace(/^https?:\/\//, "");
  return frame(`
    ${svgText("YOU MADE IT TO THE END", 100, 190, 25, theme.muted, 700)}
    <circle cx="540" cy="450" r="190" fill="${theme.accentSoft}"/>
    <circle cx="540" cy="450" r="132" fill="${theme.accent}"/>
    <path d="M465 450l52 52 102-118" fill="none" stroke="#FFFFFF" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/>
    ${svgText("How many did", 540, 770, 64, theme.accentDark, 800, "middle")}
    ${svgText("you get right?", 540, 850, 64, theme.accentDark, 800, "middle")}
    ${svgText("Try all five questions on today's quiz.", 540, 940, 30, theme.muted, 500, "middle")}
    <rect x="210" y="1010" width="660" height="92" rx="46" fill="${theme.accent}"/>
    ${svgText("TAKE THE FULL QUIZ  →", 540, 1068, 30, "#FFFFFF", 700, "middle")}
    ${svgText(domain, 540, 1160, 27, theme.muted, 600, "middle")}
  `, "07 / 07", language.siteName, theme);
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
  const theme = paletteFor(langCode);

  let svg: string;
  if (slide === "cover") svg = cover(language, theme);
  else if (slide === "end") svg = ending(language, theme);
  else {
    const match = /^q([1-5])$/.exec(slide);
    if (!match) return c.notFound();
    const index = Number(match[1]) - 1;
    svg = question(language, daily[index], index, theme);
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

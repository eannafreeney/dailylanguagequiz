export type Streak = { count: number; last: string };

// UTC date, same midnight the daily question set rolls over.
export function nextStreak(prev: Streak | null, today: string): Streak {
  const parts = today.split("-").map(Number);
  const yesterday = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] - 1))
    .toISOString()
    .slice(0, 10);
  if (prev && prev.last === today && prev.count > 0) {
    return { count: prev.count, last: today };
  }
  if (prev && prev.last === yesterday && prev.count > 0) {
    return { count: prev.count + 1, last: today };
  }
  return { count: 1, last: today };
}

export function streakLabel(count: number) {
  return count === 1 ? "1 day in a row." : `${count} days in a row.`;
}

export function ordinal(count: number) {
  const teen = count % 100;
  if (teen >= 11 && teen <= 13) return count + "th";
  const last = count % 10;
  if (last === 1) return count + "st";
  if (last === 2) return count + "nd";
  if (last === 3) return count + "rd";
  return count + "th";
}

export function finishedLine(count: number, siteName: string) {
  return `I just finished my ${ordinal(count)} day on the ${siteName}.`;
}

export function shareQuizResult(count: number, siteName: string, url: string) {
  const text = finishedLine(count, siteName);
  const body = url ? `${text}\n${url}` : text;
  const nav = globalThis.navigator;
  if (nav?.share) {
    return nav.share({ text: body }).then(
      () => "shared",
      () => "",
    );
  }
  if (nav?.clipboard?.writeText) {
    return nav.clipboard.writeText(body).then(
      () => "copied",
      () => "",
    );
  }
  return Promise.resolve("");
}

export function streakClientScript() {
  return `${nextStreak.toString()}
${streakLabel.toString()}
${ordinal.toString()}
${finishedLine.toString()}
${shareQuizResult.toString()}
function recordQuizStreak(langCode) {
  var today = new Date().toISOString().slice(0, 10);
  var key = "quiz-streak:" + langCode;
  var prev = null;
  try { prev = JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { prev = null; }
  if (!prev || typeof prev.count !== "number" || typeof prev.last !== "string" || prev.count < 1) prev = null;
  var next = nextStreak(prev, today);
  try { localStorage.setItem(key, JSON.stringify(next)); } catch (e) {}
  return { label: streakLabel(next.count), count: next.count };
}
`;
}

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

export function streakClientScript() {
  return `${nextStreak.toString()}
${streakLabel.toString()}
function recordQuizStreak(langCode) {
  var today = new Date().toISOString().slice(0, 10);
  var key = "quiz-streak:" + langCode;
  var prev = null;
  try { prev = JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { prev = null; }
  if (!prev || typeof prev.count !== "number" || typeof prev.last !== "string" || prev.count < 1) prev = null;
  var next = nextStreak(prev, today);
  try { localStorage.setItem(key, JSON.stringify(next)); } catch (e) {}
  return streakLabel(next.count);
}
`;
}

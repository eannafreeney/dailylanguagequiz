import type { Context } from "hono";
import { gradeAnswer, type Grade } from "../lib/grade";
import { activeScript, languageView, nativeOptions, optionLabel, phraseReadingLine } from "../lib/script";
import { recordDailyParticipant } from "../lib/analytics";
import type { Env } from "../lib/email";
import { REGISTERED_LANGS, languages } from "../lib/languages";
import type { LangCode, Question } from "../types";
import { finishedLine, nextStreak, type Streak } from "../lib/streak";
import { getDailyQuestions, isLangCode } from "../utils";

const NS = "https://hyperview.org/hyperview";
const HXML = "application/vnd.hyperview+xml";

// ponytail: fixed top padding instead of a safe-area custom element.
// Upgrade by registering Hyperview's SafeAreaView and dropping paddingTop.

const published = languages.filter(
  (language) => language.siteUrl && REGISTERED_LANGS.has(language.langCode),
);

export function xml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const STYLES = `
<style id="Body" flex="1" backgroundColor="#ffffff" paddingTop="64" paddingBottom="32" paddingLeft="24" paddingRight="24" />
<style id="Title" fontSize="28" lineHeight="34" fontWeight="700" color="#0f172a" marginBottom="8" />
<style id="Muted" fontSize="16" lineHeight="22" color="#64748b" marginBottom="20" />
<style id="Kicker" fontSize="13" lineHeight="18" fontWeight="600" color="#64748b" marginBottom="4" />
<style id="Count" fontSize="13" lineHeight="18" fontWeight="600" color="#334155" marginBottom="12" />
<style id="Prompt" fontSize="22" lineHeight="30" fontWeight="700" color="#0f172a" marginBottom="20" />
<style id="PromptRtl" fontSize="22" lineHeight="30" fontWeight="700" color="#0f172a" marginBottom="20" textAlign="right" />
<style id="Track" flexDirection="row" height="8" backgroundColor="#e2e8f0" borderRadius="4" marginBottom="20" />
<style id="Card" borderWidth="1" borderColor="#e2e8f0" borderRadius="18" padding="16" marginBottom="12" />
<style id="Flag" fontSize="28" marginBottom="8" />
<style id="CardTitle" fontSize="18" lineHeight="24" fontWeight="700" color="#0f172a" />
<style id="Option" flexDirection="row" alignItems="center" justifyContent="space-between" borderWidth="1" borderColor="#e2e8f0" borderRadius="16" padding="14" marginBottom="10" />
<style id="OptionWrong" flexDirection="row" alignItems="center" justifyContent="space-between" borderWidth="1" borderColor="#dc2626" backgroundColor="#fef2f2" borderRadius="16" padding="14" marginBottom="10" />
<style id="OptionRight" flexDirection="row" alignItems="center" justifyContent="space-between" borderWidth="1" borderColor="#059669" backgroundColor="#ecfdf5" borderRadius="16" padding="14" marginBottom="10" />
<style id="OptionCopy" flex="1" marginRight="12" />
<style id="OptionLabel" fontSize="16" lineHeight="22" color="#1e293b" />
<style id="OptionLabelRtl" fontSize="16" lineHeight="22" color="#1e293b" textAlign="right" />
<style id="OptionLabelWrong" fontSize="16" lineHeight="22" fontWeight="700" color="#b91c1c" />
<style id="OptionLabelWrongRtl" fontSize="16" lineHeight="22" fontWeight="700" color="#b91c1c" textAlign="right" />
<style id="OptionLabelRight" fontSize="16" lineHeight="22" fontWeight="700" color="#065f46" />
<style id="OptionLabelRightRtl" fontSize="16" lineHeight="22" fontWeight="700" color="#065f46" textAlign="right" />
<style id="Letter" fontSize="14" color="#94a3b8" />
<style id="Pinyin" fontSize="14" lineHeight="20" color="#b91c1c" marginTop="2" />
<style id="Hint" fontSize="16" lineHeight="22" color="#475569" marginTop="8" />
<style id="Wrong" fontSize="16" lineHeight="22" fontWeight="700" color="#9a3412" marginTop="4" marginBottom="8" />
<style id="Right" fontSize="18" lineHeight="24" fontWeight="700" color="#065f46" marginTop="4" />
<style id="RightRtl" fontSize="18" lineHeight="24" fontWeight="700" color="#065f46" marginTop="4" textAlign="right" />
<style id="Phrase" fontSize="18" lineHeight="24" fontWeight="600" color="#064e3b" marginTop="8" />
<style id="PhraseRtl" fontSize="18" lineHeight="24" fontWeight="600" color="#064e3b" marginTop="8" textAlign="right" />
<style id="Button" backgroundColor="#0f172a" borderRadius="14" paddingTop="14" paddingBottom="14" paddingLeft="16" paddingRight="16" marginTop="16" alignItems="center" />
<style id="ButtonLabel" color="#ffffff" fontSize="16" lineHeight="22" fontWeight="700" />
<style id="Row" flexDirection="row" marginBottom="16" />
<style id="ShareCard" marginTop="24" borderTopWidth="1" borderTopColor="#a7f3d0" paddingTop="24" />
<style id="DoneTitle" fontSize="20" lineHeight="28" fontWeight="700" color="#022c22" />
<style id="ShareBox" marginTop="16" borderWidth="1" borderColor="#a7f3d0" borderRadius="12" padding="16" backgroundColor="#ffffff" />
<style id="ShareButton" marginTop="12" borderWidth="1" borderColor="#a7f3d0" borderRadius="12" paddingTop="12" paddingBottom="12" alignItems="center" />
<style id="ShareLabel" fontSize="16" lineHeight="22" fontWeight="700" color="#065f46" />
<style id="Link" fontSize="15" lineHeight="20" color="#64748b" marginRight="16" />
<style id="LinkOn" fontSize="15" lineHeight="20" fontWeight="700" color="#1e3a8a" marginRight="16" />
`;

function hxml(c: Context, body: string) {
  return c.newResponse(body, 200, {
    "Content-Type": HXML,
    "X-Robots-Tag": "noindex",
  });
}

function streakKey(langCode: string) {
  return `quiz-streak-${langCode}`;
}

function streakFromCookie(
  header: string | undefined,
  langCode: string,
): Streak | null {
  const entry = header
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${streakKey(langCode)}=`));
  if (!entry) return null;
  const [count, last] = decodeURIComponent(
    entry.slice(streakKey(langCode).length + 1),
  ).split(".");
  const parsed = Number(count);
  if (
    !Number.isInteger(parsed) ||
    parsed < 1 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(last ?? "")
  )
    return null;
  return { count: parsed, last };
}

function rememberStreak(c: Context, langCode: string) {
  const today = new Date().toISOString().slice(0, 10);
  const next = nextStreak(
    streakFromCookie(c.req.header("Cookie"), langCode),
    today,
  );
  return {
    count: next.count,
    cookie: `${streakKey(langCode)}=${next.count}.${next.last}; Path=/; Max-Age=31536000; SameSite=Lax`,
  };
}

function screen(styles: string, body: string) {
  return `<doc xmlns="${NS}"><screen><styles>${styles}</styles><body style="Body" scroll="true">${body}</body></screen></doc>`;
}

function button(href: string, label: string, action?: string) {
  const actionAttr = action ? ` action="${action}"` : "";
  return `<view style="Button" href="${xml(href)}"${actionAttr}><text style="ButtonLabel">${xml(label)}</text></view>`;
}

function answersMarkup(
  langCode: LangCode,
  question: Question,
  questionNumber: number,
  script: string,
  picked: string | undefined,
  reveal: string | undefined,
  standalone: boolean,
) {
  const ns = standalone ? ` xmlns="${NS}"` : "";
  const choices = question.options ?? [];
  const correctValue = choices[question.correctAnswer];
  const rtl = nativeOptions(question) && languageView(langCode).dir === "rtl";
  const options = choices
    .map((value, index) => {
      const label = optionLabel(question, index, script);
      const hint = question.readings?.[index] ?? "";
      const isPicked = picked !== undefined && value === picked;
      const rowStyle =
        isPicked && value === correctValue
          ? "OptionRight"
          : isPicked
            ? "OptionWrong"
            : "Option";
      const labelStyle =
        isPicked && value === correctValue
          ? rtl
            ? "OptionLabelRightRtl"
            : "OptionLabelRight"
          : isPicked
            ? rtl
              ? "OptionLabelWrongRtl"
              : "OptionLabelWrong"
            : rtl
              ? "OptionLabelRtl"
              : "OptionLabel";
      const query = new URLSearchParams({ id: question.id });
      const defaultScript = languageView(langCode).scripts[0]?.id ?? "";
      if (script && script !== defaultScript) query.set("script", script);
      const href = `/hv/${langCode}/answer/${questionNumber}?${query}`;
      const select = `<behavior trigger="select" action="replace" verb="post" href="${xml(href)}" target="answers" show-during-load="loading" />`;
      const revealMarkup =
        isPicked && reveal
          ? `<behavior trigger="load" action="replace-inner" href="#reveal" target="feedback" /><view hide="true"><view id="reveal">${reveal}</view></view>`
          : "";
      return `<option style="${rowStyle}" value="${xml(value)}">${select}<view style="OptionCopy">${revealMarkup}<text style="${labelStyle}">${xml(label)}</text>${hint ? `<text style="Pinyin">${xml(hint)}</text>` : ""}</view><text style="Letter">${String.fromCharCode(65 + index)}</text></option>`;
    })
    .join("");
  return `<select-single id="answers" name="answer"${ns}>${options}</select-single>`;
}

function quizView(
  langCode: LangCode,
  question: Question,
  questionNumber: number,
  script: string,
  standalone: boolean,
) {
  const ns = standalone ? ` xmlns="${NS}"` : "";
  const answers = answersMarkup(
    langCode,
    question,
    questionNumber,
    script,
    undefined,
    undefined,
    false,
  );
  return `<view id="quiz"${ns}><form>${answers}</form><view id="feedback"></view></view>`;
}

function correctAnswerBlock(
  langCode: LangCode,
  question: Question,
  script: string,
) {
  const label = optionLabel(question, question.correctAnswer, script);
  const view = languageView(langCode);
  const native = nativeOptions(question);
  const rightStyle = native && view.dir === "rtl" ? "RightRtl" : "Right";
  const parts = [
    `<text style="Hint">Correct answer</text>`,
    `<text style="${rightStyle}">${xml(label)}</text>`,
  ];
  const reading = question.readings?.[question.correctAnswer];
  if (reading) parts.push(`<text style="Pinyin">${xml(reading)}</text>`);
  if (native) parts.push(`<text style="Hint">${xml(question.question)}</text>`);
  else if (question.phrase && question.phrase !== label) {
    const phraseStyle = view.dir === "rtl" ? "PhraseRtl" : "Phrase";
    parts.push(`<text style="${phraseStyle}">${xml(question.phrase)}</text>`);
    const line = phraseReadingLine(question);
    if (line) parts.push(`<text style="Pinyin">${xml(line)}</text>`);
  }
  return parts.join("");
}

function shareCard(
  langCode: LangCode,
  phrase: string | undefined,
  count: number,
  questions: number,
) {
  const language = languages.find((item) => item.langCode === langCode);
  const siteName = language?.siteName ?? "Daily Language Quiz";
  const line = finishedLine(count, siteName);
  const url = language?.siteUrl ?? "";
  const host = url.replace(/^https?:\/\//, "");
  return `<view style="ShareCard"><text style="DoneTitle">🎉 You’ve completed today’s quiz!</text><text style="Hint">${questions} questions done. Come back tomorrow to keep building your ${xml(language?.englishName ?? "language")} skills.</text><view style="ShareBox"><text style="CardTitle">${xml(line)}</text>${host ? `<text style="Hint">${xml(host)}</text>` : ""}<view style="ShareButton"><behavior trigger="press" action="share" share-text="${xml(line)}" share-url="${xml(url)}" /><text style="ShareLabel">Share</text></view></view>${button(`/hv/${langCode}/question/0`, "Restart quiz")}</view>`;
}

function resultCopy(langCode: LangCode, grade: Grade, streakCount = 1) {
  const question = grade.question;
  if (grade.status === "incorrect" && question) {
    return correctAnswerBlock(langCode, question, grade.script);
  }
  if (grade.status === "invalid") {
    return `<text style="Wrong">${xml(grade.message ?? "Choose an answer.")}</text>`;
  }
  if (!question) return `<text style="Wrong">Try again.</text>`;
  const parts = [`<text style="Right">Correct</text>`];
  const view = languageView(langCode);
  if (nativeOptions(question)) {
    const shown = optionLabel(question, question.correctAnswer, grade.script);
    const promptStyle = view.dir === "rtl" ? "PromptRtl" : "Prompt";
    parts.push(`<text style="${promptStyle}">${xml(shown)}</text>`);
    const reading = question.readings?.[question.correctAnswer];
    if (reading) parts.push(`<text style="Pinyin">${xml(reading)}</text>`);
    parts.push(`<text style="Hint">${xml(question.question)}</text>`);
  }
  if (question.phrase) {
    const phraseStyle = view.dir === "rtl" ? "PhraseRtl" : "Phrase";
    parts.push(`<text style="${phraseStyle}">${xml(question.phrase)}</text>`);
    const line = phraseReadingLine(question);
    if (line) parts.push(`<text style="Pinyin">${xml(line)}</text>`);
  }
  if (question.explanation)
    parts.push(`<text style="Hint">${xml(question.explanation)}</text>`);
  if (grade.complete) {
    parts.push(
      shareCard(
        langCode,
        question.phrase,
        streakCount,
        grade.dailyQuestionsLength,
      ),
    );
  } else {
    const defaultScript = view.scripts[0]?.id ?? "";
    const next = `/hv/${langCode}/question/${grade.nextNumber}${grade.script && grade.script !== defaultScript ? `?script=${grade.script}` : ""}`;
    parts.push(button(next, "Next question"));
  }
  return parts.join("");
}

export const hvEntrypoint = (c: Context) =>
  hxml(
    c,
    `<doc xmlns="${NS}"><navigator id="root" type="stack"><nav-route id="home" href="/hv/home" /></navigator></doc>`,
  );

export const hvHome = (c: Context) => {
  const cards = published
    .map(
      (language) =>
        `<view style="Card" href="/hv/${language.langCode}/question/0"><text style="Flag">${xml(language.flag)}</text><text style="CardTitle">${xml(language.englishName)}</text><text style="Muted">${xml(language.name)}</text></view>`,
    )
    .join("");
  return hxml(
    c,
    screen(
      STYLES,
      `<text style="Title">Daily Language Quiz</text><text style="Muted">Five questions a day. Pick a language.</text>${cards}`,
    ),
  );
};

export const hvQuestion = async (c: Context) => {
  const rawLangCode = c.req.param("langCode");
  if (!rawLangCode || !isLangCode(rawLangCode)) return c.notFound();
  const langCode = rawLangCode;
  const questionNumber = Number(c.req.param("questionNumber"));
  const dailyQuestions = getDailyQuestions(langCode);
  const question = dailyQuestions[questionNumber];
  if (!Number.isInteger(questionNumber) || !question) {
    return hxml(
      c,
      screen(
        STYLES,
        `<text style="Title">Daily quiz</text><text style="Muted">That question isn't in today's set.</text>${button("/hv/home", "All languages", "navigate")}`,
      ),
    );
  }
  if (questionNumber === 0) {
    try {
      await recordDailyParticipant(
        c,
        (c as unknown as { env: Env }).env,
        langCode,
      );
    } catch (error) {
      console.error("Failed to record quiz start", error);
    }
  }
  const script = activeScript(langCode, c.req.query("script"));
  const language = languages.find((item) => item.langCode === langCode);
  const view = languageView(langCode);
  const done = questionNumber + 1;
  const left = Math.max(dailyQuestions.length - done, 0);
  const styles = `${STYLES}<style id="Fill" flex="${done}" height="8" backgroundColor="#059669" borderRadius="4" /><style id="Rest" flex="${left}" height="8" />`;
  const scriptRow =
    view.scripts.length > 1
      ? `<view style="Row">${view.scripts
          .map(
            (item) =>
              `<text style="${script === item.id ? "LinkOn" : "Link"}" action="reload" href="${xml(`/hv/${langCode}/question/${questionNumber}?script=${item.id}`)}">${xml(item.label)}</text>`,
          )
          .join("")}</view>`
      : "";
  const body = `<text style="Title">${xml(language?.englishName ?? "")}</text><text style="Kicker">Daily practice${question.level ? ` · ${xml(question.level)}` : ""}</text><text style="Count">Question ${done} of ${dailyQuestions.length}</text><view style="Track"><view style="Fill" />${left ? `<view style="Rest" />` : ""}</view><text style="Prompt">${xml(question.question)}</text>${scriptRow}${quizView(langCode, question, questionNumber, script, false)}<spinner id="loading" hide="true" />`;
  return hxml(c, screen(styles, body));
};

export const hvAnswer = async (c: Context) => {
  const rawLangCode = c.req.param("langCode");
  if (!rawLangCode || !isLangCode(rawLangCode)) return c.notFound();
  const langCode = rawLangCode;
  const questionNumber = Number(c.req.param("questionNumber"));
  const body = await c.req.parseBody();
  const url = new URL(c.req.url);
  const grade = gradeAnswer(langCode, questionNumber, {
    id: url.searchParams.get("id") ?? body.id,
    answer: body.answer,
    number: Number.isInteger(questionNumber)
      ? String(questionNumber)
      : undefined,
    script: url.searchParams.get("script") ?? body.script,
  });
  let streakCount = 1;
  let streakCookie: string | undefined;
  if (grade.complete) {
    const streak = rememberStreak(c, langCode);
    streakCount = streak.count;
    streakCookie = streak.cookie;
    try {
      await recordDailyParticipant(
        c,
        (c as unknown as { env: Env }).env,
        langCode,
        true,
      );
    } catch (error) {
      console.error("Failed to record quiz completion", error);
    }
    c.header("Set-Cookie", streakCookie, { append: true });
  }
  const feedback = resultCopy(langCode, grade, streakCount);
  if (!grade.question) {
    return hxml(c, `<view id="feedback" xmlns="${NS}">${feedback}</view>`);
  }
  const picked = typeof body.answer === "string" ? body.answer : undefined;
  return hxml(
    c,
    answersMarkup(
      langCode,
      grade.question,
      questionNumber,
      grade.script,
      picked,
      feedback,
      true,
    ),
  );
};

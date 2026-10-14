import { Context, Hono } from "hono";
import LanguagePage from "./routes/language";
import { languages } from "./lib/languages";
import { getDailyQuestions } from "./utils";
import Question from "./components/Question";
import Answer from "./components/Answer";
import CheckAnswerButton from "./components/CheckAnswerButton";

type Subscriber = { email: string; lang_code: string; token: string; site_url: string };
type Statement = { bind(...values: unknown[]): Statement; first<T = Record<string, unknown>>(): Promise<T | null>; run(): Promise<{ success: boolean }>; all<T = Record<string, unknown>>(): Promise<{ results: T[] }> };
type Env = { DB: { prepare(sql: string): Statement }; RESEND_API_KEY: string; EMAIL_FROM: string };
type SchedulerContext = { waitUntil(promise: Promise<unknown>): void };
type SchedulerController = { cron: string; scheduledTime: number };

const DOMAIN_TO_LANG: Record<string, string> = {
  "mydaily.irish": "ga", "www.mydaily.irish": "ga",
  "mydailygermanquiz.com": "de", "www.mydailygermanquiz.com": "de",
  "ga.localhost": "ga", "de.localhost": "de",
};
const getHostLang = (c: Context) => DOMAIN_TO_LANG[new URL(c.req.url).hostname] as string | undefined;
const getEnv = (c: Context) => (c as unknown as { env: Env }).env;

async function sendEmail(env: Env, to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
  });
  if (!response.ok) {
    console.error("Resend email failed", response.status, await response.text());
    throw new Error("Email delivery failed");
  }
}

const app = new Hono();
app.use("*", async (c, next) => {
  const hostLang = getHostLang(c);
  if (hostLang) {
    const firstSegment = c.req.path.split("/")[1];
    if (languages.some((l) => l.langCode === firstSegment) && firstSegment !== hostLang) return c.notFound();
  }
  await next();
});
app.get("/", (c) => {
  const language = languages.find((item) => item.langCode === getHostLang(c));
  return language ? c.html(<LanguagePage {...language} />) : c.notFound();
});

app.post("/subscribe", async (c) => {
  const env = getEnv(c);
  const body = await c.req.parseBody();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const langCode = typeof body.langCode === "string" ? body.langCode : "";
  const language = languages.find((item) => item.langCode === langCode);
  const origin = new URL(c.req.url).origin;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !language || getHostLang(c) !== langCode) {
    return c.html("<main><h1>Invalid subscription</h1><p>Please return to the quiz and try again.</p><a href=\"/\">Back to quiz</a></main>", 400);
  }
  const token = crypto.randomUUID() + crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO subscribers (email, lang_code, token, site_url, confirmed, unsubscribed, created_at)
    VALUES (?, ?, ?, ?, 0, 0, datetime('now'))
    ON CONFLICT(email, lang_code) DO UPDATE SET token=excluded.token, site_url=excluded.site_url, confirmed=0, unsubscribed=0`)
    .bind(email, langCode, token, origin).run();
  const confirmUrl = new URL("/confirm", origin);
  confirmUrl.searchParams.set("token", token);
  await sendEmail(env, email, `Confirm your daily ${language.englishName} quiz`,
    `<p>Thanks for signing up for the daily ${language.englishName} quiz.</p><p><a href="${confirmUrl}">Confirm my email</a></p><p>If you didn't request this, ignore this email.</p>`);
  return c.html("<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><title>Check your email</title><body style=\"font-family:system-ui;max-width:40rem;margin:4rem auto;padding:1rem\"><h1>Check your email</h1><p>Please use the confirmation link we sent to start receiving the daily quiz.</p><a href=\"/\">Back to quiz</a></body></html>");
});

app.get("/confirm", async (c) => {
  const token = c.req.query("token");
  if (!token || token.length > 100) return c.text("This confirmation link is invalid or expired.", 400);
  const env = getEnv(c);
  const subscriber = await env.DB.prepare("SELECT site_url FROM subscribers WHERE token = ? AND unsubscribed = 0").bind(token).first<{ site_url: string }>();
  if (!subscriber) return c.text("This confirmation link is invalid or expired.", 400);
  await env.DB.prepare("UPDATE subscribers SET confirmed = 1 WHERE token = ?").bind(token).run();
  return c.redirect(new URL("/?subscribed=1", subscriber.site_url).toString());
});

app.get("/unsubscribe", async (c) => {
  const token = c.req.query("token");
  if (!token || token.length > 100) return c.text("This unsubscribe link is invalid.", 400);
  const env = getEnv(c);
  const subscriber = await env.DB.prepare("SELECT site_url FROM subscribers WHERE token = ?").bind(token).first<{ site_url: string }>();
  if (!subscriber) return c.text("This unsubscribe link is invalid.", 400);
  await env.DB.prepare("UPDATE subscribers SET unsubscribed = 1 WHERE token = ?").bind(token).run();
  return c.html(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Unsubscribed</title><body style="font-family:system-ui;max-width:40rem;margin:4rem auto;padding:1rem"><h1>You're unsubscribed</h1><p>You won't receive any more daily quiz emails.</p><a href="${subscriber.site_url}">Return to the quiz</a></body></html>`);
});

app.get("/:langCode/question/:questionNumber", (c) => {
  const langCode = c.req.param("langCode") as "ga" | "en";
  const questionNumber = Number(c.req.param("questionNumber"));
  const dailyQuestions = getDailyQuestions(langCode);
  const question = dailyQuestions[questionNumber];
  if (!Number.isInteger(questionNumber) || questionNumber < 0 || questionNumber >= dailyQuestions.length) return c.html("<p>Daily quiz complete!</p>");
  return c.html(<Question question={question} questionNumber={questionNumber} totalQuestions={dailyQuestions.length} langCode={langCode} />);
});
app.post("/:langCode/answer/:questionNumber", async (c) => {
  const langCode = c.req.param("langCode") as "ga" | "en";
  const questionNumber = Number(c.req.param("questionNumber"));
  const body = await c.req.parseBody();
  const { id, answer, number } = body;
  if (typeof id !== "string" || typeof number !== "string" || typeof answer !== "string" || !Number.isInteger(questionNumber) || questionNumber < 0 || Number(number) !== questionNumber) {
    return c.html(<><CheckAnswerButton /><Answer status="invalid" nextNumber={questionNumber} langCode={langCode} dailyQuestionsLength={0} message="Your submission is invalid. Please try again." /></>, 400);
  }
  const dailyQuestions = getDailyQuestions(langCode);
  const question = dailyQuestions[questionNumber];
  if (!question || question.id !== id) return c.html(<Answer status="invalid" langCode={langCode} nextNumber={questionNumber} dailyQuestionsLength={dailyQuestions.length} message="We couldn't find that question. Please refresh and try again." />, 400);
  if (!question.options.includes(answer)) return c.html(<Answer status="invalid" langCode={langCode} nextNumber={questionNumber} dailyQuestionsLength={dailyQuestions.length} />, 400);
  if (answer !== question.options[question.correctAnswer]) return c.html(<Answer status="incorrect" langCode={langCode} nextNumber={questionNumber} dailyQuestionsLength={dailyQuestions.length} />);
  return c.html(<Answer langCode={langCode} status="correct" question={question} nextNumber={questionNumber + 1} dailyQuestionsLength={dailyQuestions.length} />);
});

async function sendDailyEmails(env: Env) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  if (part("hour") !== "08" || part("minute") !== "00") return;
  const localDate = `${part("year")}-${part("month")}-${part("day")}`;

  const { results } = await env.DB.prepare(
    "SELECT email, lang_code, token, site_url FROM subscribers WHERE confirmed=1 AND unsubscribed=0",
  ).all<Subscriber>();
  for (const subscriber of results) {
    const language = languages.find((item) => item.langCode === subscriber.lang_code);
    if (!language) continue;
    const quizUrl = new URL("/", subscriber.site_url).toString();
    const unsubscribeUrl = new URL("/unsubscribe", subscriber.site_url);
    unsubscribeUrl.searchParams.set("token", subscriber.token);
    try {
      // Claim this recipient/date before sending so a retried scheduled event won't resend.
      const claim = await env.DB.prepare(
        "INSERT OR IGNORE INTO email_delivery_log (email, lang_code, local_date) VALUES (?, ?, ?)",
      ).bind(subscriber.email, subscriber.lang_code, localDate).run();
      if (!claim.success) continue;
      await sendEmail(env, subscriber.email, `Your daily ${language.englishName} quiz is ready`,
        `<p>Good morning!</p><p>Your daily ${language.englishName} practice is ready. Take five questions and build your skills a little every day.</p><p><a href="${quizUrl}">Start today's quiz</a></p><p style="font-size:12px;color:#666">You're receiving this because you subscribed to the daily quiz. <a href="${unsubscribeUrl}">Unsubscribe</a>.</p>`);
    } catch (error) {
      console.error("Could not send daily quiz email", subscriber.lang_code, error);
    }
  }
}
export default {
  fetch: app.fetch,
  scheduled(_controller: SchedulerController, env: Env, ctx: SchedulerContext) { ctx.waitUntil(sendDailyEmails(env)); },
};
export { app };

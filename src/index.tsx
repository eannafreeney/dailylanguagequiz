import { Context, Hono } from "hono";
import LanguagePage from "./routes/language";
import { subscribeHandler } from "./routes/subscribe";
import { confirmHandler } from "./routes/confirm";
import { unsubscribeHandler } from "./routes/unsubscribe";
import { languages } from "./lib/languages";
import { Env, sendEmail } from "./lib/email";
import { getDailyQuestions } from "./utils";
import Question from "./components/Question";
import Answer from "./components/Answer";
import CheckAnswerButton from "./components/CheckAnswerButton";

type Subscriber = { email: string; lang_code: string; token: string; site_url: string };
type SchedulerContext = { waitUntil(promise: Promise<unknown>): void };
type SchedulerController = { cron: string; scheduledTime: number };

const DOMAIN_TO_LANG: Record<string, string> = {
  "mydaily.irish": "ga", "www.mydaily.irish": "ga",
  "mydailygermanquiz.com": "de", "www.mydailygermanquiz.com": "de",
  "ga.localhost": "ga", "de.localhost": "de",
};
const getHostLang = (c: Context) => DOMAIN_TO_LANG[new URL(c.req.url).hostname] as string | undefined;

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

app.post("/subscribe", subscribeHandler);
app.get("/confirm", confirmHandler);
app.get("/unsubscribe", unsubscribeHandler);

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

async function sendDailyEmails(env: Env, scheduledTime: number) {
  // Use the scheduled instant, not runtime start time, to avoid missing the 08:00 window if execution is delayed.
  const now = new Date(scheduledTime);
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
      if (claim.meta?.changes !== 1) continue;
      await sendEmail(env, subscriber.email, `Your daily ${language.englishName} quiz is ready`,
        `<p>Good morning!</p><p>Your daily ${language.englishName} practice is ready. Take five questions and build your skills a little every day.</p><p><a href="${quizUrl}">Start today's quiz</a></p><p style="font-size:12px;color:#666">You're receiving this because you subscribed to the daily quiz. <a href="${unsubscribeUrl}">Unsubscribe</a>.</p>`);
    } catch (error) {
      // Remove the claim if sending failed, allowing a later scheduled retry to try again.
      try {
        await env.DB.prepare(
          "DELETE FROM email_delivery_log WHERE email = ? AND lang_code = ? AND local_date = ?",
        ).bind(subscriber.email, subscriber.lang_code, localDate).run();
      } catch (cleanupError) {
        console.error("Could not release failed email claim", subscriber.lang_code, cleanupError);
      }
      console.error("Could not send daily quiz email", subscriber.lang_code, error);
    }
  }
}
export default {
  fetch: app.fetch,
  scheduled(controller: SchedulerController, env: Env, ctx: SchedulerContext) { ctx.waitUntil(sendDailyEmails(env, controller.scheduledTime)); },
};
export { app };

import { Context, Hono } from "hono";
import LanguagePage from "./routes/language";
import { subscribeHandler } from "./routes/subscribe";
import { confirmHandler } from "./routes/confirm";
import { unsubscribeHandler } from "./routes/unsubscribe";
import { languages } from "./lib/languages";
import { Env, sendDailyEmails } from "./lib/email";
import { analyticsDashboard, recordDailyParticipant } from "./lib/analytics";
import { getDailyQuestions } from "./utils";
import Question from "./components/Question";
import Answer from "./components/Answer";
import CheckAnswerButton from "./components/CheckAnswerButton";
import { SchedulerContext, SchedulerController } from "./types";

const DOMAIN_TO_LANG: Record<string, string> = {
  "mydaily.irish": "ga",
  "www.mydaily.irish": "ga",
  "mydailygermanquiz.com": "de",
  "www.mydailygermanquiz.com": "de",
  "ga.localhost": "ga",
  "de.localhost": "de",
};
const getHostLang = (c: Context) =>
  DOMAIN_TO_LANG[new URL(c.req.url).hostname] as string | undefined;

const app = new Hono();
app.use("*", async (c, next) => {
  const hostLang = getHostLang(c);
  if (hostLang) {
    const firstSegment = c.req.path.split("/")[1];
    if (
      languages.some((l) => l.langCode === firstSegment) &&
      firstSegment !== hostLang
    )
      return c.notFound();
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
app.get("/analytics", (c) =>
  analyticsDashboard(c, (c as unknown as { env: Env }).env),
);

app.get("/:langCode/question/:questionNumber", (c) => {
  const langCode = c.req.param("langCode") as "ga" | "en";
  const questionNumber = Number(c.req.param("questionNumber"));
  const dailyQuestions = getDailyQuestions(langCode);
  const question = dailyQuestions[questionNumber];

  if (
    !Number.isInteger(questionNumber) ||
    questionNumber < 0 ||
    questionNumber >= dailyQuestions.length
  )
    return c.html("<p>Daily quiz complete!</p>");

  return c.html(
    <Question
      question={question}
      questionNumber={questionNumber}
      totalQuestions={dailyQuestions.length}
      langCode={langCode}
    />,
  );
});

app.post("/:langCode/answer/:questionNumber", async (c) => {
  const langCode = c.req.param("langCode") as "ga" | "en";
  const questionNumber = Number(c.req.param("questionNumber"));
  const body = await c.req.parseBody();
  const { id, answer, number } = body;

  if (
    typeof id !== "string" ||
    typeof number !== "string" ||
    typeof answer !== "string" ||
    !Number.isInteger(questionNumber) ||
    questionNumber < 0 ||
    Number(number) !== questionNumber
  ) {
    return c.html(
      <>
        <CheckAnswerButton />
        <Answer
          status="invalid"
          nextNumber={questionNumber}
          langCode={langCode}
          dailyQuestionsLength={0}
          message="Your submission is invalid. Please try again."
        />
      </>,
      400,
    );
  }

  const dailyQuestions = getDailyQuestions(langCode);
  const question = dailyQuestions[questionNumber];

  if (!question || question.id !== id) {
    return c.html(
      <Answer
        status="invalid"
        langCode={langCode}
        nextNumber={questionNumber}
        dailyQuestionsLength={dailyQuestions.length}
        message="We couldn't find that question. Please refresh and try again."
      />,
      400,
    );
  }

  if (!question.options.includes(answer)) {
    return c.html(
      <Answer
        status="invalid"
        langCode={langCode}
        nextNumber={questionNumber}
        dailyQuestionsLength={dailyQuestions.length}
      />,
      400,
    );
  }

  const isCorrect = answer === question.options[question.correctAnswer];

  if (!isCorrect) {
    return c.html(
      <>
        <CheckAnswerButton />
        <Answer
          status="incorrect"
          langCode={langCode}
          nextNumber={questionNumber}
          dailyQuestionsLength={dailyQuestions.length}
        />
      </>,
    );
  }

  if (questionNumber + 1 >= dailyQuestions.length) {
    try {
      await recordDailyParticipant(c, (c as unknown as { env: Env }).env, langCode);
    } catch (error) {
      console.error("Failed to record quiz completion", error);
    }
  }

  return c.html(
    <Answer
      langCode={langCode}
      status="correct"
      question={question}
      nextNumber={questionNumber + 1}
      dailyQuestionsLength={dailyQuestions.length}
    />,
  );
});

export default {
  fetch: app.fetch,
  scheduled(controller: SchedulerController, env: Env, ctx: SchedulerContext) {
    ctx.waitUntil(sendDailyEmails(env, controller.scheduledTime));
  },
};
export { app };

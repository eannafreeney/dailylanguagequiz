import { Context, Hono } from "hono";
import LanguagePage from "./routes/language";
import { languages } from "./lib/languages";
import { serveStatic } from "@hono/node-server/serve-static";
import { getDailyQuestions } from "./utils";
import Question from "./components/Question";
import Answer from "./components/Answer";
import CheckAnswerButton from "./components/CheckAnswerButton";

const DOMAIN_TO_LANG: Record<string, string> = {
  "mydaily.irish": "ga",
  "www.mydaily.irish": "ga",
  "mydailygermanquiz.com": "de",
  "www.mydailygermanquiz.com": "de",

  // local dev (*.localhost resolves to 127.0.0.1 in modern browsers)
  "ga.localhost": "ga",
  "de.localhost": "de",
};

const getHostLang = (c: Context) =>
  DOMAIN_TO_LANG[new URL(c.req.url).hostname] as string | undefined;

const app = new Hono();

// Stop a language domain from serving other languages
app.use("*", async (c, next) => {
  const hostLang = getHostLang(c);
  if (hostLang) {
    const firstSegment = c.req.path.split("/")[1];
    const isOtherLang =
      languages.some((l) => l.langCode === firstSegment) &&
      firstSegment !== hostLang;
    if (isOtherLang) return c.notFound();
  }
  await next();
});

app.get("/", (c) => {
  const hostLang = getHostLang(c);
  const language = languages.find((item) => item.langCode === hostLang);

  if (!language) {
    return c.notFound();
  }

  return c.html(<LanguagePage {...language} />);
});

app.get("/:langCode/question/:questionNumber", (c) => {
  const langCode = c.req.param("langCode") as "ga" | "en";
  const questionNumber = Number(c.req.param("questionNumber"));

  const dailyQuestions = getDailyQuestions(langCode);
  const question = dailyQuestions[questionNumber];

  if (
    !Number.isInteger(questionNumber) ||
    questionNumber < 0 ||
    questionNumber >= dailyQuestions.length
  ) {
    return c.html("<p>Daily quiz complete!</p>");
  }

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

export default app;

console.log("Server running at http://localhost:3000");

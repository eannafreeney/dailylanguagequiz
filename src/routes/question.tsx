import Answer from "../components/Answer";
import Question from "../components/QuizPanel";
import { recordDailyParticipant } from "../lib/analytics";
import { Env } from "../lib/email";
import { gradeAnswer } from "../lib/grade";
import { getDailyQuestions, isLangCode } from "../utils";
import { Context } from "hono";

export const getQuestionHandler = async (c: Context) => {
  const rawLangCode = c.req.param("langCode");
  if (!rawLangCode || !isLangCode(rawLangCode)) return c.notFound();

  const langCode = rawLangCode;
  const questionNumber = Number(c.req.param("questionNumber"));
  const dailyQuestions = getDailyQuestions(langCode);

  if (
    !Number.isInteger(questionNumber) ||
    questionNumber < 0 ||
    questionNumber >= dailyQuestions.length
  ) {
    return c.html("<p>Daily quiz complete!</p>", 200, {
      "X-Robots-Tag": "noindex",
    });
  }
  const question = dailyQuestions[questionNumber];
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
  return c.html(
    <Question
      question={question}
      questionNumber={questionNumber}
      totalQuestions={dailyQuestions.length}
      langCode={langCode}
    />,
    200,
    { "X-Robots-Tag": "noindex" },
  );
};

export const answerQuestionHandler = async (c: Context) => {
  const rawLangCode = c.req.param("langCode");
  if (!rawLangCode || !isLangCode(rawLangCode)) return c.notFound();

  const langCode = rawLangCode;
  const questionNumber = Number(c.req.param("questionNumber"));
  const body = await c.req.parseBody();
  const grade = gradeAnswer(langCode, questionNumber, body);
  if (grade.complete) {
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
  }
  return c.html(
    <Answer
      langCode={langCode}
      status={grade.status}
      question={grade.question}
      nextNumber={grade.nextNumber}
      dailyQuestionsLength={grade.dailyQuestionsLength}
      message={grade.message}
      script={grade.script}
    />,
    grade.httpStatus,
  );
};

import Answer from "../components/Answer";
import CheckAnswerButton from "../components/CheckAnswerButton";
import Question from "../components/Question";
import { recordDailyParticipant } from "../lib/analytics";
import { Env } from "../lib/email";
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
    return c.html("<p>Daily quiz complete!</p>", 200, { "X-Robots-Tag": "noindex" });
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
  const { id, answer, number, script: submittedScript } = body;
  const script =
    langCode === "zh" && submittedScript === "traditional"
      ? "traditional"
      : "simplified";

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
        <CheckAnswerButton langCode={langCode} />
        <Answer
          status="invalid"
          nextNumber={questionNumber}
          langCode={langCode}
          dailyQuestionsLength={0}
          message="Your submission is invalid. Please try again."
          script={script}
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
        script={script}
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
        question={question}
        script={script}
      />,
      400,
    );
  }

  const isCorrect = answer === question.options[question.correctAnswer];
  if (!isCorrect) {
    return c.html(
      <>
        <CheckAnswerButton langCode={langCode} />
        <Answer
          status="incorrect"
          langCode={langCode}
          nextNumber={questionNumber}
          dailyQuestionsLength={dailyQuestions.length}
          question={question}
          script={script}
        />
      </>,
    );
  }

  if (questionNumber + 1 >= dailyQuestions.length) {
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
      status="correct"
      question={question}
      nextNumber={questionNumber + 1}
      dailyQuestionsLength={dailyQuestions.length}
      script={script}
    />,
  );
};

import type { LangCode, Question } from "../types";
import { getDailyQuestions } from "../utils";

export type Script = "simplified" | "traditional";

export type Grade = {
  status: "correct" | "incorrect" | "invalid";
  httpStatus: 200 | 400;
  message?: string;
  script: Script;
  question?: Question;
  nextNumber: number;
  dailyQuestionsLength: number;
  complete: boolean;
};

function scriptOf(langCode: LangCode, value: unknown): Script {
  return langCode === "zh" && value === "traditional" ? "traditional" : "simplified";
}

function textField(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export function gradeAnswer(
  langCode: LangCode,
  questionNumber: number,
  fields: { id?: unknown; answer?: unknown; number?: unknown; script?: unknown },
): Grade {
  const script = scriptOf(langCode, fields.script);
  const id = textField(fields.id);
  const answer = textField(fields.answer);
  const number = textField(fields.number);
  const base = {
    script,
    nextNumber: questionNumber,
    dailyQuestionsLength: 0,
    complete: false,
  };

  if (
    id === undefined ||
    number === undefined ||
    answer === undefined ||
    !Number.isInteger(questionNumber) ||
    questionNumber < 0 ||
    Number(number) !== questionNumber
  ) {
    return {
      ...base,
      status: "invalid",
      httpStatus: 400,
      message: "Your submission is invalid. Please try again.",
    };
  }

  const dailyQuestions = getDailyQuestions(langCode);
  const question = dailyQuestions[questionNumber];
  if (!question || question.id !== id) {
    return {
      ...base,
      status: "invalid",
      httpStatus: 400,
      dailyQuestionsLength: dailyQuestions.length,
      message: "We couldn't find that question. Please refresh and try again.",
    };
  }

  const choices =
    langCode === "zh" ? (question.simplifiedOptions ?? []) : (question.options ?? []);
  const correct = answer === choices[question.correctAnswer];
  if (!choices.includes(answer)) {
    return {
      ...base,
      status: "invalid",
      httpStatus: 400,
      question,
      dailyQuestionsLength: dailyQuestions.length,
    };
  }

  return {
    status: correct ? "correct" : "incorrect",
    httpStatus: 200,
    script,
    question,
    nextNumber: correct ? questionNumber + 1 : questionNumber,
    dailyQuestionsLength: dailyQuestions.length,
    complete: correct && questionNumber + 1 >= dailyQuestions.length,
  };
}

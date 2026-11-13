import { getDailyQuestions, isLangCode } from "../utils";
import { languages, quizHref } from "./languages";
import type { Env } from "./email";
import type { LangCode, Question } from "../types";

type BufferChannelMap = Partial<Record<LangCode, string>>;
type BufferCreatePostResponse = {
  data?: {
    createPost?: {
      post?: { id?: string; status?: string; dueAt?: string };
      message?: string;
    };
  };
  errors?: Array<{ message?: string }>;
};

const CREATE_POST_MUTATION = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ... on PostActionSuccess {
        post {
          id
          status
          dueAt
        }
      }
      ... on MutationError {
        message
      }
    }
  }
`;

function dublinDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    hour: part("hour"),
    minute: part("minute"),
  };
}

function parseChannelMap(value?: string): BufferChannelMap {
  if (!value) return {};
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("SOCIAL_BUFFER_CHANNELS must be a JSON object keyed by language code");

  const channels: BufferChannelMap = {};
  for (const [code, channelId] of Object.entries(parsed)) {
    if (isLangCode(code) && typeof channelId === "string" && channelId.trim())
      channels[code] = channelId.trim();
  }
  return channels;
}

export function buildDailySocialCaption(
  langCode: LangCode,
  question: Question,
) {
  const language = languages.find((item) => item.langCode === langCode);
  if (!language) throw new Error(`Unknown language: ${langCode}`);

  const options = (question.options ?? []).map(
    (option, index) => `${String.fromCharCode(65 + index)}. ${option}`,
  );
  const level = question.level ? ` · ${question.level}` : "";
  const quizUrl = quizHref(language);

  return [
    `${language.flag} ${language.siteName}`,
    "",
    `Today's question${level}:`,
    question.question,
    ...options,
    "",
    "Can you get it right? Take all five questions in today's quiz:",
    quizUrl,
    "",
    `#DailyQuiz #Learn${language.englishName.replace(/[^a-z]/gi, "")} #LanguageLearning`,
  ].join("\n");
}

async function createBufferPost(
  apiKey: string,
  channelId: string,
  caption: string,
  imageUrl: string,
) {
  const response = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CREATE_POST_MUTATION,
      variables: {
        input: {
          text: caption,
          channelId,
          schedulingType: "automatic",
          mode: "addToQueue",
          assets: [{ image: { url: imageUrl } }],
        },
      },
    }),
  });

  const payload = (await response.json()) as BufferCreatePostResponse;
  if (!response.ok)
    throw new Error(`Buffer API returned HTTP ${response.status}`);
  if (payload.errors?.length)
    throw new Error(payload.errors.map((item) => item.message ?? "GraphQL error").join("; "));

  const result = payload.data?.createPost;
  if (result?.message) throw new Error(result.message);
  if (!result?.post?.id) throw new Error("Buffer did not return a post ID");
  return result.post;
}

export async function sendDailySocialPosts(env: Env, scheduledTime: number) {
  const now = new Date(scheduledTime);
  const local = dublinDateParts(now);
  if (local.hour !== "08" || local.minute !== "00") return;

  if (!env.SOCIAL_BUFFER_API_KEY || !env.SOCIAL_BUFFER_CHANNELS || !env.SOCIAL_IMAGE_URL) {
    console.log(
      "[daily-social] Not configured; add SOCIAL_BUFFER_API_KEY, SOCIAL_BUFFER_CHANNELS and SOCIAL_IMAGE_URL to enable posting.",
    );
    return;
  }

  let channels: BufferChannelMap;
  try {
    channels = parseChannelMap(env.SOCIAL_BUFFER_CHANNELS);
  } catch (error) {
    console.error("[daily-social] Invalid channel configuration:", error);
    return;
  }

  const entries = Object.entries(channels) as Array<[LangCode, string]>;
  if (!entries.length) {
    console.log("[daily-social] No valid language channels configured.");
    return;
  }

  for (const [langCode, channelId] of entries) {
    const dailyQuestions = getDailyQuestions(langCode, now);
    const firstQuestion = dailyQuestions[0];
    if (!firstQuestion) {
      console.warn("[daily-social] No daily question found for", langCode);
      continue;
    }

    const claim = await env.DB.prepare(
      "INSERT OR IGNORE INTO social_post_log (lang_code, local_date) VALUES (?, ?)",
    )
      .bind(langCode, local.date)
      .run();
    if (claim.meta?.changes !== 1) continue;

    try {
      const caption = buildDailySocialCaption(langCode, firstQuestion);
      const post = await createBufferPost(
        env.SOCIAL_BUFFER_API_KEY,
        channelId,
        caption,
        env.SOCIAL_IMAGE_URL,
      );
      await env.DB.prepare(
        "UPDATE social_post_log SET buffer_post_id = ? WHERE lang_code = ? AND local_date = ?",
      )
        .bind(post.id, langCode, local.date)
        .run();
      console.log("[daily-social] Queued Buffer post", {
        langCode,
        date: local.date,
        postId: post.id,
        dueAt: post.dueAt,
      });
    } catch (error) {
      console.error("[daily-social] Could not queue post for", langCode, error);
      await env.DB.prepare(
        "DELETE FROM social_post_log WHERE lang_code = ? AND local_date = ? AND buffer_post_id IS NULL",
      )
        .bind(langCode, local.date)
        .run();
    }
  }
}

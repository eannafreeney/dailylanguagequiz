import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const subscribers = sqliteTable(
  "subscribers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    langCode: text("lang_code").notNull(),
    token: text("token").notNull(),
    siteUrl: text("site_url").notNull(),
    confirmed: integer("confirmed", { mode: "boolean" }).notNull().default(false),
    unsubscribed: integer("unsubscribed", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex("subscribers_token_unique").on(table.token),
    uniqueIndex("subscribers_email_lang_unique").on(table.email, table.langCode),
    index("idx_subscribers_delivery").on(table.confirmed, table.unsubscribed, table.langCode),
    check("subscribers_lang_code_check", sql.raw("lang_code in ('ga', 'de', 'ru')")),
    check("subscribers_confirmed_check", sql.raw("confirmed in (0, 1)")),
    check("subscribers_unsubscribed_check", sql.raw("unsubscribed in (0, 1)")),
  ],
);

export const emailDeliveryLog = sqliteTable(
  "email_delivery_log",
  {
    email: text("email").notNull(),
    langCode: text("lang_code").notNull(),
    localDate: text("local_date").notNull(),
    sentAt: text("sent_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [primaryKey({ columns: [table.email, table.langCode, table.localDate] })],
);

export const quizDailyParticipants = sqliteTable(
  "quiz_daily_participants",
  {
    visitorId: text("visitor_id").notNull(),
    localDate: text("local_date").notNull(),
    langCode: text("lang_code").notNull(),
    startedAt: text("started_at").notNull().default(sql`(datetime('now'))`),
    completedAt: text("completed_at"),
  },
  (table) => [
    primaryKey({ columns: [table.visitorId, table.localDate, table.langCode] }),
    index("idx_quiz_daily_participants_date").on(table.localDate, table.langCode),
  ],
);

export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
}, (table) => [check("user_profiles_display_name_length", sql`length(${table.displayName}) between 2 and 24`)]);

export const accountQuizCompletions = sqliteTable(
  "account_quiz_completions",
  {
    userId: text("user_id").notNull(),
    localDate: text("local_date").notNull(),
    langCode: text("lang_code").notNull(),
    score: integer("score").notNull(),
    completedAt: text("completed_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.localDate, table.langCode] }),
    index("idx_account_quiz_completions_date").on(table.localDate, table.langCode),
    index("idx_account_quiz_completions_user_date").on(table.userId, table.localDate),
    check("account_quiz_completions_lang_code_check", sql.raw("lang_code in ('ga', 'de', 'ru', 'it', 'zh')")),
    check("account_quiz_completions_score_check", sql`score >= 0 and score <= 5`),
  ],
);

export const accountQuizAnswers = sqliteTable(
  "account_quiz_answers",
  {
    userId: text("user_id").notNull(),
    localDate: text("local_date").notNull(),
    langCode: text("lang_code").notNull(),
    questionId: text("question_id").notNull(),
    answeredAt: text("answered_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.localDate, table.langCode, table.questionId] }),
    index("idx_account_quiz_answers_language_user").on(table.langCode, table.userId),
    check("account_quiz_answers_lang_code_check", sql.raw("lang_code in ('ga', 'de', 'ru', 'it', 'zh')")),
  ],
);

export const schema = {
  subscribers,
  emailDeliveryLog,
  quizDailyParticipants,
  userProfiles,
  accountQuizCompletions,
  accountQuizAnswers,
};

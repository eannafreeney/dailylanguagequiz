-- Account-owned quiz results. Authentication is handled by Supabase Auth;
-- user_id stores the verified Supabase user UUID (no local password storage).
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 2 AND 24),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One completion per user/date/language drives the independent streaks.
CREATE TABLE IF NOT EXISTS account_quiz_completions (
  user_id TEXT NOT NULL,
  local_date TEXT NOT NULL,
  lang_code TEXT NOT NULL CHECK (lang_code IN ('ga', 'de', 'ru', 'it', 'zh')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 5),
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, local_date, lang_code)
);

-- Each question can earn leaderboard credit once per user/date/language.
CREATE TABLE IF NOT EXISTS account_quiz_answers (
  user_id TEXT NOT NULL,
  local_date TEXT NOT NULL,
  lang_code TEXT NOT NULL CHECK (lang_code IN ('ga', 'de', 'ru', 'it', 'zh')),
  question_id TEXT NOT NULL,
  answered_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, local_date, lang_code, question_id)
);

CREATE INDEX IF NOT EXISTS idx_account_quiz_completions_date
ON account_quiz_completions (local_date, lang_code);

CREATE INDEX IF NOT EXISTS idx_account_quiz_completions_user_date
ON account_quiz_completions (user_id, local_date);

CREATE INDEX IF NOT EXISTS idx_account_quiz_answers_language_user
ON account_quiz_answers (lang_code, user_id);

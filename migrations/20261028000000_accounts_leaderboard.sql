-- Account-owned quiz results. Authentication is handled by Supabase Auth;
-- user_id stores the verified Supabase user UUID (no local password storage).
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS account_quiz_completions (
  user_id TEXT NOT NULL,
  local_date TEXT NOT NULL,
  lang_code TEXT NOT NULL CHECK (lang_code IN ('ga', 'de', 'ru', 'it', 'zh')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 5),
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, local_date, lang_code)
);

CREATE INDEX IF NOT EXISTS idx_account_quiz_completions_date
ON account_quiz_completions (local_date, lang_code);

CREATE INDEX IF NOT EXISTS idx_account_quiz_completions_user_date
ON account_quiz_completions (user_id, local_date);

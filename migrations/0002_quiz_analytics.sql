CREATE TABLE IF NOT EXISTS quiz_daily_participants (
  visitor_id TEXT NOT NULL,
  local_date TEXT NOT NULL,
  lang_code TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  PRIMARY KEY (visitor_id, local_date, lang_code)
);

CREATE INDEX IF NOT EXISTS idx_quiz_daily_participants_date
ON quiz_daily_participants (local_date, lang_code);

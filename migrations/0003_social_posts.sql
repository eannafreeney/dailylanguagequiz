CREATE TABLE IF NOT EXISTS social_post_log (
  lang_code TEXT NOT NULL,
  local_date TEXT NOT NULL,
  buffer_post_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (lang_code, local_date)
);

CREATE INDEX IF NOT EXISTS idx_social_post_log_date
ON social_post_log (local_date);

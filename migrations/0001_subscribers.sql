CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  lang_code TEXT NOT NULL CHECK (lang_code IN ('ga', 'de', 'ru')),
  token TEXT NOT NULL UNIQUE,
  site_url TEXT NOT NULL,
  confirmed INTEGER NOT NULL DEFAULT 0 CHECK (confirmed IN (0, 1)),
  unsubscribed INTEGER NOT NULL DEFAULT 0 CHECK (unsubscribed IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(email, lang_code)
);
CREATE INDEX IF NOT EXISTS idx_subscribers_delivery
ON subscribers (confirmed, unsubscribed, lang_code);

CREATE TABLE IF NOT EXISTS email_delivery_log (
  email TEXT NOT NULL,
  lang_code TEXT NOT NULL,
  local_date TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (email, lang_code, local_date)
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, endpoint)
);
CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id               TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  follow_up_enabled     INTEGER NOT NULL DEFAULT 1,
  follow_up_days        INTEGER NOT NULL DEFAULT 7,
  new_leads_enabled     INTEGER NOT NULL DEFAULT 1,
  high_score_enabled    INTEGER NOT NULL DEFAULT 1,
  high_score_threshold  INTEGER NOT NULL DEFAULT 8,
  weekly_summary        INTEGER NOT NULL DEFAULT 0,
  updated_at            TEXT NOT NULL
);

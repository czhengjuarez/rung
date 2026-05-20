CREATE TABLE IF NOT EXISTS feedback (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'other')),
  message     TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

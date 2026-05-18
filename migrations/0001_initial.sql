-- Rung — Phase 1 schema

CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  google_sub   TEXT NOT NULL UNIQUE,
  email        TEXT NOT NULL,
  name         TEXT NOT NULL,
  avatar_url   TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at   TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS shortcut_links (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  url          TEXT NOT NULL,
  icon         TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_links_user ON shortcut_links(user_id, sort_order);

CREATE TABLE IF NOT EXISTS applications (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company           TEXT NOT NULL,
  role              TEXT,
  location          TEXT,
  work_mode         TEXT,
  size              TEXT,
  industry          TEXT,
  status            TEXT NOT NULL DEFAULT 'Saved',
  stage             TEXT,
  referral          TEXT,
  salary_low        INTEGER,
  salary_high       INTEGER,
  salary_currency   TEXT,
  applied_at        TEXT,
  last_activity_at  TEXT,
  starred           INTEGER NOT NULL DEFAULT 0,
  notes             TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_apps_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_user_status ON applications(user_id, status);

CREATE TABLE IF NOT EXISTS application_events (
  id              TEXT PRIMARY KEY,
  application_id  TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  occurred_at     TEXT NOT NULL,
  notes           TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_app ON application_events(application_id);

CREATE TABLE IF NOT EXISTS profiles (
  user_id         TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  slug            TEXT UNIQUE,
  public_enabled  INTEGER NOT NULL DEFAULT 0,
  display_name    TEXT,
  headline        TEXT,
  avatar_url      TEXT
);

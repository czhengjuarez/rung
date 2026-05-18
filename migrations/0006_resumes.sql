CREATE TABLE IF NOT EXISTS resumes (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  label        TEXT NOT NULL,
  filename     TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size         INTEGER NOT NULL,
  r2_key       TEXT NOT NULL,
  resume_text  TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS resumes_user ON resumes(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS resume_tailored (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL,
  source_resume_id   TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  application_id     TEXT,
  job_lead_id        TEXT,
  job_title          TEXT,
  company            TEXT,
  tailored_text      TEXT NOT NULL,
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS resume_tailored_user ON resume_tailored(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS resume_tailored_source ON resume_tailored(source_resume_id);

CREATE TABLE IF NOT EXISTS lead_criteria (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  title_keywords TEXT,
  seniority TEXT,
  work_modes TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  location TEXT,
  include_keywords TEXT,
  exclude_keywords TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_sources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK(source_type IN ('greenhouse', 'lever', 'workable', 'rss')),
  slug TEXT,
  url TEXT,
  label TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job_leads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id TEXT REFERENCES lead_sources(id) ON DELETE SET NULL,
  external_url TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  work_mode TEXT,
  salary_hint TEXT,
  description TEXT,
  score INTEGER,
  score_reason TEXT,
  state TEXT NOT NULL DEFAULT 'new' CHECK(state IN ('new', 'dismissed', 'converted')),
  fetched_at TEXT NOT NULL,
  scored_at TEXT,
  converted_application_id TEXT REFERENCES applications(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS job_leads_user_url ON job_leads(user_id, external_url);

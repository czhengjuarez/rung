-- Phase 2: Recruiter CRM

CREATE TABLE IF NOT EXISTS contacts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  company       TEXT,
  role          TEXT,
  email         TEXT,
  linkedin      TEXT,
  notes         TEXT,
  last_touch_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id, last_touch_at DESC);

CREATE TABLE IF NOT EXISTS application_contacts (
  application_id  TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  contact_id      TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  relationship    TEXT NOT NULL DEFAULT 'Other',
  PRIMARY KEY (application_id, contact_id)
);
CREATE INDEX IF NOT EXISTS idx_appcontacts_contact ON application_contacts(contact_id);

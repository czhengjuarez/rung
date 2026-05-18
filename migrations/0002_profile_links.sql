-- Profile public links (separate from shortcut_links which are private job-search tools)

CREATE TABLE IF NOT EXISTS profile_links (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_profile_links_user ON profile_links(user_id, sort_order);

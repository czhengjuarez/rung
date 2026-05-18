CREATE TABLE IF NOT EXISTS interview_questions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  tags TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('public', 'private')),
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS interview_answers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
  answer TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_iq_visibility ON interview_questions(visibility);
CREATE INDEX IF NOT EXISTS idx_iq_user ON interview_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_ia_user_question ON interview_answers(user_id, question_id);

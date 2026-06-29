-- Questions from Glassdoor Job Interview Cheat Sheet (desktop PDF)
-- Adds 5 questions not already covered by the library

INSERT OR IGNORE INTO interview_questions
  (id, user_id, question, category, tags, visibility, source, hint, created_at, updated_at)
VALUES

-- ── Behavioral ────────────────────────────────────────────────────────────────

  ('iqseed-beh-015', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you had to work with a difficult customer or external stakeholder.',
   'Behavioral', 'customer,communication,empathy,problem-solving', 'public', 'Glassdoor',
   'This is different from a difficult colleague — the dynamic is harder because you have less authority and the relationship matters commercially. Focus on your communication skills and empathy first, then your problem-solving. Show how you kept the relationship intact while still reaching a good outcome. Avoid making the customer the villain.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-016', 'rngsys00-0000-0000-0000-000000000001',
   'How do you handle constructive criticism?',
   'Behavioral', 'feedback,growth,self-awareness,coachability', 'public', 'Glassdoor',
   'Interviewers want to see that you''re coachable and don''t get defensive. Give a specific example: describe the criticism you received, how you responded in the moment, what you did with it, and the outcome. The best answers show that you actively sought feedback rather than just tolerated it — and that it visibly changed your behavior.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-017', 'rngsys00-0000-0000-0000-000000000001',
   'Can you give an example of how you improved a process at work?',
   'Behavioral', 'process-improvement,initiative,impact,efficiency', 'public', 'Glassdoor',
   'Use STAR and quantify wherever possible — time saved, error rate reduced, throughput increased. Show that you identified the problem yourself rather than being assigned to fix it. The most compelling answers reveal how you diagnosed the root cause, got buy-in from the people affected, and measured the improvement after.',
   datetime('now'), datetime('now')),

-- ── Situational ───────────────────────────────────────────────────────────────

  ('iqseed-sit-006', 'rngsys00-0000-0000-0000-000000000001',
   'What would you do if you were given a task you''ve never done before?',
   'Situational', 'resourcefulness,learning,problem-solving,initiative', 'public', 'Glassdoor',
   'This tests resourcefulness and learning agility. Walk through your actual approach: how you''d scope what you don''t know, the resources you''d draw on (docs, colleagues, past analogies), how you''d break it into manageable steps, and how you''d flag uncertainty without being paralyzed by it. Ground it in a real example of when you successfully did exactly this.',
   datetime('now'), datetime('now')),

  ('iqseed-sit-007', 'rngsys00-0000-0000-0000-000000000001',
   'How do you handle working in a fast-paced environment?',
   'Situational', 'fast-paced,adaptability,time-management,pressure', 'public', 'Glassdoor',
   'Don''t just say "I thrive under pressure" — prove it. Describe a specific period of high workload or rapid change and walk through what you did: how you prioritized, what you cut or delegated, how you communicated status to stakeholders, and what the outcome was. Show systems and habits, not just resilience.',
   datetime('now'), datetime('now'));

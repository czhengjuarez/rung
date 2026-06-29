-- Common interview questions from AcademyUX industry leaders + Glassdoor 50
-- Adds 13 questions not already covered by the base seed

INSERT OR IGNORE INTO interview_questions
  (id, user_id, question, category, tags, visibility, source, hint, created_at, updated_at)
VALUES

-- ── Behavioral ────────────────────────────────────────────────────────────────

  ('iqseed-beh-010', 'rngsys00-0000-0000-0000-000000000001',
   'To what do you attribute your success, excluding luck?',
   'Behavioral', 'self-awareness,mindset,success-drivers', 'public', 'AcademyUX',
   'This forces you to articulate the specific mental models, habits, and choices that drive your results — not circumstance. Name 2–3 concrete personal drivers (a framework you apply, a discipline you''ve built, a learning habit) and back each with an example. If you can''t explain your own success, that''s a signal to interviewers.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-011', 'rngsys00-0000-0000-0000-000000000001',
   'What''s the hardest thing you''ve ever done?',
   'Behavioral', 'resilience,grit,character', 'public', 'AcademyUX',
   'This is a character question, not a competence one. Choose something that reveals genuine perseverance — emotionally, technically, or interpersonally hard. Be specific about what made it hard, what you did to get through it, and what it changed about you. Avoid reframing a tough project when the question is really asking about you as a person.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-012', 'rngsys00-0000-0000-0000-000000000001',
   'Describe a controversial decision you were part of and how you navigated it.',
   'Behavioral', 'judgment,stakeholders,trade-offs,courage', 'public', 'AcademyUX',
   'Interviewers want to see how you handle disagreement and ambiguity when there''s no clean answer. Describe the competing interests clearly, explain how you weighed the trade-offs, what you decided, and what you''d do the same or differently in hindsight. Avoid picking a "controversy" with an obvious right answer — the best examples are genuinely hard calls.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-013', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a good decision that didn''t work out, or one that worked for unexpected reasons.',
   'Behavioral', 'judgment,outcome-bias,intellectual-honesty', 'public', 'AcademyUX',
   'This separates outcome bias from sound reasoning. For the first version: describe a decision with solid logic that produced a bad result, and show you understood it was still the right call with the information you had. For the second: describe a win that happened differently than planned and show honesty about what actually drove the outcome. Both signal intellectual maturity.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-014', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you used data to influence a decision or change someone''s mind.',
   'Behavioral', 'data-driven,influence,analytical', 'public', 'Glassdoor',
   'Quantitative reasoning and data-driven storytelling are highly valued at most companies. Show how you identified the right data, made it accessible to a non-technical audience, and connected it to a business decision. The more specific the numbers and the clearer the before/after, the stronger your answer.',
   datetime('now'), datetime('now')),

-- ── Leadership ────────────────────────────────────────────────────────────────

  ('iqseed-lea-005', 'rngsys00-0000-0000-0000-000000000001',
   'What have you done to improve the speed or energy of a team you were part of?',
   'Leadership', 'team-dynamics,velocity,culture,motivation', 'public', 'AcademyUX',
   'Think beyond process improvements (stand-ups, retros) to the human dynamics: what reduced friction, built trust faster, unlocked motivation, or removed blockers for others. The best answers combine a specific practice or change you introduced with a tangible outcome — shipped faster, retained people longer, morale measurably improved.',
   datetime('now'), datetime('now')),

-- ── Situational ───────────────────────────────────────────────────────────────

  ('iqseed-sit-005', 'rngsys00-0000-0000-0000-000000000001',
   'What impact do you want to make in your first 90 days here?',
   'Situational', 'onboarding,ramp-up,expectations,planning', 'public', 'Glassdoor',
   'Research the company''s current priorities before answering. Show that you''d spend the first 30 days listening, learning the context, and building relationships — then shift to contributing. Avoid promising to "transform everything." Strong candidates balance ambition with humility: they know what they don''t know yet.',
   datetime('now'), datetime('now')),

-- ── Other ─────────────────────────────────────────────────────────────────────

  ('iqseed-oth-005', 'rngsys00-0000-0000-0000-000000000001',
   'Why are you leaving your current role?',
   'Other', 'transition,motivation,fit', 'public', 'Glassdoor',
   'Be honest but constructive. Never criticize your current employer — it signals poor judgment and makes interviewers wonder what you''ll say about them someday. Frame your answer around what you''re moving toward (new scope, deeper craft, better alignment with your goals) rather than what you''re escaping. Keep it brief and forward-looking.',
   datetime('now'), datetime('now')),

  ('iqseed-oth-006', 'rngsys00-0000-0000-0000-000000000001',
   'Why should we hire you over other candidates?',
   'Other', 'value-proposition,differentiation,confidence', 'public', 'Glassdoor',
   'This is your closing argument. Have a tight, confident answer ready: 2–3 specific things you bring that are directly relevant to this role and uncommon in the candidate pool. Back each claim with evidence. Don''t hedge ("I''m not sure what others bring") — own your strengths clearly and professionally without arrogance.',
   datetime('now'), datetime('now')),

  ('iqseed-oth-007', 'rngsys00-0000-0000-0000-000000000001',
   'How would your manager and close colleagues describe you?',
   'Other', 'self-awareness,reputation,feedback', 'public', 'Glassdoor',
   'This tests self-awareness and alignment between your self-perception and how others experience you. Give specific adjectives — then immediately back each with a concrete example or evidence. Avoid generic words like "hardworking" or "team player" without proof. Even better if you can reference actual feedback you''ve received in reviews or from peers.',
   datetime('now'), datetime('now')),

  ('iqseed-oth-008', 'rngsys00-0000-0000-0000-000000000001',
   'What does success look like to you professionally?',
   'Other', 'values,success,fit,ambition', 'public', 'Glassdoor',
   'This reveals your values and whether they fit the company''s culture. Define success in terms of impact, growth, and contribution — not just title or compensation. Be specific about what meaningful work feels like to you, and show how this role is on that path. Alignment here is a green flag; misalignment is often a quiet reason offers don''t come.',
   datetime('now'), datetime('now')),

  ('iqseed-oth-009', 'rngsys00-0000-0000-0000-000000000001',
   'Fast forward three years — what''s different about you?',
   'Other', 'growth,self-development,trajectory', 'public', 'AcademyUX',
   'More specific and revealing than "where do you see yourself in five years." Describe concrete skills you''ll have built, the type of scope or impact you''ll be owning, and how your thinking will have evolved. Show that you''ve seriously considered your own development arc — and that this role is a meaningful part of the path, not just a stepping stone.',
   datetime('now'), datetime('now')),

  ('iqseed-oth-010', 'rngsys00-0000-0000-0000-000000000001',
   'If you weren''t working in this field, what would you be doing?',
   'Other', 'curiosity,character,identity', 'public', 'AcademyUX',
   'This is a character question, not a career one. Interviewers listen for intellectual curiosity, depth, and self-knowledge. A thoughtful, genuine answer — even if unusual — is far more compelling than a safe one. Avoid saying "I can''t imagine anything else." Show that you''re a whole person with genuine interests, not just a resume.',
   datetime('now'), datetime('now')),

  ('iqseed-oth-011', 'rngsys00-0000-0000-0000-000000000001',
   'What''s something widely accepted in your field that you think is wrong or overrated?',
   'Other', 'contrarian-thinking,intellectual-courage,craft', 'public', 'AcademyUX',
   'This tests intellectual courage and original thinking. Pick something you genuinely believe and can defend with evidence or reasoning — not just for effect. Show you''ve thought deeply about your craft and are willing to challenge conventional wisdom constructively. The ability to disagree with ideas while respecting the people who hold them is a hallmark of senior contributors.',
   datetime('now'), datetime('now'));

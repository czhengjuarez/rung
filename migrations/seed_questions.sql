-- Rung public question library seed
-- System seed user (used only for public library questions)
INSERT OR IGNORE INTO users (id, google_sub, email, name, avatar_url, created_at)
VALUES (
  'rngsys00-0000-0000-0000-000000000001',
  'rung_system_seed',
  'library@rung.app',
  'Rung Library',
  NULL,
  datetime('now')
);

-- ── Behavioral ────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO interview_questions
  (id, user_id, question, category, tags, visibility, source, hint, created_at, updated_at)
VALUES
  ('iqseed-beh-001', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you showed leadership.',
   'Behavioral', 'leadership,initiative,influence', 'public', 'LinkedIn',
   'Employers want to understand your capacity to step up and handle tough situations. They want to know when you''ve seen an opening to lean in and lead with good judgment — even when it wasn''t your formal job to do so.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-002', 'rngsys00-0000-0000-0000-000000000001',
   'Describe a situation where you had to deal with a difficult team member.',
   'Behavioral', 'conflict,teamwork,emotional-intelligence', 'public', 'LinkedIn',
   'This question reveals your conflict-resolution style and emotional intelligence. Focus on understanding the other person''s perspective, how you approached the conversation, and the outcome you achieved together — not on who was "right".',
   datetime('now'), datetime('now')),

  ('iqseed-beh-003', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you failed. What did you learn from it?',
   'Behavioral', 'failure,growth,resilience,self-awareness', 'public', 'LinkedIn',
   'Interviewers want to see self-awareness and a growth mindset — not perfection. Be honest and specific, show accountability, emphasize what you changed as a result, and avoid blaming others. The best candidates frame failure as fuel.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-004', 'rngsys00-0000-0000-0000-000000000001',
   'Give an example of a goal you set and how you achieved it.',
   'Behavioral', 'goals,planning,execution,results', 'public', 'Indeed',
   'This tests your ability to plan, stay motivated, and execute. Use a specific, measurable goal and walk through the steps you took systematically. Quantify the outcome — numbers make your answer concrete and memorable.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-005', 'rngsys00-0000-0000-0000-000000000001',
   'Describe a time you had to adapt quickly to a significant change at work.',
   'Behavioral', 'adaptability,change,resilience', 'public', 'Glassdoor',
   'Adaptability is one of the most sought-after traits. Show that you can stay effective under uncertainty and that you approach change with a positive, problem-solving mindset rather than resistance.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-006', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about your most impactful project. What was your specific contribution?',
   'Behavioral', 'impact,ownership,results', 'public', 'LinkedIn',
   'Choose a project where you can speak to your specific contribution and a measurable outcome. Quantify impact wherever possible (revenue, time saved, users). Avoid saying "we" for what you specifically did — interviewers need to understand your individual role.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-007', 'rngsys00-0000-0000-0000-000000000001',
   'Describe a time you had to deliver difficult feedback to someone.',
   'Behavioral', 'feedback,communication,leadership', 'public', 'LinkedIn',
   'Strong communicators give clear, compassionate feedback. Describe the context, how you prepared, the specific feedback you delivered, and the outcome. SBI (Situation-Behavior-Impact) is a great framework to structure your answer.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-008', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you went above and beyond what was expected.',
   'Behavioral', 'initiative,dedication,ownership', 'public', 'Indeed',
   'Employers want people who take ownership rather than doing the minimum. Show your intrinsic motivation — describe what triggered you to go further, what you did, and the tangible difference it made. Avoid examples that feel like bragging without substance.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-009', 'rngsys00-0000-0000-0000-000000000001',
   'Describe a time you disagreed with a decision at work and what you did.',
   'Behavioral', 'conflict,professionalism,influence', 'public', 'LinkedIn',
   'This tests your ability to challenge constructively rather than simply comply or complain. Show how you raised your concern with data, listened to the rationale, and either changed the outcome or accepted the decision gracefully and committed to the team direction.',
   datetime('now'), datetime('now')),

-- ── Leadership ────────────────────────────────────────────────────────────────

  ('iqseed-lea-001', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you had to lead without formal authority.',
   'Leadership', 'influence,cross-functional,persuasion', 'public', 'HBR',
   'Influence without authority is critical in flat or matrixed organizations. Show how you used persuasion, shared data, built trust, or aligned around a common goal to move people — without being able to simply direct them.',
   datetime('now'), datetime('now')),

  ('iqseed-lea-002', 'rngsys00-0000-0000-0000-000000000001',
   'How have you developed or mentored someone on your team?',
   'Leadership', 'coaching,mentorship,team-development', 'public', 'LinkedIn',
   'Hiring managers assess whether you invest in others'' growth. Describe a specific person, the skill or confidence gap you identified, how you supported them over time, and the measurable outcome — for them and for the team.',
   datetime('now'), datetime('now')),

  ('iqseed-lea-003', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you had to make a tough decision under uncertainty.',
   'Leadership', 'decision-making,ambiguity,risk', 'public', 'McKinsey Careers',
   'Leaders routinely decide with incomplete information. Show your framework: what data you gathered, how you weighed trade-offs, how you managed risk, and how you communicated the decision to stakeholders — including if it didn''t go as planned.',
   datetime('now'), datetime('now')),

  ('iqseed-lea-004', 'rngsys00-0000-0000-0000-000000000001',
   'Describe a time you had to rally a team that was demotivated or struggling.',
   'Leadership', 'motivation,team-morale,leadership', 'public', 'Glassdoor',
   'Leaders lift team energy — they don''t just manage tasks. Explain what caused the low morale, how you diagnosed the real issue, and what specific actions you took to re-energize the team. Results are key, but so is empathy.',
   datetime('now'), datetime('now')),

-- ── Situational ───────────────────────────────────────────────────────────────

  ('iqseed-sit-001', 'rngsys00-0000-0000-0000-000000000001',
   'If two high-priority projects clashed and you couldn''t do both well, how would you handle it?',
   'Situational', 'prioritization,conflict,stakeholders', 'public', 'Indeed',
   'Interviewers want to see how you prioritize and communicate under pressure. A strong answer shows clear criteria for prioritization (impact, urgency, dependencies), proactive stakeholder communication, and willingness to escalate when needed rather than silently dropping the ball.',
   datetime('now'), datetime('now')),

  ('iqseed-sit-002', 'rngsys00-0000-0000-0000-000000000001',
   'How would you handle a situation where your manager asked you to do something you disagreed with ethically?',
   'Situational', 'ethics,integrity,manager', 'public', 'Glassdoor',
   'Integrity questions are about your values and courage. Show that you would voice your concern clearly and professionally, document it if needed, and escalate appropriately — rather than either blindly complying or instantly refusing. Employers want backbone with maturity.',
   datetime('now'), datetime('now')),

  ('iqseed-sit-003', 'rngsys00-0000-0000-0000-000000000001',
   'How do you prioritize your work when everything feels urgent?',
   'Situational', 'prioritization,time-management,frameworks', 'public', 'Indeed',
   'Strong answers reference a framework (impact vs. effort, ICE scoring, MoSCoW) and give a real example. Show how you communicate trade-offs to stakeholders and revisit priorities as context changes — rather than just working longer hours.',
   datetime('now'), datetime('now')),

  ('iqseed-sit-004', 'rngsys00-0000-0000-0000-000000000001',
   'A key stakeholder strongly disagrees with your recommendation. How do you handle it?',
   'Situational', 'stakeholders,conflict,influence', 'public', 'LinkedIn',
   'Show that you lead with curiosity before advocacy. Describe how you''d listen to understand their objection, find shared ground, share your data and reasoning, and either update your position or agree to disagree with grace — while keeping the relationship intact.',
   datetime('now'), datetime('now')),

-- ── Technical ─────────────────────────────────────────────────────────────────

  ('iqseed-tec-001', 'rngsys00-0000-0000-0000-000000000001',
   'Walk me through how you approach solving a complex, ambiguous problem.',
   'Technical', 'problem-solving,structure,analytical', 'public', 'McKinsey Careers',
   'Walk through your structured process: how you define the problem and scope, identify root causes (5 Whys, issue trees, data), form hypotheses, test them, and decide on a solution. This reveals how you think, not just what you know.',
   datetime('now'), datetime('now')),

  ('iqseed-tec-002', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you had to learn a new tool or technology quickly.',
   'Technical', 'learning,ramp-up,adaptability', 'public', 'LinkedIn',
   'Speed of learning is prized. Describe your method: how you identified exactly what you needed to learn, the resources you used, how quickly you applied it, and the outcome. Show a repeatable learning approach, not just luck.',
   datetime('now'), datetime('now')),

-- ── Company-specific ──────────────────────────────────────────────────────────

  ('iqseed-com-001', 'rngsys00-0000-0000-0000-000000000001',
   'Why do you want to work here specifically?',
   'Company-specific', 'motivation,research,fit', 'public', 'LinkedIn',
   'Generic answers kill candidacies. Show you''ve done real research: name a specific product, initiative, culture element, or mission component that connects genuinely to your career goals. The more specific and personal, the more compelling.',
   datetime('now'), datetime('now')),

  ('iqseed-com-002', 'rngsys00-0000-0000-0000-000000000001',
   'Where do you see yourself in five years?',
   'Company-specific', 'career-goals,ambition,fit', 'public', 'Glassdoor',
   'Be honest about your growth goals while connecting them to what this company uniquely enables. Avoid both vagueness ("I just want to grow") and over-specificity ("I want your manager''s job"). Show ambition + self-awareness + company alignment.',
   datetime('now'), datetime('now')),

-- ── Other ─────────────────────────────────────────────────────────────────────

  ('iqseed-oth-001', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about yourself.',
   'Other', 'intro,background,pitch', 'public', 'HBR',
   'Your opening pitch. Structure it as: current role/context → the 2–3 past experiences most relevant to this role → why you''re here now and excited about this opportunity. Aim for 90 seconds, make it forward-looking, and tailor it to the specific job.',
   datetime('now'), datetime('now')),

  ('iqseed-oth-002', 'rngsys00-0000-0000-0000-000000000001',
   'What is your greatest professional strength?',
   'Other', 'strengths,self-awareness,fit', 'public', 'LinkedIn',
   'Pick one genuine, specific strength (not "I''m a hard worker") and back it with a concrete example. Then explicitly bridge it to the role''s requirements. Evidence beats assertion — "I''m strategic" means nothing; a story that shows it means everything.',
   datetime('now'), datetime('now')),

  ('iqseed-oth-003', 'rngsys00-0000-0000-0000-000000000001',
   'What is an area you are actively working to improve?',
   'Other', 'weakness,growth,self-awareness', 'public', 'LinkedIn',
   'Don''t say "I''m a perfectionist." Name a genuine development area, explain what triggered the realization, describe the concrete steps you''ve taken to improve, and give evidence of progress. This signals self-awareness and coachability — qualities top teams prize.',
   datetime('now'), datetime('now')),

  ('iqseed-oth-004', 'rngsys00-0000-0000-0000-000000000001',
   'What motivates you in your work?',
   'Other', 'motivation,values,fit', 'public', 'Glassdoor',
   'Be authentic and specific. Tie your answer to things the role actually provides — impact, craft, learning, autonomy, collaboration — and give evidence from your career. Vague answers ("I like challenges") read as rehearsed; honest ones resonate.',
   datetime('now'), datetime('now'));

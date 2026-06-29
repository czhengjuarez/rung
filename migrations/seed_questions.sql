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
   datetime('now'), datetime('now')),

-- ── Behavioral (continued) ────────────────────────────────────────────────────

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

-- ── Leadership (continued) ────────────────────────────────────────────────────

  ('iqseed-lea-005', 'rngsys00-0000-0000-0000-000000000001',
   'What have you done to improve the speed or energy of a team you were part of?',
   'Leadership', 'team-dynamics,velocity,culture,motivation', 'public', 'AcademyUX',
   'Think beyond process improvements (stand-ups, retros) to the human dynamics: what reduced friction, built trust faster, unlocked motivation, or removed blockers for others. The best answers combine a specific practice or change you introduced with a tangible outcome — shipped faster, retained people longer, morale measurably improved.',
   datetime('now'), datetime('now')),

-- ── Situational (continued) ───────────────────────────────────────────────────

  ('iqseed-sit-005', 'rngsys00-0000-0000-0000-000000000001',
   'What impact do you want to make in your first 90 days here?',
   'Situational', 'onboarding,ramp-up,expectations,planning', 'public', 'Glassdoor',
   'Research the company''s current priorities before answering. Show that you''d spend the first 30 days listening, learning the context, and building relationships — then shift to contributing. Avoid promising to "transform everything." Strong candidates balance ambition with humility: they know what they don''t know yet.',
   datetime('now'), datetime('now')),

-- ── Other (continued) ─────────────────────────────────────────────────────────

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

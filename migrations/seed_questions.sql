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
   datetime('now'), datetime('now')),

-- ── Behavioral (from Glassdoor cheat sheet) ───────────────────────────────────

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

-- ── Situational (from Glassdoor cheat sheet) ──────────────────────────────────

  ('iqseed-sit-006', 'rngsys00-0000-0000-0000-000000000001',
   'What would you do if you were given a task you''ve never done before?',
   'Situational', 'resourcefulness,learning,problem-solving,initiative', 'public', 'Glassdoor',
   'This tests resourcefulness and learning agility. Walk through your actual approach: how you''d scope what you don''t know, the resources you''d draw on (docs, colleagues, past analogies), how you''d break it into manageable steps, and how you''d flag uncertainty without being paralyzed by it. Ground it in a real example of when you successfully did exactly this.',
   datetime('now'), datetime('now')),

  ('iqseed-sit-007', 'rngsys00-0000-0000-0000-000000000001',
   'How do you handle working in a fast-paced environment?',
   'Situational', 'fast-paced,adaptability,time-management,pressure', 'public', 'Glassdoor',
   'Don''t just say "I thrive under pressure" — prove it. Describe a specific period of high workload or rapid change and walk through what you did: how you prioritized, what you cut or delegated, how you communicated status to stakeholders, and what the outcome was. Show systems and habits, not just resilience.',
   datetime('now'), datetime('now')),

-- ── Behavioral (from Google Doc prep list) ────────────────────────────────────

  ('iqseed-beh-018', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you were successful on a team.',
   'Behavioral', 'teamwork,collaboration,communication,interpersonal', 'public', 'Glassdoor',
   'This tests collaboration and interpersonal skills — qualities often harder to evaluate than technical competence. Focus on what you specifically contributed to the shared outcome, how you supported teammates, and how you navigated group dynamics. The best answers show you understand the difference between individual contribution and team success.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-019', 'rngsys00-0000-0000-0000-000000000001',
   'Describe your most challenging project.',
   'Behavioral', 'challenge,resilience,problem-solving,complexity', 'public', 'Glassdoor',
   'Different from "most impactful" — interviewers want to understand how you define and navigate difficulty. Was it technically hard, politically complex, under-resourced, or personally demanding? Be specific about what made it hard for you, not just objectively hard. Show how you diagnosed the challenge, what you did, and what you took away from it.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-020', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about something you have accomplished that you are proud of.',
   'Behavioral', 'pride,impact,ownership,motivation', 'public', 'Glassdoor',
   'Choose something where you were genuinely proud — the emotion signals real investment. The best answers combine a meaningful challenge, clear personal contribution, measurable impact, and some reflection on why it matters to you. Avoid picking the most impressive-sounding project if it is not the one you are actually proud of — authenticity reads better.',
   datetime('now'), datetime('now')),

  ('iqseed-beh-021', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you had to persuade someone.',
   'Behavioral', 'persuasion,influence,emotional-intelligence,communication', 'public', 'Glassdoor',
   'This is about emotional intelligence and communication, not just logic. Show how you listened first to understand the other person''s position, then built your case using both data and framing that resonated with their priorities — not yours. The strongest answers demonstrate that you changed someone''s mind without winning an argument; the relationship stayed intact or improved.',
   datetime('now'), datetime('now')),

-- ── Leadership (from Google Doc prep list) ────────────────────────────────────

  ('iqseed-lea-006', 'rngsys00-0000-0000-0000-000000000001',
   'Describe your leadership style.',
   'Leadership', 'style,values,self-awareness,culture', 'public', 'Glassdoor',
   'Good leaders articulate their values and approach in concrete terms. Avoid vague labels like "servant leader" or "collaborative." Instead, name a specific principle you lead by, show how it plays out in practice with a real example, and connect it to outcomes it produced. If your style has evolved, say so — self-awareness about how you''ve grown is a bonus signal.',
   datetime('now'), datetime('now')),

-- ── Other (from Google Doc prep list) ─────────────────────────────────────────

  ('iqseed-oth-012', 'rngsys00-0000-0000-0000-000000000001',
   'What are your salary expectations?',
   'Other', 'compensation,negotiation,market-research,self-advocacy', 'public', 'Glassdoor',
   'Do your research first: know the market range using LinkedIn Salary, Glassdoor, Levels.fyi, or Payscale for your role, seniority, and location. When asked early, it is fine to say you would like to learn more about the full scope first. When pressed, give a range anchored in market data — not your current salary. A well-anchored range signals you know your value and have done your homework.',
   datetime('now'), datetime('now')),

-- ── DesignOps (new category – from Google Doc DPM prep section) ───────────────

  ('iqseed-dop-001', 'rngsys00-0000-0000-0000-000000000001',
   'How do you approach breaking a large, ambiguous design initiative into manageable workstreams?',
   'DesignOps', 'planning,ambiguity,decomposition,program-management', 'public', 'DPM Interview Prep',
   'Show your decomposition instinct: how you define the initiative''s goals first, then identify the natural seams — team ownership, dependencies, sequencing — to cut it into workstreams. Walk through a real example: what was ambiguous, how you got enough clarity to plan, how you communicated the structure to others, and what you adjusted along the way. Show both the framework and the flexibility.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-002', 'rngsys00-0000-0000-0000-000000000001',
   'Can you walk me through how you manage capacity planning and resource allocation across multiple design teams?',
   'DesignOps', 'capacity-planning,resource-allocation,forecasting,operations', 'public', 'DPM Interview Prep',
   'Cover both the mechanics and the judgment: how you track who has bandwidth, how you forecast demand from roadmaps and headcount, how you handle competing requests, and how you make trade-off decisions transparently. Mention tools or artifacts you have built (capacity boards, intake processes), but anchor the answer in a real scenario where allocation was hard and how you resolved it.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-003', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you had to unblock a design team mid-project. What was the blocker and how did you resolve it?',
   'DesignOps', 'unblocking,dependency-management,problem-solving,execution', 'public', 'DPM Interview Prep',
   'DPMs are often measured by their ability to remove friction. Be specific about the blocker type — decision delay, dependency from another team, unclear requirements, tooling gap — and show that you diagnosed the root cause before acting. Walk through exactly what you did, who you pulled in, and how quickly you resolved it. Bonus if you show what systemic fix you put in place to prevent recurrence.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-004', 'rngsys00-0000-0000-0000-000000000001',
   'How do you ensure design projects align with wider business objectives while maintaining design quality?',
   'DesignOps', 'alignment,business-objectives,quality,trade-offs', 'public', 'DPM Interview Prep',
   'This tests whether you can hold two tensions at once. Show how you translate business goals into design success criteria at project kickoff, how you create feedback loops with product and strategy stakeholders throughout, and how you protect design quality without being rigid about scope. Give a specific example of a moment when you had to push back — and how you framed the trade-off.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-005', 'rngsys00-0000-0000-0000-000000000001',
   'When managing a multi-squad initiative, how do you handle overlapping dependencies and ensure delivery?',
   'DesignOps', 'dependencies,multi-squad,delivery,coordination', 'public', 'DPM Interview Prep',
   'Dependency management at scale is a core DPM skill. Describe your approach: how you map dependencies early (dependency matrix, RACI, shared milestones), how you surface conflicts before they become blockers, and how you keep multiple squads coordinated without micromanaging. Include a real example of a cross-squad dependency that went sideways and how you caught and fixed it.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-006', 'rngsys00-0000-0000-0000-000000000001',
   'What is your strategy for engaging senior stakeholders like heads of product or engineering when there is misalignment in priorities?',
   'DesignOps', 'stakeholders,senior-leadership,misalignment,proactive', 'public', 'DPM Interview Prep',
   'Unlike handling a single stakeholder disagreement reactively, this is about proactive relationship management at a systemic level. Show how you build regular touchpoints, share context before misalignment hardens, and frame design needs in terms of the exec''s own success metrics. Describe a time you proactively prevented a conflict rather than just reacting to one.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-007', 'rngsys00-0000-0000-0000-000000000001',
   'Can you give an example where you acted as a bridge between product, design, and engineering to resolve a conflict or confusion?',
   'DesignOps', 'cross-functional,bridge,conflict-resolution,alignment', 'public', 'DPM Interview Prep',
   'Translation is the DPM''s superpower. Show that you understood the root cause of the misalignment — usually different mental models, timelines, or success criteria — and how you created shared language or a shared artifact (a spec, a trade-off doc, a meeting structure) that aligned all three disciplines. Don''t just say you "facilitated" — show specifically what you built or changed.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-008', 'rngsys00-0000-0000-0000-000000000001',
   'How do you build strong working relationships with design leaders and translate their needs into scalable processes?',
   'DesignOps', 'relationships,design-leaders,scalable-processes,trust', 'public', 'DPM Interview Prep',
   'This tests both interpersonal skill and systems thinking. Talk about how you earn trust with design leads — what you do to understand their actual pain points vs. stated requests. Then show how you take individual needs and design a process that serves many: a template, a ritual, a shared resource. The translation step is what makes DPMs strategically valuable.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-009', 'rngsys00-0000-0000-0000-000000000001',
   'How do you structure updates for senior leadership that highlight both risks and impact clearly?',
   'DesignOps', 'executive-communication,status-updates,risks,impact', 'public', 'DPM Interview Prep',
   'Exec communication is about brevity and prioritization. Show your format: lead with status (on track / at risk / blocked), surface the top 1–2 risks with a mitigation plan, and connect work to business outcomes — not design outputs. Describe a time you had to deliver a difficult status update and how you prepared the exec to make a decision, not just hear a report.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-010', 'rngsys00-0000-0000-0000-000000000001',
   'How have you created or evolved a design delivery toolkit or ritual system that helped scale design output or velocity?',
   'DesignOps', 'tooling,rituals,velocity,systems-thinking', 'public', 'DPM Interview Prep',
   'Show systems thinking applied to design operations. What problem did you identify — inconsistent handoffs, unclear review stages, slow feedback loops? What did you build or introduce: templates, process docs, recurring rituals, shared tooling? How did you get adoption? What measurably changed? The strongest answers include before/after signals and evidence that the system outlasted your active involvement.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-011', 'rngsys00-0000-0000-0000-000000000001',
   'What metrics or KPIs have you used to measure design program health or delivery success?',
   'DesignOps', 'metrics,kpis,program-health,measurement', 'public', 'DPM Interview Prep',
   'Strong candidates combine delivery metrics (cycle time, on-time rate, scope drift) with quality indicators (design debt backlog, rework rate, QA pass rate) and team health signals (capacity utilization, designer satisfaction). Be prepared to discuss what you measured, why, and what actions the metrics actually drove. On-time delivery alone is a lagging indicator — show you think beyond it.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-012', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a process or framework you introduced to improve cross-functional collaboration or visibility. What was the impact?',
   'DesignOps', 'cross-functional,process,framework,visibility', 'public', 'DPM Interview Prep',
   'More specific than a generic process improvement — this is about cross-functional coordination. Describe the friction you observed, the specific stakeholders affected, and what you designed to address it: a shared ritual, an artifact, a communication cadence, a decision framework. Quantify the impact if you can: fewer misalignments, faster reviews, clearer ownership. Show adoption was real, not just nominal.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-013', 'rngsys00-0000-0000-0000-000000000001',
   'What does good QA look like to you in the design process? How have you helped a team raise the bar?',
   'DesignOps', 'qa,quality,handoff,standards', 'public', 'DPM Interview Prep',
   'QA in design means ensuring what ships matches what was designed and meets quality standards across accessibility, interaction fidelity, and edge cases. Describe where you have seen QA break down — last-minute spec changes, unclear handoff criteria, no shared quality bar — what you put in place to fix it, and how you defined "good enough" in a way the team could operationalize. Show that you hold the bar without slowing velocity.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-014', 'rngsys00-0000-0000-0000-000000000001',
   'How do you decide when to formalise a process vs. leave it flexible and team-owned?',
   'DesignOps', 'process-design,judgment,autonomy,maturity', 'public', 'DPM Interview Prep',
   'Over-process is as damaging as no process. Show your heuristic: when is the team large enough, the handoff complex enough, or the error rate high enough that standardization adds value? Give an example of a time you resisted the temptation to create a process, and one where you overcame team resistance to add one that was genuinely needed. The judgment call is the answer.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-015', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time when you had to collaborate across multiple teams to drive a design program forward. How did you handle conflicting perspectives?',
   'DesignOps', 'cross-functional,program-management,collaboration,conflict', 'public', 'DPM Interview Prep',
   'Emphasize program-level thinking: how you mapped stakeholders, created shared goals, surfaced conflicts early, and maintained momentum without having direct authority. The strongest answers show how you used a shared artifact or structured process — not just relationship management — to align teams with genuinely different incentives.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-016', 'rngsys00-0000-0000-0000-000000000001',
   'How have you helped a team transition to new goals after a major strategic shift?',
   'DesignOps', 'change-management,team-transition,strategy,communication', 'public', 'DPM Interview Prep',
   'This is different from adapting yourself — it is about enabling others. Show empathy first: what was the team''s emotional response to the shift, and how did you acknowledge it? Then describe the operational work: how you helped reframe existing work, reorient priorities, and communicate the change upward and downward. What did you do to protect team morale while the direction changed?',
   datetime('now'), datetime('now')),

  ('iqseed-dop-017', 'rngsys00-0000-0000-0000-000000000001',
   'How do you influence executive decision-making in areas like design tooling, headcount, or process changes?',
   'DesignOps', 'executive-influence,tooling,headcount,business-case', 'public', 'DPM Interview Prep',
   'Executives respond to ROI, risk, and strategic alignment — not design quality alone. Show how you frame design investment in those terms: what is the cost of the status quo, what is the measured or projected return, how does it support company goals? Describe a specific decision you influenced — a tooling adoption, a headcount approval, a process change — and what you did to prepare the case and navigate the approval process.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-018', 'rngsys00-0000-0000-0000-000000000001',
   'Describe a strategy you have used to manage complex stakeholder landscapes with conflicting needs.',
   'DesignOps', 'stakeholder-management,strategy,conflict,alignment', 'public', 'DPM Interview Prep',
   'When many stakeholders have incompatible needs, the answer is structured engagement — not heroic diplomacy. Describe your approach: how you mapped the stakeholder landscape, built alignment on shared goals before getting to specifics, created a transparent decision framework, and made trade-offs visible rather than absorbing them invisibly. Give a specific example of a time this was genuinely hard, not just politically annoying.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-019', 'rngsys00-0000-0000-0000-000000000001',
   'Describe a situation where you had to balance design excellence with practical constraints like timelines or engineering limitations.',
   'DesignOps', 'design-quality,constraints,trade-offs,engineering,pragmatism', 'public', 'DPM Interview Prep',
   'Avoid positioning design excellence as the absolute value — show that you understand constraints are real and trade-offs are necessary. Describe how you identified what was truly non-negotiable from a quality perspective, what you let go of, how you made that decision collaboratively with design and engineering, and what you communicated to stakeholders. Show the outcome was good enough — and owned, not just accepted.',
   datetime('now'), datetime('now'));

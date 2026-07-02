-- Questions from Google Doc (user's curated prep list)
-- Adds 6 general questions + 19 DesignOps/DPM-specific questions

INSERT OR IGNORE INTO interview_questions
  (id, user_id, question, category, tags, visibility, source, hint, created_at, updated_at)
VALUES

-- ── Behavioral (general – not previously covered) ─────────────────────────────

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

-- ── Leadership (general – not previously covered) ─────────────────────────────

  ('iqseed-lea-006', 'rngsys00-0000-0000-0000-000000000001',
   'Describe your leadership style.',
   'Leadership', 'style,values,self-awareness,culture', 'public', 'Glassdoor',
   'Good leaders articulate their values and approach in concrete terms. Avoid vague labels like "servant leader" or "collaborative." Instead, name a specific principle you lead by, show how it plays out in practice with a real example, and connect it to outcomes it produced. If your style has evolved, say so — self-awareness about how you''ve grown is a bonus signal.',
   datetime('now'), datetime('now')),

-- ── Other (general – not previously covered) ──────────────────────────────────

  ('iqseed-oth-012', 'rngsys00-0000-0000-0000-000000000001',
   'What are your salary expectations?',
   'Other', 'compensation,negotiation,market-research,self-advocacy', 'public', 'Glassdoor',
   'Do your research first: know the market range using LinkedIn Salary, Glassdoor, Levels.fyi, or Payscale for your role, seniority, and location. When asked early, it is fine to say you would like to learn more about the full scope first. When pressed, give a range anchored in market data — not your current salary. A well-anchored range signals you know your value and have done your homework.',
   datetime('now'), datetime('now')),

-- ── DesignOps (new category – 19 questions from prep doc) ────────────────────

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

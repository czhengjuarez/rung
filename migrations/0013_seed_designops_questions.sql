-- DesignOps / Design Program Manager interview questions
-- Source: 22 questions from "Before I joined Wise" prep guide

-- ── Behavioral ────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO interview_questions
  (id, user_id, question, category, tags, visibility, source, hint, created_at, updated_at)
VALUES
  ('iqseed-dop-beh-001', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you had to unblock a design team mid-project. What was the blocker and how did you resolve it?',
   'Behavioral', 'designops,unblocking,problem-solving,program-management', 'public', 'Design Program Manager interview',
   'This reveals your operational instincts under pressure. Interviewers want to see how quickly you diagnose root causes — whether the blocker is resourcing, a dependency, unclear scope, or a relationship issue — and how you take ownership rather than waiting for someone else to fix it.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-beh-002', 'rngsys00-0000-0000-0000-000000000001',
   'Can you give an example where you acted as a bridge between product, design, and engineering to resolve a conflict or confusion?',
   'Behavioral', 'designops,cross-functional,conflict,alignment', 'public', 'Design Program Manager interview',
   'DPMs sit at the intersection of disciplines — this tests your ability to translate priorities across different thinking styles. Show how you identified the source of misalignment, created shared context, and moved the group toward a resolution without taking sides.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-beh-003', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a process or framework you introduced to improve cross-functional collaboration or visibility. What was the impact?',
   'Behavioral', 'designops,process-improvement,collaboration,frameworks', 'public', 'Design Program Manager interview',
   'Employers want evidence you can build operating infrastructure — not just participate in it. Be specific about the gap you saw, why existing methods were falling short, how you designed and socialised the new process, and the measurable improvement that followed.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-beh-004', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time when you had to collaborate across multiple teams to drive a design program forward. How did you handle conflicting perspectives?',
   'Behavioral', 'designops,cross-functional,program-management,conflict', 'public', 'Design Program Manager interview',
   'Multi-team programs surface competing priorities quickly. This question probes your ability to hold the program together without formal authority — show how you created alignment through shared goals, clear communication, and a willingness to surface tensions early rather than letting them fester.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-beh-005', 'rngsys00-0000-0000-0000-000000000001',
   'Can you give an example of when you had to quickly pivot a program due to shifting business priorities? How did you realign your team?',
   'Behavioral', 'designops,adaptability,change-management,program-management', 'public', 'Design Program Manager interview',
   'Pivots are a constant in design programs — what matters is how gracefully you manage the transition. Show your ability to absorb ambiguity, communicate the change with transparency, protect team morale, and re-sequence work without losing momentum.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-beh-006', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time when objectives were unclear and you had to work through ambiguity.',
   'Behavioral', 'designops,ambiguity,problem-solving,initiative', 'public', 'Design Program Manager interview',
   'Design programs often start without a clean brief. Interviewers want to see how you create clarity rather than waiting for it — how you ask the right questions, define a working hypothesis, and move forward decisively while staying open to correction.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-beh-007', 'rngsys00-0000-0000-0000-000000000001',
   'How have you helped a team transition to new goals after a major strategic shift?',
   'Behavioral', 'designops,change-management,leadership,communication', 'public', 'Design Program Manager interview',
   'Strategic pivots can fracture team confidence and focus. This tests your change leadership — how you communicated the why, helped people process the shift, reframed work in terms of the new direction, and kept the team productive during the transition.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-beh-008', 'rngsys00-0000-0000-0000-000000000001',
   'Describe a situation where you had to balance design excellence with practical constraints like timelines or engineering limitations.',
   'Behavioral', 'designops,tradeoffs,quality,delivery', 'public', 'Design Program Manager interview',
   'DPMs are often the ones who hold the line between ideal and feasible. Show that you can advocate for quality while making pragmatic decisions — and that you involve designers and engineers in the tradeoff conversation rather than making unilateral cuts.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-beh-009', 'rngsys00-0000-0000-0000-000000000001',
   'Tell me about a time you received difficult or unexpected feedback. How did you handle it?',
   'Behavioral', 'designops,feedback,resilience,self-awareness', 'public', 'Design Program Manager interview',
   'Coachability is as important as capability. Show that you listen without defensiveness, reflect before reacting, ask clarifying questions, and then act on the feedback concretely. The best answers include what changed as a result — not just how you felt in the moment.',
   datetime('now'), datetime('now')),

-- ── Leadership ────────────────────────────────────────────────────────────────

  ('iqseed-dop-lea-001', 'rngsys00-0000-0000-0000-000000000001',
   'What''s your strategy for engaging senior stakeholders like heads of product or engineering when there''s misalignment in priorities?',
   'Leadership', 'designops,stakeholders,alignment,executive-communication', 'public', 'Design Program Manager interview',
   'Senior stakeholders have different incentives, timelines, and vocabularies. This question tests your ability to understand what they actually care about, frame your position in their terms, and create alignment through shared goals rather than arguments — especially when pressure is high.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-lea-002', 'rngsys00-0000-0000-0000-000000000001',
   'You''ll be presenting to the GLT—how do you structure updates for senior leadership that highlight both risks and impact clearly?',
   'Leadership', 'designops,executive-communication,reporting,risk', 'public', 'Design Program Manager interview',
   'Leadership updates are different from team updates — executives need headlines, not detail. Show how you distill complex program status into clear signals: what''s on track, what''s at risk, what decisions are needed, and what the business impact is — without burying the lead.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-lea-003', 'rngsys00-0000-0000-0000-000000000001',
   'How do you build strong 1:1 relationships with design leaders and translate their needs into scalable processes?',
   'Leadership', 'designops,relationships,process-design,design-leadership', 'public', 'Design Program Manager interview',
   'DPMs serve design leaders without managing them. Interviewers want to see how you earn trust — by listening deeply, anticipating needs, and turning individual pain points into systemic solutions that benefit the whole team rather than just the loudest voice in the room.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-lea-004', 'rngsys00-0000-0000-0000-000000000001',
   'How do you influence executive decision-making in areas like design tooling, headcount, or process changes?',
   'Leadership', 'designops,executive-influence,strategy,business-case', 'public', 'Design Program Manager interview',
   'Getting design needs funded requires translating design value into business language. Show how you build a business case — gathering data, quantifying impact, anticipating objections, and timing your ask strategically. The best DPMs make it easy for executives to say yes.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-lea-005', 'rngsys00-0000-0000-0000-000000000001',
   'Describe a strategy you''ve used to manage complex stakeholder landscapes with conflicting needs.',
   'Leadership', 'designops,stakeholders,conflict,strategy', 'public', 'Design Program Manager interview',
   'In large organisations, every program has a stakeholder map with competing priorities. Show how you identify the key players, understand their actual motivations (not just stated positions), sequence your engagement, and build coalitions — rather than trying to satisfy everyone at once.',
   datetime('now'), datetime('now')),

-- ── Situational ───────────────────────────────────────────────────────────────

  ('iqseed-dop-sit-001', 'rngsys00-0000-0000-0000-000000000001',
   'How do you approach breaking a large, ambiguous design initiative into manageable workstreams?',
   'Situational', 'designops,program-management,planning,workstreams', 'public', 'Design Program Manager interview',
   'This is a core DPM skill — turning "we need to redesign the whole product" into a sequenced delivery plan. Describe how you scope work, identify dependencies, define team responsibilities, and set milestones. Show that you can hold the big picture while managing the detail.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-sit-002', 'rngsys00-0000-0000-0000-000000000001',
   'Can you walk me through how you manage capacity planning and resource allocation across multiple design teams?',
   'Situational', 'designops,capacity-planning,resource-allocation,program-management', 'public', 'Design Program Manager interview',
   'Capacity mismatches are one of the most common reasons design programs slip. Interviewers want to see your system — how you model demand vs. supply, how you handle over-allocation, and how you make trade-offs visible so decisions can be made at the right level.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-sit-003', 'rngsys00-0000-0000-0000-000000000001',
   'How do you ensure design projects align with wider business objectives while maintaining design quality?',
   'Situational', 'designops,strategy,quality,alignment', 'public', 'Design Program Manager interview',
   'This tests whether you can hold two tensions at once: business pragmatism and design integrity. Show how you connect OKRs to design work, how you create checkpoints to catch drift, and how you escalate when the two come into conflict rather than silently accepting a bad outcome.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-sit-004', 'rngsys00-0000-0000-0000-000000000001',
   'When managing a multi-squad initiative, how do you handle overlapping dependencies and ensure delivery?',
   'Situational', 'designops,dependencies,delivery,program-management', 'public', 'Design Program Manager interview',
   'Cross-squad dependencies are where programs often break down. Show your dependency management approach — how you map them, how you track status, how you facilitate resolution conversations early, and how you protect the critical path when something slips.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-sit-005', 'rngsys00-0000-0000-0000-000000000001',
   'How do you decide when to formalise a process vs. leave it flexible and team-owned?',
   'Situational', 'designops,process-design,governance,scaling', 'public', 'Design Program Manager interview',
   'Over-process kills craft; under-process kills consistency. This question probes your judgment about when structure creates value vs. overhead. Strong answers reference team size, repeatability, risk level, and maturity — and show you can introduce process in a way teams adopt willingly.',
   datetime('now'), datetime('now')),

-- ── Technical ─────────────────────────────────────────────────────────────────

  ('iqseed-dop-tec-001', 'rngsys00-0000-0000-0000-000000000001',
   'How have you created or evolved a design delivery toolkit or ritual system that helped scale design output or velocity?',
   'Technical', 'designops,process-design,tooling,scaling', 'public', 'Design Program Manager interview',
   'Design systems, critiques, sprint cadences, handoff templates — these are the infrastructure DPMs build. Describe a specific toolkit or ritual, why it was needed, how you designed it collaboratively with the team, how you drove adoption, and what measurable improvement it produced.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-tec-002', 'rngsys00-0000-0000-0000-000000000001',
   'What metrics or KPIs have you used in the past to measure design program health or delivery success?',
   'Technical', 'designops,metrics,program-health,data', 'public', 'Design Program Manager interview',
   'DPMs need to make design work legible to the business. Show that you can move beyond vanity metrics to signal quality, velocity, and impact — things like design review cycle time, handoff defect rate, design coverage, or user research cadence. Be prepared to explain why you chose each metric.',
   datetime('now'), datetime('now')),

  ('iqseed-dop-tec-003', 'rngsys00-0000-0000-0000-000000000001',
   'What does good QA look like to you in the design process? How have you helped a team raise the bar?',
   'Technical', 'designops,quality,process,design-review', 'public', 'Design Program Manager interview',
   'Design QA often gets squeezed — this tests whether you take quality seriously enough to build it into the process rather than bolting it on at the end. Describe the checkpoints you put in place, how you defined "good," how you got engineering to care, and the quality improvement you observed over time.',
   datetime('now'), datetime('now'));

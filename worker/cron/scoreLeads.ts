import type { Ai, D1Database } from '@cloudflare/workers-types';
import { nowIso } from '../util';

interface Criteria {
  user_id: string;
  title_keywords: string | null;
  seniority: string | null;
  work_modes: string | null;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  include_keywords: string | null;
  exclude_keywords: string | null;
}

interface Lead {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location: string | null;
  work_mode: string | null;
  salary_hint: string | null;
  description: string | null;
}

function buildPrompt(lead: Lead, criteria: Criteria): string {
  const parts: string[] = [
    `Job Title: ${lead.title}`,
    `Company: ${lead.company}`,
  ];
  if (lead.location) parts.push(`Location: ${lead.location}`);
  if (lead.work_mode) parts.push(`Work Mode: ${lead.work_mode}`);
  if (lead.salary_hint) parts.push(`Salary Info: ${lead.salary_hint}`);
  if (lead.description) parts.push(`\nDescription:\n${lead.description.slice(0, 1000)}`);

  const critParts: string[] = [];
  if (criteria.title_keywords) critParts.push(`Desired title keywords: ${criteria.title_keywords}`);
  if (criteria.seniority) critParts.push(`Desired seniority: ${criteria.seniority}`);
  if (criteria.work_modes) critParts.push(`Preferred work modes: ${criteria.work_modes}`);
  if (criteria.location) critParts.push(`Preferred location: ${criteria.location}`);
  if (criteria.salary_min || criteria.salary_max) {
    critParts.push(`Salary range: ${criteria.salary_min ?? ''}–${criteria.salary_max ?? ''} ${criteria.salary_min || criteria.salary_max ? 'k' : ''}`);
  }
  if (criteria.include_keywords) critParts.push(`Must include: ${criteria.include_keywords}`);
  if (criteria.exclude_keywords) critParts.push(`Must not include: ${criteria.exclude_keywords}`);

  return `Job posting:\n${parts.join('\n')}\n\nCandidate criteria:\n${critParts.join('\n') || 'No specific criteria set.'}`;
}

interface AiResponse {
  response?: string;
}

export async function scoreSingleLead(
  db: D1Database,
  ai: Ai,
  leadId: string,
  userId: string,
): Promise<{ score: number; score_reason: string } | null> {
  const lead = await db
    .prepare(
      `SELECT id, user_id, title, company, location, work_mode, salary_hint, description
       FROM job_leads WHERE id = ? AND user_id = ?`
    )
    .bind(leadId, userId)
    .first<Lead>();
  if (!lead) return null;

  const criteria = await db
    .prepare('SELECT * FROM lead_criteria WHERE user_id = ?')
    .bind(userId)
    .first<Criteria>();

  if (!criteria) {
    const score = 5;
    const score_reason = 'No criteria set; score defaulted to neutral.';
    await db
      .prepare('UPDATE job_leads SET score = ?, score_reason = ?, scored_at = ? WHERE id = ?')
      .bind(score, score_reason, nowIso(), leadId)
      .run();
    return { score, score_reason };
  }

  const userMessage = buildPrompt(lead, criteria);
  const result = (await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      {
        role: 'system',
        content:
          'You are a job-fit evaluator. Given a job posting and candidate criteria, rate how well the job matches on a scale of 1-10. Respond with valid JSON only: {"score": <integer 1-10>, "reason": "<one sentence>"}. No other text.',
      },
      { role: 'user', content: userMessage },
    ],
  })) as AiResponse;

  const text = result?.response ?? '';
  const jsonMatch = /\{[\s\S]*?\}/.exec(text);
  let score = 5;
  let score_reason = 'Could not parse AI response.';
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as { score?: number; reason?: string };
      if (typeof parsed.score === 'number') score = Math.max(1, Math.min(10, Math.round(parsed.score)));
      if (typeof parsed.reason === 'string') score_reason = parsed.reason.slice(0, 300);
    } catch { /* use defaults */ }
  }

  await db
    .prepare('UPDATE job_leads SET score = ?, score_reason = ?, scored_at = ? WHERE id = ?')
    .bind(score, score_reason, nowIso(), leadId)
    .run();

  return { score, score_reason };
}

export async function scoreLeads(db: D1Database, ai: Ai): Promise<void> {
  const { results: allCriteria } = await db
    .prepare('SELECT * FROM lead_criteria')
    .all<Criteria>();

  if (allCriteria.length === 0) return;

  const criteriaByUser = new Map<string, Criteria>();
  for (const c of allCriteria) criteriaByUser.set(c.user_id, c);

  // Score up to 5 unscored leads per user per cron run (fair across all users)
  const { results: leads } = await db
    .prepare(
      `SELECT id, user_id, title, company, location, work_mode, salary_hint, description
       FROM (
         SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY fetched_at ASC) AS rn
         FROM job_leads
         WHERE state = 'new' AND scored_at IS NULL
       )
       WHERE rn <= 5`
    )
    .all<Lead>();

  for (const lead of leads) {
    const criteria = criteriaByUser.get(lead.user_id);
    if (!criteria) {
      // No criteria — give a neutral score
      await db.prepare(
        'UPDATE job_leads SET score = 5, score_reason = ?, scored_at = ? WHERE id = ?'
      ).bind('No criteria set; score defaulted to neutral.', nowIso(), lead.id).run();
      continue;
    }

    try {
      const userMessage = buildPrompt(lead, criteria);
      const result = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          {
            role: 'system',
            content:
              'You are a job-fit evaluator. Given a job posting and candidate criteria, rate how well the job matches on a scale of 1-10. Respond with valid JSON only: {"score": <integer 1-10>, "reason": "<one sentence>"}. No other text.',
          },
          { role: 'user', content: userMessage },
        ],
      }) as AiResponse;

      const text = result?.response ?? '';
      const jsonMatch = /\{[\s\S]*?\}/.exec(text);
      let score = 5;
      let reason = 'Could not parse AI response.';
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]) as { score?: number; reason?: string };
          if (typeof parsed.score === 'number') score = Math.max(1, Math.min(10, Math.round(parsed.score)));
          if (typeof parsed.reason === 'string') reason = parsed.reason.slice(0, 300);
        } catch {
          // use defaults
        }
      }

      await db.prepare(
        'UPDATE job_leads SET score = ?, score_reason = ?, scored_at = ? WHERE id = ?'
      ).bind(score, reason, nowIso(), lead.id).run();
    } catch {
      // Skip this lead; it will be picked up next run
    }
  }
}

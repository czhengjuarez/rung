import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { newId, nowIso } from '../util';

export const interviewRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

const CATEGORIES = ['Behavioral', 'Technical', 'Situational', 'Leadership', 'Company-specific', 'Other'] as const;

// ── Questions ─────────────────────────────────────────────────────────────────

// GET /api/interview/questions?tab=public|private
interviewRouter.get('/questions', async (c) => {
  const user = c.get('user');
  const tab = c.req.query('tab') ?? 'public';
  const category = c.req.query('category');

  let whereClause: string;
  let params: unknown[];

  if (tab === 'private') {
    whereClause = `iq.user_id = ? AND iq.visibility = 'private'`;
    params = [user.id];
  } else {
    whereClause = `iq.visibility = 'public'`;
    params = [];
  }

  if (category && CATEGORIES.includes(category as typeof CATEGORIES[number])) {
    whereClause += ` AND iq.category = ?`;
    params.push(category);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT iq.*,
            u.name AS contributor_name,
            ia.answer AS my_answer,
            ia.notes AS my_notes,
            ia.id AS answer_id,
            (iq.user_id = ?) AS is_mine
     FROM interview_questions iq
     JOIN users u ON u.id = iq.user_id
     LEFT JOIN interview_answers ia ON ia.question_id = iq.id AND ia.user_id = ?
     WHERE ${whereClause}
     ORDER BY iq.created_at DESC`
  ).bind(user.id, user.id, ...params).all();

  return c.json({ questions: results });
});

// POST /api/interview/questions
interviewRouter.post('/questions', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    question: string;
    category?: string;
    tags?: string;
    visibility?: string;
    source?: string;
    hint?: string;
  }>();
  if (!body.question?.trim()) return c.json({ error: 'question is required' }, 400);

  const id = newId();
  const now = nowIso();
  await c.env.DB.prepare(
    `INSERT INTO interview_questions (id, user_id, question, category, tags, visibility, source, hint, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.id, body.question.trim(),
    body.category ?? 'Other',
    body.tags ?? null,
    body.visibility === 'private' ? 'private' : 'public',
    body.source ?? null,
    body.hint?.trim() ?? null,
    now, now
  ).run();

  const question = await c.env.DB.prepare(
    `SELECT iq.*, u.name AS contributor_name, NULL AS my_answer, NULL AS my_notes, NULL AS answer_id, 1 AS is_mine
     FROM interview_questions iq JOIN users u ON u.id = iq.user_id WHERE iq.id = ?`
  ).bind(id).first();
  return c.json({ question }, 201);
});

// PATCH /api/interview/questions/:id
interviewRouter.patch('/questions/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const owned = await c.env.DB
    .prepare('SELECT id FROM interview_questions WHERE id = ? AND user_id = ?')
    .bind(id, user.id).first();
  if (!owned) return c.json({ error: 'not found' }, 404);

  const body = await c.req.json<{ question?: string; category?: string; tags?: string; source?: string; visibility?: string }>();
  const sets: string[] = ['updated_at = ?'];
  const vals: unknown[] = [nowIso()];
  if (body.question !== undefined)    { sets.push('question = ?');    vals.push(body.question); }
  if (body.category !== undefined)    { sets.push('category = ?');    vals.push(body.category); }
  if (body.tags !== undefined)        { sets.push('tags = ?');        vals.push(body.tags); }
  if (body.source !== undefined)      { sets.push('source = ?');      vals.push(body.source); }
  if (body.visibility !== undefined)  { sets.push('visibility = ?');  vals.push(body.visibility); }
  vals.push(id);

  await c.env.DB.prepare(`UPDATE interview_questions SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  return c.json({ ok: true });
});

// DELETE /api/interview/questions/:id
interviewRouter.delete('/questions/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await c.env.DB
    .prepare('DELETE FROM interview_questions WHERE id = ? AND user_id = ?')
    .bind(id, user.id).run();
  return new Response(null, { status: 204 });
});

// ── Answers ───────────────────────────────────────────────────────────────────

// PUT /api/interview/answers/:questionId  (upsert)
interviewRouter.put('/answers/:questionId', async (c) => {
  const user = c.get('user');
  const questionId = c.req.param('questionId');
  const body = await c.req.json<{ answer?: string; notes?: string }>();
  const now = nowIso();

  const existing = await c.env.DB
    .prepare('SELECT id FROM interview_answers WHERE user_id = ? AND question_id = ?')
    .bind(user.id, questionId).first<{ id: string }>();

  if (existing) {
    await c.env.DB.prepare(
      'UPDATE interview_answers SET answer = ?, notes = ?, updated_at = ? WHERE id = ?'
    ).bind(body.answer ?? null, body.notes ?? null, now, existing.id).run();
    return c.json({ ok: true });
  }

  await c.env.DB.prepare(
    'INSERT INTO interview_answers (id, user_id, question_id, answer, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(newId(), user.id, questionId, body.answer ?? null, body.notes ?? null, now, now).run();
  return c.json({ ok: true }, 201);
});

// ── AI Coach ──────────────────────────────────────────────────────────────────

// POST /api/interview/coach
interviewRouter.post('/coach', async (c) => {
  const body = await c.req.json<{ question: string; answer: string; category?: string }>();
  if (!body.question?.trim() || !body.answer?.trim()) {
    return c.json({ error: 'question and answer are required' }, 400);
  }

  const systemPrompt = `You are an expert interview coach. Evaluate the candidate's answer to an interview question.

Respond with ONLY valid JSON in exactly this shape:
{
  "score": <integer 1-5>,
  "structure": "<one of: STAR | CAR | Partial STAR | Unstructured>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<area to improve 1>", "<area to improve 2>"],
  "rewrite_tip": "<one concrete sentence showing how to open the answer stronger>"
}`;

  const userMsg = `Interview question: ${body.question.trim()}

Candidate's answer:
${body.answer.trim().slice(0, 2000)}`;

  let raw = '';
  try {
    const resp = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg },
      ],
      max_tokens: 512,
    });
    raw = (resp as { response?: string }).response ?? '';
  } catch {
    return c.json({ error: 'AI unavailable, please try again.' }, 502);
  }

  // Extract JSON from the response (model may wrap it in markdown)
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return c.json({ error: 'Could not parse AI response. Try again.' }, 502);

  try {
    const feedback = JSON.parse(match[0]);
    return c.json({ feedback });
  } catch {
    return c.json({ error: 'Could not parse AI response. Try again.' }, 502);
  }
});

// DELETE /api/interview/answers/:questionId
interviewRouter.delete('/answers/:questionId', async (c) => {
  const user = c.get('user');
  const questionId = c.req.param('questionId');
  await c.env.DB
    .prepare('DELETE FROM interview_answers WHERE user_id = ? AND question_id = ?')
    .bind(user.id, questionId).run();
  return new Response(null, { status: 204 });
});

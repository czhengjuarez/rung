import { Hono } from 'hono';
import type { Env, Variables } from '../types';

export const resumesRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// ── List resumes ──────────────────────────────────────────────────────────────
resumesRouter.get('/', async (c) => {
  const user = c.get('user');
  const rows = await c.env.DB.prepare(
    `SELECT id, label, filename, content_type, size, resume_text IS NOT NULL as has_text, created_at, updated_at
     FROM resumes WHERE user_id=? ORDER BY updated_at DESC`
  ).bind(user.id).all();
  return c.json({ resumes: rows.results });
});

// ── Upload resume ─────────────────────────────────────────────────────────────
resumesRouter.post('/', async (c) => {
  const user = c.get('user');
  const form = await c.req.formData();
  const file = form.get('file') as File | null;
  const label = (form.get('label') as string | null)?.trim();
  const resumeText = (form.get('resume_text') as string | null)?.trim() || null;

  if (!file) return c.json({ error: 'file is required' }, 400);
  if (!label) return c.json({ error: 'label is required' }, 400);
  if (!ALLOWED_TYPES.has(file.type)) return c.json({ error: 'Only PDF, DOCX, DOC, or TXT files are accepted' }, 400);
  if (file.size > MAX_SIZE) return c.json({ error: 'File must be under 10 MB' }, 400);

  const id = crypto.randomUUID();
  const r2Key = `${user.id}/${id}/${file.name}`;

  await c.env.DOCS.put(r2Key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { userId: user.id },
  });

  await c.env.DB.prepare(
    `INSERT INTO resumes (id, user_id, label, filename, content_type, size, r2_key, resume_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user.id, label, file.name, file.type, file.size, r2Key, resumeText).run();

  const resume = await c.env.DB.prepare(
    `SELECT id, label, filename, content_type, size, resume_text IS NOT NULL as has_text, created_at, updated_at
     FROM resumes WHERE id=?`
  ).bind(id).first();

  return c.json({ resume }, 201);
});

// ── Update label / text ───────────────────────────────────────────────────────
resumesRouter.patch('/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json<{ label?: string; resume_text?: string }>();

  const existing = await c.env.DB.prepare(
    'SELECT id FROM resumes WHERE id=? AND user_id=?'
  ).bind(id, user.id).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (body.label !== undefined) { sets.push('label=?'); vals.push(body.label.trim()); }
  if (body.resume_text !== undefined) { sets.push('resume_text=?'); vals.push(body.resume_text || null); }
  if (sets.length === 0) return c.json({ ok: true });

  sets.push("updated_at=datetime('now')");
  vals.push(id, user.id);
  await c.env.DB.prepare(
    `UPDATE resumes SET ${sets.join(', ')} WHERE id=? AND user_id=?`
  ).bind(...vals).run();

  return c.json({ ok: true });
});

// ── Download resume ───────────────────────────────────────────────────────────
resumesRouter.get('/:id/download', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const row = await c.env.DB.prepare(
    'SELECT filename, content_type, r2_key FROM resumes WHERE id=? AND user_id=?'
  ).bind(id, user.id).first<{ filename: string; content_type: string; r2_key: string }>();
  if (!row) return c.json({ error: 'Not found' }, 404);

  const obj = await c.env.DOCS.get(row.r2_key);
  if (!obj) return c.json({ error: 'File not found in storage' }, 404);

  return new Response(obj.body, {
    headers: {
      'Content-Type': row.content_type,
      'Content-Disposition': `attachment; filename="${row.filename}"`,
    },
  });
});

// ── Delete resume ─────────────────────────────────────────────────────────────
resumesRouter.delete('/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const row = await c.env.DB.prepare(
    'SELECT r2_key FROM resumes WHERE id=? AND user_id=?'
  ).bind(id, user.id).first<{ r2_key: string }>();
  if (!row) return c.json({ error: 'Not found' }, 404);

  await Promise.all([
    c.env.DOCS.delete(row.r2_key),
    c.env.DB.prepare('DELETE FROM resumes WHERE id=? AND user_id=?').bind(id, user.id).run(),
  ]);

  return new Response(null, { status: 204 });
});

const TAILOR_DAILY_LIMIT = 10;

// ── Tailor usage ──────────────────────────────────────────────────────────────
resumesRouter.get('/tailor-usage', async (c) => {
  const user = c.get('user');
  const row = await c.env.DB.prepare(
    `SELECT COUNT(*) AS used FROM resume_tailored WHERE user_id = ? AND created_at > datetime('now', '-24 hours')`
  ).bind(user.id).first<{ used: number }>();
  return c.json({ used: row?.used ?? 0, limit: TAILOR_DAILY_LIMIT });
});

// ── AI tailor ─────────────────────────────────────────────────────────────────
resumesRouter.post('/:id/tailor', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  // Rate limit: max 10 tailor operations per user per 24 hours
  const usage = await c.env.DB.prepare(
    `SELECT COUNT(*) AS count FROM resume_tailored WHERE user_id = ? AND created_at > datetime('now', '-24 hours')`
  ).bind(user.id).first<{ count: number }>();
  if ((usage?.count ?? 0) >= TAILOR_DAILY_LIMIT) {
    return c.json({ error: `You've used all ${TAILOR_DAILY_LIMIT} AI tailoring credits for today. Try again tomorrow.` }, 429);
  }

  const body = await c.req.json<{
    job_description: string;
    job_title?: string;
    company?: string;
    application_id?: string;
    job_lead_id?: string;
  }>();

  if (!body.job_description?.trim()) return c.json({ error: 'job_description is required' }, 400);

  const resume = await c.env.DB.prepare(
    'SELECT id, label, resume_text FROM resumes WHERE id=? AND user_id=?'
  ).bind(id, user.id).first<{ id: string; label: string; resume_text: string | null }>();

  if (!resume) return c.json({ error: 'Resume not found' }, 404);
  if (!resume.resume_text) return c.json({ error: 'This resume has no text content for AI tailoring. Edit the resume and paste your resume text first.' }, 400);

  const systemPrompt = `You are an expert resume writer and career coach. Your job is to tailor a resume to a specific job description without fabricating experience. Rewrite bullet points to emphasize the most relevant skills and achievements using keywords from the job description. Keep the same structure and factual content — only rephrase and reprioritize. Output the complete tailored resume text.`;

  const userMsg = `RESUME (label: "${resume.label}"):\n${resume.resume_text}\n\n---\n\nJOB DESCRIPTION:\n${body.job_description.slice(0, 3000)}\n\n---\n\nPlease output the tailored resume text below:`;

  let tailoredText = '';
  try {
    const resp = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg },
      ],
      max_tokens: 2048,
    });
    tailoredText = (resp as { response?: string }).response ?? '';
  } catch (err) {
    return c.json({ error: 'AI tailoring failed. Please try again.' }, 502);
  }

  const tailoredId = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO resume_tailored (id, user_id, source_resume_id, application_id, job_lead_id, job_title, company, tailored_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    tailoredId, user.id, id,
    body.application_id || null, body.job_lead_id || null,
    body.job_title || null, body.company || null,
    tailoredText
  ).run();

  return c.json({ id: tailoredId, tailored_text: tailoredText });
});

// ── List tailored versions for a resume ───────────────────────────────────────
resumesRouter.get('/:id/tailored', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const rows = await c.env.DB.prepare(
    `SELECT id, job_title, company, created_at FROM resume_tailored
     WHERE source_resume_id=? AND user_id=? ORDER BY created_at DESC`
  ).bind(id, user.id).all();

  return c.json({ tailored: rows.results });
});

resumesRouter.get('/tailored/:tailoredId', async (c) => {
  const user = c.get('user');
  const { tailoredId } = c.req.param();

  const row = await c.env.DB.prepare(
    'SELECT * FROM resume_tailored WHERE id=? AND user_id=?'
  ).bind(tailoredId, user.id).first();
  if (!row) return c.json({ error: 'Not found' }, 404);

  return c.json({ tailored: row });
});

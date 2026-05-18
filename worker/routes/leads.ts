import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { newId, nowIso } from '../util';
import { runLeadsFetch } from '../cron/fetchLeads';
import { scoreLeads, scoreSingleLead } from '../cron/scoreLeads';

export const leadsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// ── Criteria ──────────────────────────────────────────────────────────────────

leadsRouter.get('/criteria', async (c) => {
  const user = c.get('user');
  const criteria = await c.env.DB
    .prepare('SELECT * FROM lead_criteria WHERE user_id = ?')
    .bind(user.id).first();
  return c.json({ criteria: criteria ?? null });
});

leadsRouter.put('/criteria', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    title_keywords?: string;
    seniority?: string;
    work_modes?: string;
    salary_min?: number | null;
    salary_max?: number | null;
    salary_currency?: string;
    location?: string;
    include_keywords?: string;
    exclude_keywords?: string;
  }>();

  await c.env.DB.prepare(
    `INSERT INTO lead_criteria (user_id, title_keywords, seniority, work_modes, salary_min, salary_max, salary_currency, location, include_keywords, exclude_keywords, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       title_keywords    = excluded.title_keywords,
       seniority         = excluded.seniority,
       work_modes        = excluded.work_modes,
       salary_min        = excluded.salary_min,
       salary_max        = excluded.salary_max,
       salary_currency   = excluded.salary_currency,
       location          = excluded.location,
       include_keywords  = excluded.include_keywords,
       exclude_keywords  = excluded.exclude_keywords,
       updated_at        = excluded.updated_at`
  ).bind(
    user.id,
    body.title_keywords ?? null,
    body.seniority ?? null,
    body.work_modes ?? null,
    body.salary_min ?? null,
    body.salary_max ?? null,
    body.salary_currency ?? 'USD',
    body.location ?? null,
    body.include_keywords ?? null,
    body.exclude_keywords ?? null,
    nowIso()
  ).run();

  const criteria = await c.env.DB
    .prepare('SELECT * FROM lead_criteria WHERE user_id = ?')
    .bind(user.id).first();
  return c.json({ criteria });
});

// ── Sources ───────────────────────────────────────────────────────────────────

leadsRouter.get('/sources', async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB
    .prepare('SELECT * FROM lead_sources WHERE user_id = ? ORDER BY created_at ASC')
    .bind(user.id).all();
  return c.json({ sources: results });
});

leadsRouter.post('/sources', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    source_type: string;
    slug?: string;
    url?: string;
    label: string;
  }>();
  if (!body.source_type || !body.label) {
    return c.json({ error: 'source_type and label are required' }, 400);
  }
  const id = newId();
  await c.env.DB.prepare(
    'INSERT INTO lead_sources (id, user_id, source_type, slug, url, label, active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
  ).bind(id, user.id, body.source_type, body.slug ?? null, body.url ?? null, body.label, nowIso()).run();
  const source = await c.env.DB.prepare('SELECT * FROM lead_sources WHERE id = ?').bind(id).first();
  return c.json({ source }, 201);
});

leadsRouter.patch('/sources/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json<{ label?: string; slug?: string; url?: string; active?: number }>();

  const owned = await c.env.DB
    .prepare('SELECT id FROM lead_sources WHERE id = ? AND user_id = ?')
    .bind(id, user.id).first();
  if (!owned) return c.json({ error: 'not found' }, 404);

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (body.label !== undefined)  { sets.push('label = ?');  vals.push(body.label); }
  if (body.slug !== undefined)   { sets.push('slug = ?');   vals.push(body.slug); }
  if (body.url !== undefined)    { sets.push('url = ?');    vals.push(body.url); }
  if (body.active !== undefined) { sets.push('active = ?'); vals.push(body.active); }
  if (sets.length === 0) return c.json({ error: 'nothing to update' }, 400);
  vals.push(id);

  await c.env.DB.prepare(`UPDATE lead_sources SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  const source = await c.env.DB.prepare('SELECT * FROM lead_sources WHERE id = ?').bind(id).first();
  return c.json({ source });
});

leadsRouter.delete('/sources/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await c.env.DB
    .prepare('DELETE FROM lead_sources WHERE id = ? AND user_id = ?')
    .bind(id, user.id).run();
  return new Response(null, { status: 204 });
});

// ── Leads ─────────────────────────────────────────────────────────────────────

leadsRouter.get('/', async (c) => {
  const user = c.get('user');
  const state = c.req.query('state') ?? 'new';
  const { results } = await c.env.DB
    .prepare(
      `SELECT jl.*, ls.label AS source_label, ls.source_type
       FROM job_leads jl
       LEFT JOIN lead_sources ls ON ls.id = jl.source_id
       WHERE jl.user_id = ? AND jl.state = ?
       ORDER BY COALESCE(jl.score, 0) DESC, jl.fetched_at DESC
       LIMIT 100`
    )
    .bind(user.id, state).all();
  return c.json({ leads: results });
});

leadsRouter.post('/:id/dismiss', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const owned = await c.env.DB
    .prepare('SELECT id FROM job_leads WHERE id = ? AND user_id = ?')
    .bind(id, user.id).first();
  if (!owned) return c.json({ error: 'not found' }, 404);
  await c.env.DB
    .prepare("UPDATE job_leads SET state = 'dismissed' WHERE id = ?")
    .bind(id).run();
  return c.json({ ok: true });
});

leadsRouter.post('/:id/convert', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const lead = await c.env.DB
    .prepare('SELECT * FROM job_leads WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .first<{ id: string; title: string; company: string; location: string | null; work_mode: string | null; external_url: string; notes: string | null }>();
  if (!lead) return c.json({ error: 'not found' }, 404);

  const appId = newId();
  const notes = `Source: ${lead.external_url}${lead.notes ? `\n${lead.notes}` : ''}`;
  await c.env.DB.prepare(
    `INSERT INTO applications (id, user_id, company, role, location, work_mode, status, notes, last_activity_at)
     VALUES (?, ?, ?, ?, ?, ?, 'Saved', ?, ?)`
  ).bind(appId, user.id, lead.company, lead.title, lead.location, lead.work_mode, notes, nowIso()).run();

  await c.env.DB
    .prepare("UPDATE job_leads SET state = 'converted', converted_application_id = ? WHERE id = ?")
    .bind(appId, id).run();

  const application = await c.env.DB
    .prepare('SELECT * FROM applications WHERE id = ?').bind(appId).first();
  return c.json({ application }, 201);
});

// On-demand score a single lead
leadsRouter.post('/:id/score', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const result = await scoreSingleLead(c.env.DB, c.env.AI, id, user.id);
  if (!result) return c.json({ error: 'not found' }, 404);
  return c.json(result);
});

// Manual trigger — scoped to the current user, returns per-source counts
leadsRouter.post('/run', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const fetchResults = await runLeadsFetch(db, user.id);
  await scoreLeads(db, c.env.AI);
  const totalInserted = fetchResults.reduce((s, r) => s + r.inserted, 0);
  return c.json({ ok: true, inserted: totalInserted, sources: fetchResults });
});

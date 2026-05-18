import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { newId, nowIso } from '../util';

export const contactsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

contactsRouter.get('/', async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB
    .prepare(
      `SELECT c.*,
         COUNT(DISTINCT ac.application_id) AS app_count
       FROM contacts c
       LEFT JOIN application_contacts ac ON ac.contact_id = c.id
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY c.last_touch_at DESC`
    )
    .bind(user.id)
    .all();
  return c.json({ contacts: results });
});

contactsRouter.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    name: string;
    company?: string;
    role?: string;
    email?: string;
    linkedin?: string;
    notes?: string;
  }>();
  if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400);

  const id = newId();
  const now = nowIso();
  await c.env.DB
    .prepare(
      `INSERT INTO contacts (id, user_id, name, company, role, email, linkedin, notes, last_touch_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, user.id, body.name.trim(), body.company ?? null, body.role ?? null,
          body.email ?? null, body.linkedin ?? null, body.notes ?? null, now)
    .run();

  const contact = await c.env.DB
    .prepare('SELECT *, 0 AS app_count FROM contacts WHERE id = ?')
    .bind(id)
    .first();
  return c.json({ contact }, 201);
});

contactsRouter.patch('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json<Partial<{
    name: string; company: string; role: string;
    email: string; linkedin: string; notes: string;
  }>>();

  const owned = await c.env.DB
    .prepare('SELECT id FROM contacts WHERE id = ? AND user_id = ?')
    .bind(id, user.id).first();
  if (!owned) return c.json({ error: 'not found' }, 404);

  const FIELDS = ['name', 'company', 'role', 'email', 'linkedin', 'notes'] as const;
  const sets = ['last_touch_at = ?'];
  const values: unknown[] = [nowIso()];
  for (const f of FIELDS) {
    if (body[f] !== undefined) { sets.push(`${f} = ?`); values.push(body[f] ?? null); }
  }
  values.push(id);
  await c.env.DB.prepare(`UPDATE contacts SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run();

  const contact = await c.env.DB
    .prepare(
      `SELECT c.*, COUNT(DISTINCT ac.application_id) AS app_count
       FROM contacts c LEFT JOIN application_contacts ac ON ac.contact_id = c.id
       WHERE c.id = ? GROUP BY c.id`
    )
    .bind(id).first();
  return c.json({ contact });
});

contactsRouter.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await c.env.DB
    .prepare('DELETE FROM contacts WHERE id = ? AND user_id = ?')
    .bind(id, user.id).run();
  return new Response(null, { status: 204 });
});

contactsRouter.get('/:id/applications', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const { results } = await c.env.DB
    .prepare(
      `SELECT a.id, a.company, a.role, a.status, ac.relationship
       FROM application_contacts ac
       JOIN applications a ON a.id = ac.application_id
       WHERE ac.contact_id = ? AND a.user_id = ?
       ORDER BY a.company`
    )
    .bind(id, user.id).all();
  return c.json({ applications: results });
});

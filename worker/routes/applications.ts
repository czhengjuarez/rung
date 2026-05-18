import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { newId, nowIso } from '../util';

const ALLOWED_FIELDS = [
  'company',
  'role',
  'location',
  'work_mode',
  'size',
  'industry',
  'status',
  'stage',
  'referral',
  'salary_low',
  'salary_high',
  'salary_currency',
  'applied_at',
  'notes',
  'starred'
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

export const applicationsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

applicationsRouter.get('/', async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB
    .prepare(
      `SELECT a.*, COUNT(DISTINCT ac.contact_id) AS contact_count
       FROM applications a
       LEFT JOIN application_contacts ac ON ac.application_id = a.id
       WHERE a.user_id = ?
       GROUP BY a.id
       ORDER BY a.starred DESC, COALESCE(a.last_activity_at, a.applied_at, a.created_at) DESC`
    )
    .bind(user.id)
    .all();
  return c.json({ applications: results });
});

applicationsRouter.post('/', async (c) => {
  const user = c.get('user');
  const body = (await c.req.json()) as Partial<Record<AllowedField, unknown>>;
  if (!body.company || typeof body.company !== 'string') {
    return c.json({ error: 'company is required' }, 400);
  }

  const id = newId();
  const fields = ['id', 'user_id', 'last_activity_at'];
  const placeholders = ['?', '?', '?'];
  const values: unknown[] = [id, user.id, nowIso()];

  for (const f of ALLOWED_FIELDS) {
    if (body[f] !== undefined) {
      fields.push(f);
      placeholders.push('?');
      values.push(body[f] as string | number);
    }
  }

  await c.env.DB
    .prepare(`INSERT INTO applications (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`)
    .bind(...values)
    .run();

  const application = await c.env.DB
    .prepare('SELECT * FROM applications WHERE id = ?')
    .bind(id)
    .first();
  return c.json({ application });
});

applicationsRouter.post('/import', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{ applications: Array<Partial<Record<AllowedField, unknown>>> }>();
  if (!Array.isArray(body.applications) || body.applications.length === 0) {
    return c.json({ error: 'applications array required' }, 400);
  }

  const now = nowIso();
  const toInsert = body.applications
    .filter(a => a.company && typeof a.company === 'string')
    .slice(0, 500);

  if (toInsert.length === 0) {
    return c.json({ error: 'no valid rows — company is required' }, 400);
  }

  const stmts = toInsert.map((row) => {
    const id = newId();
    const fields = ['id', 'user_id', 'last_activity_at'];
    const placeholders = ['?', '?', '?'];
    const values: unknown[] = [id, user.id, now];
    for (const f of ALLOWED_FIELDS) {
      if (row[f] !== undefined) {
        fields.push(f);
        placeholders.push('?');
        values.push(row[f]);
      }
    }
    return c.env.DB
      .prepare(`INSERT INTO applications (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`)
      .bind(...values);
  });

  await c.env.DB.batch(stmts);
  return c.json({ imported: toInsert.length });
});

applicationsRouter.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const application = await c.env.DB
    .prepare('SELECT * FROM applications WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .first();
  if (!application) return c.json({ error: 'not found' }, 404);
  return c.json({ application });
});

applicationsRouter.patch('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = (await c.req.json()) as Partial<Record<AllowedField, unknown>>;

  const owned = await c.env.DB
    .prepare('SELECT id FROM applications WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .first();
  if (!owned) return c.json({ error: 'not found' }, 404);

  const sets: string[] = ['updated_at = ?', 'last_activity_at = ?'];
  const values: unknown[] = [nowIso(), nowIso()];
  for (const f of ALLOWED_FIELDS) {
    if (body[f] !== undefined) {
      sets.push(`${f} = ?`);
      values.push(body[f] as string | number | null);
    }
  }
  values.push(id);
  await c.env.DB
    .prepare(`UPDATE applications SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  const application = await c.env.DB
    .prepare('SELECT * FROM applications WHERE id = ?')
    .bind(id)
    .first();
  return c.json({ application });
});

applicationsRouter.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await c.env.DB
    .prepare('DELETE FROM applications WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .run();
  return new Response(null, { status: 204 });
});

applicationsRouter.post('/:id/events', async (c) => {
  const user = c.get('user');
  const appId = c.req.param('id');
  const body = await c.req.json<{ type?: string; occurred_at?: string; notes?: string }>();
  if (!body.type) return c.json({ error: 'type required' }, 400);

  const owned = await c.env.DB
    .prepare('SELECT id FROM applications WHERE id = ? AND user_id = ?')
    .bind(appId, user.id)
    .first();
  if (!owned) return c.json({ error: 'not found' }, 404);

  const id = newId();
  const occurredAt = body.occurred_at || nowIso();
  await c.env.DB
    .prepare(
      'INSERT INTO application_events (id, application_id, type, occurred_at, notes) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(id, appId, body.type, occurredAt, body.notes ?? null)
    .run();
  await c.env.DB
    .prepare('UPDATE applications SET last_activity_at = ?, updated_at = ? WHERE id = ?')
    .bind(occurredAt, nowIso(), appId)
    .run();

  return c.json({ event: { id, application_id: appId, type: body.type, occurred_at: occurredAt, notes: body.notes ?? null } });
});

applicationsRouter.get('/:id/contacts', async (c) => {
  const user = c.get('user');
  const appId = c.req.param('id');
  const owned = await c.env.DB
    .prepare('SELECT id FROM applications WHERE id = ? AND user_id = ?')
    .bind(appId, user.id).first();
  if (!owned) return c.json({ error: 'not found' }, 404);

  const { results } = await c.env.DB
    .prepare(
      `SELECT ct.id, ct.name, ct.company, ct.role, ct.email, ct.linkedin, ac.relationship
       FROM application_contacts ac
       JOIN contacts ct ON ct.id = ac.contact_id
       WHERE ac.application_id = ?
       ORDER BY ct.name`
    )
    .bind(appId).all();
  return c.json({ contacts: results });
});

applicationsRouter.post('/:id/contacts', async (c) => {
  const user = c.get('user');
  const appId = c.req.param('id');
  const body = await c.req.json<{ contact_id: string; relationship?: string }>();
  if (!body.contact_id) return c.json({ error: 'contact_id required' }, 400);

  const owned = await c.env.DB
    .prepare('SELECT id FROM applications WHERE id = ? AND user_id = ?')
    .bind(appId, user.id).first();
  if (!owned) return c.json({ error: 'not found' }, 404);

  const contactOwned = await c.env.DB
    .prepare('SELECT id FROM contacts WHERE id = ? AND user_id = ?')
    .bind(body.contact_id, user.id).first();
  if (!contactOwned) return c.json({ error: 'contact not found' }, 404);

  await c.env.DB
    .prepare(
      `INSERT OR REPLACE INTO application_contacts (application_id, contact_id, relationship)
       VALUES (?, ?, ?)`
    )
    .bind(appId, body.contact_id, body.relationship ?? 'Other').run();

  await c.env.DB
    .prepare('UPDATE contacts SET last_touch_at = ? WHERE id = ?')
    .bind(nowIso(), body.contact_id).run();

  return c.json({ ok: true }, 201);
});

applicationsRouter.delete('/:id/contacts/:contactId', async (c) => {
  const user = c.get('user');
  const appId = c.req.param('id');
  const contactId = c.req.param('contactId');

  const owned = await c.env.DB
    .prepare('SELECT id FROM applications WHERE id = ? AND user_id = ?')
    .bind(appId, user.id).first();
  if (!owned) return c.json({ error: 'not found' }, 404);

  await c.env.DB
    .prepare('DELETE FROM application_contacts WHERE application_id = ? AND contact_id = ?')
    .bind(appId, contactId).run();
  return new Response(null, { status: 204 });
});

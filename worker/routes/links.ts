import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { newId } from '../util';

export const linksRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

linksRouter.get('/', async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB
    .prepare(
      `SELECT id, label, url, icon, sort_order
       FROM shortcut_links WHERE user_id = ?
       ORDER BY sort_order ASC, created_at ASC`
    )
    .bind(user.id)
    .all();
  return c.json({ links: results });
});

linksRouter.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{ label?: string; url?: string; icon?: string }>();
  if (!body.label || !body.url) return c.json({ error: 'label and url required' }, 400);

  const maxRow = await c.env.DB
    .prepare('SELECT COALESCE(MAX(sort_order), -1) AS max FROM shortcut_links WHERE user_id = ?')
    .bind(user.id)
    .first<{ max: number }>();
  const sortOrder = (maxRow?.max ?? -1) + 1;
  const id = newId();

  await c.env.DB
    .prepare(
      `INSERT INTO shortcut_links (id, user_id, label, url, icon, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, user.id, body.label, body.url, body.icon ?? null, sortOrder)
    .run();

  const link = await c.env.DB
    .prepare('SELECT id, label, url, icon, sort_order FROM shortcut_links WHERE id = ?')
    .bind(id)
    .first();
  return c.json({ link });
});

linksRouter.patch('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json<{ label?: string; url?: string; icon?: string; sort_order?: number }>();

  const owned = await c.env.DB
    .prepare('SELECT id FROM shortcut_links WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .first();
  if (!owned) return c.json({ error: 'not found' }, 404);

  const fields: string[] = [];
  const values: (string | number)[] = [];
  for (const [k, v] of Object.entries(body)) {
    if (v === undefined) continue;
    if (!['label', 'url', 'icon', 'sort_order'].includes(k)) continue;
    fields.push(`${k} = ?`);
    values.push(v as string | number);
  }
  if (fields.length) {
    values.push(id);
    await c.env.DB
      .prepare(`UPDATE shortcut_links SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  const link = await c.env.DB
    .prepare('SELECT id, label, url, icon, sort_order FROM shortcut_links WHERE id = ?')
    .bind(id)
    .first();
  return c.json({ link });
});

linksRouter.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await c.env.DB
    .prepare('DELETE FROM shortcut_links WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .run();
  return new Response(null, { status: 204 });
});

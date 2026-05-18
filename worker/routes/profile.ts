import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { newId } from '../util';

export const profileRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

profileRouter.get('/', async (c) => {
  const user = c.get('user');
  const profile = await c.env.DB
    .prepare(
      'SELECT slug, public_enabled, display_name, headline, avatar_url FROM profiles WHERE user_id = ?'
    )
    .bind(user.id)
    .first();
  return c.json({
    profile: profile ?? {
      slug: null,
      public_enabled: 0,
      display_name: user.name,
      headline: null,
      avatar_url: user.avatar_url
    }
  });
});

profileRouter.patch('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    slug?: string;
    public_enabled?: number;
    display_name?: string;
    headline?: string;
  }>();

  if (body.slug) {
    const clash = await c.env.DB
      .prepare('SELECT user_id FROM profiles WHERE slug = ? AND user_id != ?')
      .bind(body.slug, user.id)
      .first<{ user_id: string }>();
    if (clash) return c.json({ error: 'slug already taken' }, 409);
  }

  const existing = await c.env.DB
    .prepare('SELECT user_id FROM profiles WHERE user_id = ?')
    .bind(user.id)
    .first();

  if (existing) {
    const sets: string[] = [];
    const values: unknown[] = [];
    for (const k of ['slug', 'public_enabled', 'display_name', 'headline'] as const) {
      if (body[k] !== undefined) {
        sets.push(`${k} = ?`);
        values.push(body[k] as string | number | null);
      }
    }
    if (sets.length) {
      values.push(user.id);
      await c.env.DB
        .prepare(`UPDATE profiles SET ${sets.join(', ')} WHERE user_id = ?`)
        .bind(...values)
        .run();
    }
  } else {
    await c.env.DB
      .prepare(
        'INSERT INTO profiles (user_id, slug, public_enabled, display_name, headline, avatar_url) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(
        user.id,
        body.slug ?? null,
        body.public_enabled ?? 0,
        body.display_name ?? user.name,
        body.headline ?? null,
        user.avatar_url
      )
      .run();
  }

  const profile = await c.env.DB
    .prepare(
      'SELECT slug, public_enabled, display_name, headline, avatar_url FROM profiles WHERE user_id = ?'
    )
    .bind(user.id)
    .first();
  return c.json({ profile });
});

profileRouter.get('/links', async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB
    .prepare('SELECT id, label, url, sort_order FROM profile_links WHERE user_id = ? ORDER BY sort_order ASC')
    .bind(user.id)
    .all();
  return c.json({ links: results });
});

profileRouter.put('/links', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{ links: Array<{ label: string; url: string }> }>();
  const links = (body.links ?? []).filter(l => l.label?.trim() && l.url?.trim());

  await c.env.DB.prepare('DELETE FROM profile_links WHERE user_id = ?').bind(user.id).run();

  if (links.length) {
    const stmts = links.map((l, i) =>
      c.env.DB
        .prepare('INSERT INTO profile_links (id, user_id, label, url, sort_order) VALUES (?, ?, ?, ?, ?)')
        .bind(newId(), user.id, l.label.trim(), l.url.trim(), i)
    );
    await c.env.DB.batch(stmts);
  }

  const { results } = await c.env.DB
    .prepare('SELECT id, label, url, sort_order FROM profile_links WHERE user_id = ? ORDER BY sort_order ASC')
    .bind(user.id)
    .all();
  return c.json({ links: results });
});

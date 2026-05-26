import { Hono } from 'hono';
import type { Env, Variables } from '../types';

export const publicRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

publicRouter.get('/extension/download', async (c) => {
  const obj = await c.env.DOCS.get('public/rung-extension.zip');
  if (!obj) return c.json({ error: 'not found' }, 404);
  return new Response(obj.body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="rung-extension.zip"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

publicRouter.get('/profile/:slug', async (c) => {
  const slug = c.req.param('slug');
  const profile = await c.env.DB
    .prepare(
      `SELECT user_id, slug, display_name, headline, avatar_url
       FROM profiles WHERE slug = ? AND public_enabled = 1`
    )
    .bind(slug)
    .first<{ user_id: string; slug: string; display_name: string | null; headline: string | null; avatar_url: string | null }>();

  if (!profile) return c.json({ error: 'not found' }, 404);

  const { results } = await c.env.DB
    .prepare(
      `SELECT label, url, icon FROM shortcut_links
       WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC`
    )
    .bind(profile.user_id)
    .all();

  return c.json({
    profile: {
      slug: profile.slug,
      display_name: profile.display_name,
      headline: profile.headline,
      avatar_url: profile.avatar_url,
      links: results
    }
  });
});

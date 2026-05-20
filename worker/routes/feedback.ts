import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { newId, nowIso } from '../util';

export const feedbackRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

feedbackRouter.post('/', async (c) => {
  const user = c.get('user');
  const { type, message } = await c.req.json<{ type: string; message: string }>();

  if (!['bug', 'feature', 'other'].includes(type)) return c.json({ error: 'invalid type' }, 400);
  if (!message?.trim()) return c.json({ error: 'message required' }, 400);

  await c.env.DB
    .prepare('INSERT INTO feedback (id, user_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(newId(), user.id, type, message.trim(), nowIso())
    .run();

  return c.json({ ok: true });
});

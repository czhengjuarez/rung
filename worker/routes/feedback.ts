import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { newId, nowIso } from '../util';

export const feedbackRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

const TYPE_LABELS: Record<string, string> = {
  bug:     '🐛 Bug report',
  feature: '✨ Feature request',
  other:   '💬 Other',
};

feedbackRouter.post('/', async (c) => {
  const user = c.get('user');
  const { type, message } = await c.req.json<{ type: string; message: string }>();

  if (!['bug', 'feature', 'other'].includes(type)) return c.json({ error: 'invalid type' }, 400);
  if (!message?.trim()) return c.json({ error: 'message required' }, 400);

  // Save to D1
  await c.env.DB
    .prepare('INSERT INTO feedback (id, user_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(newId(), user.id, type, message.trim(), nowIso())
    .run();

  // Send email via Resend
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Rung Feedback <onboarding@resend.dev>',
      to: 'czheng.juarez@gmail.com',
      subject: `Rung: ${TYPE_LABELS[type] ?? type}`,
      html: `
        <p><strong>From:</strong> ${user.name} (${user.email})</p>
        <p><strong>Type:</strong> ${TYPE_LABELS[type] ?? type}</p>
        <hr />
        <p>${message.trim().replace(/\n/g, '<br />')}</p>
      `,
    }),
  });

  return c.json({ ok: true });
});

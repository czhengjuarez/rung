import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { newId, nowIso } from '../util';

export const pushRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

interface NotifPrefs {
  follow_up_enabled: number;
  follow_up_days: number;
  new_leads_enabled: number;
  high_score_enabled: number;
  high_score_threshold: number;
  weekly_summary: number;
}

// ── VAPID public key (unauthenticated) ────────────────────────────────────

pushRouter.get('/vapid-public-key', (c) => {
  return c.json({ publicKey: c.env.VAPID_PUBLIC_KEY });
});

// ── Subscription ──────────────────────────────────────────────────────────

pushRouter.post('/subscribe', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{ endpoint: string; p256dh: string; auth: string }>();
  if (!body.endpoint || !body.p256dh || !body.auth) {
    return c.json({ error: 'endpoint, p256dh and auth required' }, 400);
  }

  const id = newId();
  await c.env.DB.prepare(
    `INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth`
  ).bind(id, user.id, body.endpoint, body.p256dh, body.auth).run();

  return c.json({ ok: true });
});

pushRouter.delete('/subscribe', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{ endpoint: string }>();
  if (!body.endpoint) return c.json({ error: 'endpoint required' }, 400);
  await c.env.DB.prepare(
    'DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?'
  ).bind(user.id, body.endpoint).run();
  return c.body(null, 204);
});

// ── Preferences ───────────────────────────────────────────────────────────

pushRouter.get('/preferences', async (c) => {
  const user = c.get('user');
  const prefs = await c.env.DB
    .prepare('SELECT * FROM notification_preferences WHERE user_id = ?')
    .bind(user.id).first<NotifPrefs>();
  return c.json({ preferences: prefs ?? null });
});

pushRouter.put('/preferences', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<Partial<NotifPrefs>>();

  await c.env.DB.prepare(
    `INSERT INTO notification_preferences
       (user_id, follow_up_enabled, follow_up_days, new_leads_enabled,
        high_score_enabled, high_score_threshold, weekly_summary, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       follow_up_enabled    = excluded.follow_up_enabled,
       follow_up_days       = excluded.follow_up_days,
       new_leads_enabled    = excluded.new_leads_enabled,
       high_score_enabled   = excluded.high_score_enabled,
       high_score_threshold = excluded.high_score_threshold,
       weekly_summary       = excluded.weekly_summary,
       updated_at           = excluded.updated_at`
  ).bind(
    user.id,
    body.follow_up_enabled  ?? 1,
    body.follow_up_days     ?? 7,
    body.new_leads_enabled  ?? 1,
    body.high_score_enabled ?? 1,
    body.high_score_threshold ?? 8,
    body.weekly_summary     ?? 0,
    nowIso(),
  ).run();

  const prefs = await c.env.DB
    .prepare('SELECT * FROM notification_preferences WHERE user_id = ?')
    .bind(user.id).first<NotifPrefs>();
  return c.json({ preferences: prefs });
});

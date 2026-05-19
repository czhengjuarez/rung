import type { D1Database } from '@cloudflare/workers-types';
import { sendPush, type PushSubscription } from '../lib/webpush';

interface NotifPrefs {
  user_id: string;
  follow_up_enabled: number;
  follow_up_days: number;
  new_leads_enabled: number;
  high_score_enabled: number;
  high_score_threshold: number;
  weekly_summary: number;
}

async function getSubs(db: D1Database, userId: string): Promise<PushSubscription[]> {
  const { results } = await db
    .prepare('SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?')
    .bind(userId).all<PushSubscription>();
  return results;
}

async function deliverToUser(
  db: D1Database,
  userId: string,
  payload: { title: string; body: string; url?: string },
  vapidPrivate: string,
  vapidPublic: string,
) {
  const subs = await getSubs(db, userId);
  for (const sub of subs) {
    const { gone } = await sendPush(sub, payload, vapidPrivate, vapidPublic);
    if (gone) {
      // Subscription expired — remove it
      await db.prepare(
        'DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?'
      ).bind(userId, sub.endpoint).run();
    }
  }
}

export async function sendDailyNotifications(
  db: D1Database,
  vapidPrivate: string,
  vapidPublic: string,
  newLeadsByUser: Map<string, number>,
) {
  // Load all preferences for users who have push subscriptions
  const { results: prefs } = await db
    .prepare(
      `SELECT np.* FROM notification_preferences np
       WHERE EXISTS (SELECT 1 FROM push_subscriptions ps WHERE ps.user_id = np.user_id)`
    ).all<NotifPrefs>();

  const dayOfWeek = new Date().getUTCDay(); // 0 = Sunday, 1 = Monday

  for (const pref of prefs) {
    // ── New leads ──────────────────────────────────────────────────────────
    if (pref.new_leads_enabled) {
      const count = newLeadsByUser.get(pref.user_id) ?? 0;
      if (count > 0) {
        await deliverToUser(db, pref.user_id, {
          title: `${count} new job lead${count === 1 ? '' : 's'}`,
          body: 'Tap to see today\'s scored leads.',
          url: '/leads',
        }, vapidPrivate, vapidPublic);
      }
    }

    // ── High-score lead ────────────────────────────────────────────────────
    if (pref.high_score_enabled) {
      const lead = await db
        .prepare(
          `SELECT title, company, score FROM job_leads
           WHERE user_id = ? AND state = 'new' AND score >= ?
             AND DATE(fetched_at) = DATE('now')
           ORDER BY score DESC LIMIT 1`
        )
        .bind(pref.user_id, pref.high_score_threshold)
        .first<{ title: string; company: string; score: number }>();

      if (lead) {
        await deliverToUser(db, pref.user_id, {
          title: `Strong match: ${lead.company}`,
          body: `${lead.title} scored ${lead.score}/10.`,
          url: '/leads',
        }, vapidPrivate, vapidPublic);
      }
    }

    // ── Follow-up reminders ────────────────────────────────────────────────
    if (pref.follow_up_enabled) {
      const { results: stale } = await db
        .prepare(
          `SELECT company, role
           FROM applications
           WHERE user_id = ?
             AND status NOT IN ('Accepted', 'Rejected', 'Withdrawn')
             AND COALESCE(last_activity_at, created_at) < datetime('now', ? || ' days')
           ORDER BY COALESCE(last_activity_at, created_at) ASC
           LIMIT 3`
        )
        .bind(pref.user_id, `-${pref.follow_up_days}`)
        .all<{ company: string; role: string | null }>();

      if (stale.length > 0) {
        const first = stale[0];
        const extra = stale.length > 1 ? ` (+${stale.length - 1} more)` : '';
        await deliverToUser(db, pref.user_id, {
          title: 'Time to follow up',
          body: `${first.company}${first.role ? ` — ${first.role}` : ''} has been quiet for ${pref.follow_up_days}+ days.${extra}`,
          url: '/',
        }, vapidPrivate, vapidPublic);
      }
    }

    // ── Weekly summary (Mondays only) ──────────────────────────────────────
    if (pref.weekly_summary && dayOfWeek === 1) {
      const stats = await db
        .prepare(
          `SELECT
             COUNT(*) AS total,
             SUM(CASE WHEN status IN ('Screening','Interviewing','Offer received') THEN 1 ELSE 0 END) AS active,
             SUM(CASE WHEN applied_at >= date('now', '-7 days') THEN 1 ELSE 0 END) AS this_week
           FROM applications WHERE user_id = ?`
        )
        .bind(pref.user_id)
        .first<{ total: number; active: number; this_week: number }>();

      if (stats && stats.total > 0) {
        await deliverToUser(db, pref.user_id, {
          title: 'Your weekly job search summary',
          body: `${stats.this_week} applied this week · ${stats.active} active · ${stats.total} total`,
          url: '/',
        }, vapidPrivate, vapidPublic);
      }
    }
  }
}

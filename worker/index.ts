import { Hono } from 'hono';
import { authRouter, loadUser, logout, requireUser } from './auth';
import { applicationsRouter } from './routes/applications';
import { contactsRouter } from './routes/contacts';
import { interviewRouter } from './routes/interview';
import { leadsRouter } from './routes/leads';
import { resumesRouter } from './routes/resumes';
import { linksRouter } from './routes/links';
import { profileRouter } from './routes/profile';
import { publicRouter } from './routes/public';
import { runLeadsFetch } from './cron/fetchLeads';
import { scoreLeads } from './cron/scoreLeads';
import { sendDailyNotifications } from './cron/sendNotifications';
import { pushRouter } from './routes/push';
import { feedbackRouter } from './routes/feedback';
import type { Env, Variables } from './types';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.route('/auth', authRouter);

const api = new Hono<{ Bindings: Env; Variables: Variables }>();

api.get('/me', async (c) => {
  const user = await loadUser(c);
  return c.json({ user });
});

api.post('/auth/logout', async (c) => {
  await logout(c);
  return c.body(null, 204);
});

api.use('/links/*', requireUser);
api.route('/links', linksRouter);

api.use('/applications/*', requireUser);
api.route('/applications', applicationsRouter);

api.use('/contacts/*', requireUser);
api.route('/contacts', contactsRouter);

api.use('/leads/*', requireUser);
api.route('/leads', leadsRouter);

api.use('/interview/*', requireUser);
api.route('/interview', interviewRouter);

api.use('/resumes/*', requireUser);
api.route('/resumes', resumesRouter);

api.use('/profile/*', requireUser);
api.route('/profile', profileRouter);

api.route('/public', publicRouter);

api.use('/feedback/*', requireUser);
api.route('/feedback', feedbackRouter);

// Push: vapid-public-key is unauthenticated; subscribe + preferences require auth
api.get('/push/vapid-public-key', (c) => c.json({ publicKey: c.env.VAPID_PUBLIC_KEY }));
api.use('/push/*', requireUser);
api.route('/push', pushRouter);

app.route('/api', api);

app.all('*', async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default {
  fetch: app.fetch.bind(app),
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil((async () => {
      const fetchResults = await runLeadsFetch(env.DB, undefined);
      await scoreLeads(env.DB, env.AI);

      // Build per-user new-lead counts for notification logic
      const newLeadsByUser = new Map<string, number>();
      for (const r of fetchResults) {
        if (r.inserted > 0) {
          // fetchResults has source-level counts; attribute to the source owner
          const row = await env.DB
            .prepare('SELECT user_id FROM lead_sources WHERE id = ?')
            .bind(r.source_id).first<{ user_id: string }>();
          if (row) {
            newLeadsByUser.set(row.user_id, (newLeadsByUser.get(row.user_id) ?? 0) + r.inserted);
          }
        }
      }

      await sendDailyNotifications(env.DB, env.VAPID_PRIVATE_KEY, env.VAPID_PUBLIC_KEY, newLeadsByUser);
    })());
  },
};

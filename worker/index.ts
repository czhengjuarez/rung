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
  return new Response(null, { status: 204 });
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

app.route('/api', api);

app.all('*', async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default {
  fetch: app.fetch.bind(app),
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      runLeadsFetch(env.DB, undefined).then(() => scoreLeads(env.DB, env.AI))
    );
  },
};

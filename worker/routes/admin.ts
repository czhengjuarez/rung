import { Hono } from 'hono';
import type { Env, Variables } from '../types';

export const adminRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

function isAdmin(email: string, adminEmails: string): boolean {
  return adminEmails.split(',').map(e => e.trim().toLowerCase()).includes(email.toLowerCase());
}

// Guard every admin route
adminRouter.use('/*', async (c, next) => {
  const user = c.get('user');
  if (!isAdmin(user.email, c.env.ADMIN_EMAILS ?? '')) {
    return c.json({ error: 'forbidden' }, 403);
  }
  await next();
});

// GET /api/admin/users — all users with activity counts
adminRouter.get('/users', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT
       u.id, u.email, u.name, u.avatar_url, u.created_at,
       COUNT(DISTINCT a.id)  AS app_count,
       COUNT(DISTINCT jl.id) AS lead_count,
       COUNT(DISTINCT f.id)  AS feedback_count
     FROM users u
     LEFT JOIN applications  a  ON a.user_id  = u.id
     LEFT JOIN job_leads     jl ON jl.user_id = u.id AND jl.state = 'new'
     LEFT JOIN feedback      f  ON f.user_id  = u.id
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  ).all();
  return c.json({ users: results });
});

// GET /api/admin/feedback — all feedback with submitter info
adminRouter.get('/feedback', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT f.id, f.type, f.message, f.resolved, f.created_at,
            u.name AS user_name, u.email AS user_email, u.avatar_url AS user_avatar
     FROM feedback f
     JOIN users u ON u.id = f.user_id
     ORDER BY f.created_at DESC`
  ).all();
  return c.json({ feedback: results });
});

// PATCH /api/admin/feedback/:id — toggle resolved
adminRouter.patch('/feedback/:id', async (c) => {
  const id = c.req.param('id');
  const { resolved } = await c.req.json<{ resolved: number }>();
  await c.env.DB
    .prepare('UPDATE feedback SET resolved = ? WHERE id = ?')
    .bind(resolved ? 1 : 0, id).run();
  const row = await c.env.DB.prepare('SELECT * FROM feedback WHERE id = ?').bind(id).first();
  return c.json({ feedback: row });
});

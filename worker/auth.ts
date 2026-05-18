import { Context, Hono, MiddlewareHandler } from 'hono';
import type { Env, SessionUser, Variables } from './types';
import { buildCookie, newId, parseCookies, randomBase64Url, signJwt, verifyJwt } from './util';

const SESSION_COOKIE = 'rung_session';
const OAUTH_STATE_COOKIE = 'rung_oauth_state';
const SESSION_DAYS = 30;

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  avatar: string | null;
  iat: number;
  exp: number;
}

export const authRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

authRouter.get('/google/start', (c) => {
  const state = randomBase64Url(24);
  const redirectUri = `${appOrigin(c)}/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: redirectUri,
    state,
    access_type: 'online',
    prompt: 'select_account'
  });
  c.header('Set-Cookie', buildCookie(OAUTH_STATE_COOKIE, state, { maxAge: 600, sameSite: 'Lax' }));
  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

authRouter.get('/google/callback', async (c) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookies(c.req.header('Cookie'));
  const expectedState = cookies[OAUTH_STATE_COOKIE];
  if (!code || !state || !expectedState || state !== expectedState) {
    return c.text('OAuth state mismatch', 400);
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${appOrigin(c)}/auth/google/callback`,
      grant_type: 'authorization_code'
    })
  });
  if (!tokenRes.ok) return c.text(`Token exchange failed: ${await tokenRes.text()}`, 400);

  const { id_token } = (await tokenRes.json()) as { id_token: string };
  const claims = decodeIdToken(id_token);
  if (!claims?.sub || !claims.email) return c.text('Missing claims in id_token', 400);

  // Upsert user in D1
  const db = c.env.DB;
  const existing = await db
    .prepare('SELECT id FROM users WHERE google_sub = ?')
    .bind(claims.sub)
    .first<{ id: string }>();

  let userId: string;
  if (existing) {
    userId = existing.id;
    await db
      .prepare('UPDATE users SET email = ?, name = ?, avatar_url = ? WHERE id = ?')
      .bind(claims.email, claims.name ?? claims.email, claims.picture ?? null, userId)
      .run();
  } else {
    userId = newId();
    await db
      .prepare('INSERT INTO users (id, google_sub, email, name, avatar_url) VALUES (?, ?, ?, ?, ?)')
      .bind(userId, claims.sub, claims.email, claims.name ?? claims.email, claims.picture ?? null)
      .run();
    await db
      .prepare('INSERT INTO profiles (user_id, display_name, avatar_url, public_enabled) VALUES (?, ?, ?, 0)')
      .bind(userId, claims.name ?? claims.email, claims.picture ?? null)
      .run();
  }

  // Issue signed JWT — embed user info so API routes need no D1 read per request
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: userId,
    email: claims.email,
    name: claims.name ?? claims.email,
    avatar: claims.picture ?? null,
    iat: now,
    exp: now + SESSION_DAYS * 24 * 60 * 60
  };
  const jwt = await signJwt(payload as unknown as Record<string, unknown>, c.env.JWT_SECRET);

  c.header('Set-Cookie', buildCookie(SESSION_COOKIE, jwt, { maxAge: SESSION_DAYS * 24 * 60 * 60, sameSite: 'Lax' }));
  c.header('Set-Cookie', buildCookie(OAUTH_STATE_COOKIE, '', { maxAge: 0 }), { append: true });

  return c.redirect('/');
});

// Middleware: verify JWT, inject user into context. No D1 read.
export const requireUser: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const user = await loadUser(c);
  if (!user) return c.json({ error: 'unauthorized' }, 401);
  c.set('user', user);
  await next();
};

export async function loadUser(
  c: Context<{ Bindings: Env; Variables: Variables }>
): Promise<SessionUser | null> {
  const cookies = parseCookies(c.req.header('Cookie'));
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  const payload = await verifyJwt<JwtPayload & Record<string, unknown>>(token, c.env.JWT_SECRET);
  if (!payload) return null;
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    avatar_url: payload.avatar
  };
}

export async function logout(c: Context<{ Bindings: Env; Variables: Variables }>) {
  c.header('Set-Cookie', buildCookie(SESSION_COOKIE, '', { maxAge: 0 }));
}

function appOrigin(c: Context<{ Bindings: Env; Variables: Variables }>): string {
  if (c.env.APP_URL && !c.req.url.includes('localhost')) return c.env.APP_URL;
  const u = new URL(c.req.url);
  return `${u.protocol}//${u.host}`;
}

interface IdTokenClaims {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

function decodeIdToken(jwt: string): IdTokenClaims | null {
  const parts = jwt.split('.');
  if (parts.length !== 3) return null;
  try {
    const b = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b + '='.repeat((4 - (b.length % 4)) % 4))) as IdTokenClaims;
  } catch {
    return null;
  }
}

# Rung

A personal job-seeking tracker. React + Vite frontend served by a single Cloudflare Worker that also exposes the JSON API. D1 for storage, R2 for documents (Phase 2), Workers AI for interview-answer refinement (Phase 3).

See [plan.md](./plan.md) for the full phased plan.

## Stack

- React 18 + Vite + TypeScript
- `@ops-forward/keel` design system (local `file:../Keel/packages/keel` dependency)
- Hono on Cloudflare Workers
- D1 (`rung`)
- Google OAuth (OIDC), HttpOnly session cookies

Deploy target: `https://rung.coscient.workers.dev`

## First-time setup

```bash
# 1. Build the Keel package once (it's a file: dependency)
(cd ../Keel && npm install && npm run keel:build)

# 2. Install Rung deps
npm install

# 3. Create the D1 database, then paste the returned database_id
#    into wrangler.toml under [[d1_databases]] database_id.
npx wrangler d1 create rung

# 4. Apply the schema locally + remotely
npm run db:apply:local
npm run db:apply:remote

# 5. Set OAuth + session secrets
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET   # any 32+ byte random string

# 6. In Google Cloud Console for the OAuth client, add these redirect URIs:
#    https://rung.coscient.workers.dev/auth/google/callback
#    http://localhost:8787/auth/google/callback
```

## Local dev

Two terminals:

```bash
# Terminal A — Worker (API + auth) on :8787 with local D1
npm run cf:dev

# Terminal B — Vite dev server on :5173 (proxies /api and /auth to :8787)
npm run dev
```

Open http://localhost:5173.

## Deploy

```bash
npm run cf:deploy
```

This runs `vite build` then `wrangler deploy`. The single Worker serves both the SPA (from `./dist`) and the API.

## Project layout

```
rung/
├── plan.md
├── wrangler.toml
├── migrations/
│   └── 0001_initial.sql
├── src/                 # React app
│   ├── main.tsx
│   ├── App.tsx
│   ├── api.ts
│   ├── types.ts
│   ├── components/
│   ├── pages/
│   └── styles/
└── worker/              # Cloudflare Worker
    ├── index.ts         # Hono entrypoint
    ├── auth.ts          # Google OAuth + sessions
    ├── util.ts
    ├── types.ts
    └── routes/
        ├── applications.ts
        ├── links.ts
        ├── profile.ts
        └── public.ts
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server (UI only) |
| `npm run cf:dev` | Wrangler dev (Worker + local D1) |
| `npm run build` | Type-check + Vite production build |
| `npm run typecheck` | Type-check only |
| `npm run cf:deploy` | Build + deploy Worker |
| `npm run db:apply:local` | Apply migration to local D1 |
| `npm run db:apply:remote` | Apply migration to remote D1 |

## What's in Phase 1

- Google sign-in (OIDC), session cookie, multi-tenant.
- Shortcut links: add / edit / delete / one-click copy.
- Applications: desktop table + mobile cards, star, status pipeline, filters, full-record edit modal with notes.
- Public opt-in profile at `/u/<slug>` showing only links + headline. Application data is never exposed.

Phases 2 and 3 (dashboard + reminders + CRM + R2 documents + interview questions + Workers AI) are scoped in [plan.md](./plan.md) and not yet implemented.

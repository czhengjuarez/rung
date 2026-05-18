# Rung — Plan

A personal job-seeking tracker. Multi-tenant from day one. Built as a single Cloudflare Worker that serves both the React SPA and the JSON API.

Deploy URL: `https://rung.coscient.workers.dev`
Cloudflare account: `d6ff2f0914adb1d9faae77870fadb7cc`

## Stack

| Concern | Choice |
| --- | --- |
| UI | React 18 + Vite + TypeScript |
| Design system | `@ops-forward/keel` (local file: dependency to `../Keel/packages/keel`) |
| Icons | `lucide-react` |
| Routing | `react-router-dom` v7 |
| Backend | Hono on Cloudflare Workers |
| Static assets | Workers `[assets]` binding with SPA fallback |
| DB | Cloudflare D1 (one database: `rung`) |
| Object storage | Cloudflare R2 (`rung-documents`) |
| AI | Workers AI binding (`@cf/meta/llama-3.3-70b-instruct` or 3.1 8b for cost) |
| Auth | Google OAuth (OIDC), HttpOnly secure cookie session, sessions table in D1 |

Local dev uses `wrangler dev --local` which runs the Worker and D1 against a local SQLite file — no cloud writes during iteration.

## Architecture

Single Worker (`rung`) does everything:

1. Hono router catches `/api/*` routes (auth, applications, links, profile).
2. `/auth/google/*` routes handle the OAuth dance.
3. Everything else falls through to the `[assets]` binding, which serves the built React app from `./dist/` with SPA fallback (any unknown path returns `index.html`).

No separate API worker, no Pages project, no D1 staging environment until we need it.

## Data model (D1)

```sql
users(id PK, google_sub UNIQUE, email, name, avatar_url, created_at)
sessions(id PK, user_id FK, expires_at, created_at)

shortcut_links(id PK, user_id FK, label, url, icon, sort_order, created_at)

applications(
  id PK, user_id FK,
  company, role, location, work_mode, size, industry,
  status, stage, referral,
  salary_low, salary_high, salary_currency,
  applied_at, last_activity_at,
  starred, notes, created_at, updated_at
)
application_events(id PK, application_id FK, type, occurred_at, notes)

contacts(id PK, user_id FK, name, company, role, email, linkedin, notes, last_touch_at)
application_contacts(application_id, contact_id, relationship, PRIMARY KEY (application_id, contact_id))

documents(id PK, user_id FK, type, label, r2_key, version, created_at)
application_documents(application_id, document_id, PRIMARY KEY (application_id, document_id))

interview_questions(id PK, author_user_id FK, visibility, category, company, question, tags, created_at)
question_answers(id PK, question_id FK, user_id FK, answer, ai_refined_answer, updated_at)

profiles(user_id PK FK, slug UNIQUE, public_enabled, display_name, headline, avatar_url)
```

Phase 1 ships the tables in **bold below**. The rest land in their respective phases.

## Phased build

### Phase 1 — Foundation + Tracker (this build)

Tables: `users`, `sessions`, `shortcut_links`, `applications`, `application_events`, `profiles`.

- Vite + React + TS scaffold, Keel wired in (`@ops-forward/keel/styles.css` + class helpers).
- Hono Worker with `[assets]` SPA fallback and `/api/*` JSON routes.
- D1 migration `0001_initial.sql`.
- Google OAuth: `/auth/google/start` → Google → `/auth/google/callback`. On callback, upsert user, create session, set `rung_session` HttpOnly cookie. `requireUser()` middleware on protected routes.
- Shortcut links UI: list with icons, add/edit modal, drag-free reorder via up/down buttons (keeps mobile-friendly), one-click copy with toast.
- Applications UI:
  - Desktop: dense table matching the Coda columns.
  - Mobile: stacked cards.
  - Star, status pipeline, filters (status, industry, size, date range), text search.
  - Side panel for full edit (notes, events).
- Public profile (opt-in): `rung.coscient.workers.dev/u/<slug>` shows shortcut links and a short headline. No application data ever shown publicly.

### Phase 2 — Dashboard + extras

Tables added: `contacts`, `application_contacts`, `documents`, `application_documents`.

- Monthly KPIs, funnel, activity heatmap.
- Follow-up reminders widget (in-app, driven by `last_activity_at`).
- Recruiter CRM linked to applications.
- Resume versioning in R2, attach a version per application.
- CSV import/export with column mapping wizard.

### Phase 3 — Interview questions + AI

Tables added: `interview_questions`, `question_answers`.

- Public / private question library.
- "Tweak with AI" via Workers AI: tone + length + STAR-format restructure.
- Diff view + accept/reject for AI suggestions.

## Routes

### API
```
POST   /api/auth/logout
GET    /api/me
GET    /api/links
POST   /api/links
PATCH  /api/links/:id
DELETE /api/links/:id
GET    /api/applications
POST   /api/applications
GET    /api/applications/:id
PATCH  /api/applications/:id
DELETE /api/applications/:id
POST   /api/applications/:id/events
GET    /api/profile
PATCH  /api/profile
GET    /api/public/profile/:slug   # no auth
```

### Auth
```
GET /auth/google/start
GET /auth/google/callback
```

### App routes (React Router)
```
/             → if logged in, Dashboard; else Login
/links        → manage shortcut links
/profile      → manage public profile
/u/:slug      → public profile
```

## What you need to do once

These are out of scope for the code itself — pre-deploy setup:

1. **Create the D1 database**
   ```bash
   wrangler d1 create rung
   ```
   Paste the returned `database_id` into `wrangler.toml`.

2. **Create the R2 bucket** (Phase 2, fine to skip now)
   ```bash
   wrangler r2 bucket create rung-documents
   ```

3. **Google OAuth client** (reuse an existing one)
   - Add `https://rung.coscient.workers.dev/auth/google/callback` and `http://localhost:8787/auth/google/callback` to Authorized redirect URIs.
   - Store as Worker secrets:
     ```bash
     wrangler secret put GOOGLE_CLIENT_ID
     wrangler secret put GOOGLE_CLIENT_SECRET
     wrangler secret put SESSION_SECRET   # any 32+ byte random string
     ```

4. **Apply the migration**
   ```bash
   wrangler d1 execute rung --remote --file=./migrations/0001_initial.sql
   wrangler d1 execute rung --local  --file=./migrations/0001_initial.sql
   ```

5. **Deploy**
   ```bash
   npm run build
   wrangler deploy
   ```

## Out of scope for v1

- Email sending (in-app reminders only).
- Calendar/`.ics` export.
- Offer comparison tool.
- Push notifications.
- Team / shared-tracker features.

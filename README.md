# Rung

> **Your job search, finally under control.**

Job hunting is exhausting. You're juggling dozens of applications, forgetting who you spoke to, losing track of where you are in each process, and trying to figure out which opportunities are actually worth your time. Rung is a personal tool built to take the chaos out of that process — so you can spend less time managing your search and more time actually succeeding at it.

Rung is **open source**, **self-hostable**, and built entirely on Cloudflare's free tier. It costs nothing to run for personal use.

---

## What Rung does

### Applications tracker
The core of Rung. Add every company you're interested in and move them through your own pipeline: Saved → Applied → Screening → Interviewing → Offer → Accepted / Rejected / Withdrawn. Filter by status, star the ones you care about most, and keep running notes. Each application has a full activity log so you can see exactly when things happened — phone screen on Tuesday, onsite on Thursday, offer on Friday.

### Job Leads
Stop manually hunting for jobs. Add job board sources — Greenhouse, Lever, Workable, or any RSS feed — and Rung fetches new listings automatically every morning. It then scores each one using AI, rating how well it matches your criteria (title keywords, seniority, work mode, location, salary range). New leads are sorted by score so the best ones are always at the top. You can also score any lead on demand, and convert interesting ones directly into tracked applications with one click.

You can also **clip any job posting** directly into your leads list — either by pasting a URL in the app (Leads → Clip URL) or using the browser extension (see below). Rung scrapes the title, company, location, and salary from the page automatically.

### Contacts & networking
Keep a CRM of the people who matter to your search — recruiters, hiring managers, connections inside companies. Link contacts to specific applications with a relationship label (e.g. "Referral", "Recruiter") so you always know who you know at each company.

### Resume management
Upload multiple resumes (PDF or text). Rung stores them in R2 and lets you label them — "Senior Engineer resume", "Product-focused", etc. The tailoring feature uses AI to rewrite your resume for a specific job description in seconds. Each application can record which resume you used, so you always know what you sent.

### Interview Prep
A built-in question bank. Rung ships with 22 well-sourced questions (from LinkedIn, Glassdoor, Indeed, McKinsey, HBR) covering behavioral, leadership, situational, technical, and culture-fit categories. You can add your own private questions too. Write out your answer to any question, then hit "Practice" to get AI coaching: a score out of 10, feedback on your STAR structure, strengths, areas to improve, and a suggested rewrite.

### Browser extension

A Chrome/Edge extension lets you clip any job posting to your leads list without leaving the page. It scrapes the title, company, location, and salary directly from the DOM (LinkedIn, Indeed, Greenhouse, Lever, Workday, and generic fallback), then falls back to a server-side scrape if the content script can't read the page.

The extension uses your existing Rung session cookie — no separate login required. If you're not logged in, it opens the Rung web app so you can sign in first.

See [`extension/`](#extension) in the project layout for the files. Load it in Chrome via **Extensions → Load unpacked → select the `extension/` folder**.

### Public profile
Optional. Enable a public profile at `/u/your-slug` to share a clean page with your headline and links — useful for networking or putting in your email signature. Your application data is never exposed.

### Links
Quick-access shortcuts to the sites you visit constantly during a job search — LinkedIn, your portfolio, your company's ATS, etc.

### Dark mode
Because you'll be using this late at night.

### Mobile
Rung works on your phone out of the box — no app store required. Open it in your mobile browser and you get a native-feeling experience: a bottom tab bar for the four main sections (Jobs, Leads, Interview Prep, Resume) and a "More" sheet for the rest. It can also be installed directly to your home screen so it opens full-screen like a real app.

---

## Using Rung on mobile

Rung is a Progressive Web App (PWA). The full feature set works in your phone's browser, and you can install it to your home screen for a full-screen, app-like experience.

### Installing on iPhone / iPad

1. Open [rung.coscient.workers.dev](https://rung.coscient.workers.dev) in **Safari** (must be Safari — other iOS browsers can't install PWAs)
2. Tap the **Share** button (the box with an arrow pointing up)
3. Scroll down and tap **Add to Home Screen**
4. Give it a name and tap **Add**

Rung will appear on your home screen with the ladder icon. Opening it from there launches it full-screen with no browser address bar.

### Installing on Android

1. Open [rung.coscient.workers.dev](https://rung.coscient.workers.dev) in **Chrome**
2. A bar appears at the bottom of the screen — tap **Add to Home screen** and confirm
3. The Rung icon is added to your home screen

Next time you visit in Chrome, the bar will show **"Open Rung"** instead — tap it to launch the installed app directly, or just open it from your home screen.

### Mobile navigation

On screens narrower than 640px the sidebar is replaced by a bottom tab bar:

| Tab | What it does |
|---|---|
| **Jobs** | Your applications tracker |
| **Leads** | Job leads feed and scoring |
| **Prep** | Interview question bank and AI coach |
| **Resume** | Upload and tailor your resumes |
| **More** | Contacts, Profile, Links, theme toggle, logout |

Tapping **More** slides up a sheet. Tapping anywhere outside it or navigating closes it automatically.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Design system | [`@ops-forward/keel`](https://github.com/czhengjuarez/Keel) — [docs](https://keel.coscient.workers.dev/) |
| Routing | React Router v6 |
| Backend | [Hono](https://hono.dev/) on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| File storage | Cloudflare R2 |
| AI | Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`) |
| Auth | Google OAuth 2.0 (OIDC), HttpOnly session cookies |
| Scheduling | Cloudflare Cron Triggers |
| Observability | Cloudflare Workers Observability |

Everything runs inside Cloudflare's network — there are no external services and no servers to manage.

---

## Keel design system

Rung uses **[Keel](https://github.com/czhengjuarez/Keel)** (`@ops-forward/keel`), a lightweight design system built for Cloudflare Workers apps. Full component docs and a live playground are at [keel.coscient.workers.dev](https://keel.coscient.workers.dev/).

Keel provides the utility functions (`buttonClass`, `badgeClass`, etc.) and design tokens (`--of-*` CSS variables) that Rung's components use. It is referenced as a local `file:` dependency in `package.json`, so both repos need to be cloned side by side:

```
your-workspace/
├── Keel/    ← https://github.com/czhengjuarez/Keel
└── rung/    ← https://github.com/czhengjuarez/rung
```

If you want to swap Keel out for another component library, the surface area is small — Keel is only used for class-name helpers and CSS variables, not for any React components with internal state.

---

## AI features & rate limits

### What model is used
Rung uses **`@cf/meta/llama-3.1-8b-instruct`** via Cloudflare Workers AI for two features:

1. **Lead scoring** — rates each job lead 1–10 against your criteria with a one-sentence reason
2. **Interview coaching** — scores your practice answer and gives structured feedback (STAR analysis, strengths, improvements, a suggested rewrite)

### Cost
Workers AI uses a unit called **Neurons**. Cloudflare's free tier includes ~10,000 Neurons/day. Each lead scoring call costs roughly 0.3–0.5 Neurons; each interview coaching call costs roughly 1–2 Neurons. For a single user, you will not hit the free limit under normal use.

### Rate limits and why they exist

**Resume tailoring: 10 tailors per 24 hours**

Tailoring a resume is the most token-intensive AI call in Rung — it reads your full resume, the full job description, and produces a complete rewritten document. Each call costs significantly more Neurons than a simple scoring call. The 10/day limit exists so that if Rung is opened to multiple users, one person doing 50 tailors in a row doesn't exhaust the day's AI budget and break the feature for everyone else. The UI shows a live usage meter so you always know how many tailors you have left.

**Lead scoring: no rate limit on on-demand scoring**

Scoring a single lead is cheap enough (< 1 Neuron) that it is not worth gating. You can click the `?` badge on any unscored lead and score it instantly. The daily cron job scores up to 5 leads per user (not 5 globally) using a `ROW_NUMBER() OVER (PARTITION BY user_id)` window function, so no single user can starve others.

**Interview coaching: no rate limit**

Coaching calls are inexpensive relative to the free Neuron budget. No limit is applied.

The limit values (`TAILOR_DAILY_LIMIT = 10`) are constants in `worker/routes/resumes.ts` and easy to adjust for your own deployment.

---

## Architecture

```
Browser
  └── React SPA (Vite build, served from ./dist via ASSETS binding)
        └── /api/* → Hono router (Worker)
              ├── /auth/*          Google OAuth flow
              ├── /api/me          Session check
              ├── /api/applications  CRUD + events + contacts
              ├── /api/contacts    CRUD + application links
              ├── /api/leads       Criteria, sources, leads, scoring, conversion
              ├── /api/interview   Questions, answers, AI coach
              ├── /api/resumes     Upload (R2), tailor (AI), download
              ├── /api/profile     Public profile management
              ├── /api/links       Shortcut links
              └── /api/public/*    Unauthenticated public profile

Cron (0 7 * * * UTC)
  ├── fetchLeads.ts   Polls each active lead source, deduplicates by URL
  └── scoreLeads.ts   Scores up to 5 unscored leads per user via Workers AI
```

### Multi-tenancy

Every database row carries a `user_id`. Every authenticated API route reads `c.get('user')` from middleware and scopes all queries to that user. Data from one account is never visible to another.

### Session model

Login sets an HttpOnly, Secure, SameSite=Lax cookie containing a signed JWT. The Worker validates the JWT on every request — no session store lookup required.

---

## Database schema (summary)

| Table | Purpose |
|---|---|
| `users` | One row per Google account |
| `sessions` | Active login sessions (JWT-backed) |
| `applications` | Job applications with status, notes, salary, etc. |
| `application_events` | Activity timeline per application (phone screen, offer, etc.) |
| `profiles` | Public profile settings (slug, headline) |
| `profile_links` | Links shown on the public profile page |
| `shortcut_links` | Personal quick-access links |
| `contacts` | Networking contacts |
| `contact_applications` | Many-to-many join: contact ↔ application |
| `lead_criteria` | Per-user job-matching preferences for AI scoring |
| `lead_sources` | ATS / RSS feeds to poll for new leads |
| `job_leads` | Fetched job postings with AI score and state |
| `interview_questions` | Public library + private questions |
| `interview_answers` | Per-user saved answers + notes |
| `resumes` | Resume metadata (file lives in R2) |
| `resume_tailored` | AI-tailored resume versions |

Migrations live in `./migrations/` and are applied sequentially with `wrangler d1 migrations apply`.

---

## Project layout

```
rung/
├── wrangler.toml            Cloudflare Worker config (D1, R2, AI, cron)
├── extension/               Chrome/Edge browser extension (Manifest V3)
│   ├── manifest.json        Extension metadata, permissions, content script config
│   ├── popup.html           Extension popup UI
│   ├── popup.js             Popup logic — auth check, scrape, clip lead
│   ├── popup.css            Popup styles
│   └── content.js           Content script — DOM scraper for LinkedIn, Indeed, etc.
├── public/
│   ├── favicon.svg          Browser tab icon (32×32, ladder on gradient)
│   ├── icon.svg             PWA home screen icon (512×512)
│   └── manifest.webmanifest PWA install manifest
├── migrations/              SQL migration files (applied in order)
│   ├── 0001_initial.sql
│   ├── 0002_profile_links.sql
│   ├── 0003_contacts.sql
│   ├── 0004_job_leads.sql
│   ├── 0005_interview.sql
│   ├── 0006_resumes.sql
│   ├── 0007_application_resume.sql
│   ├── 0008_question_hint.sql
│   └── seed_questions.sql   22 public interview questions
├── src/                     React app
│   ├── main.tsx
│   ├── App.tsx              Shell layout + dark mode toggle
│   ├── api.ts               Typed fetch wrappers for every API route
│   ├── types.ts             Shared TypeScript types
│   ├── components/
│   │   ├── ApplicationModal.tsx   Full application editor (resume, events, contacts)
│   │   ├── LeadsPanel.tsx         Job leads UI with on-demand scoring
│   │   ├── RungLogo.tsx           Ladder SVG icon (sidebar + login page)
│   │   └── Toast.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx      Applications table
│   │   ├── LeadsPage.tsx          Job leads full page
│   │   ├── ContactsPage.tsx
│   │   ├── InterviewPage.tsx      Question bank + AI coach
│   │   ├── ResumePage.tsx         Upload, tailor, usage meter
│   │   ├── ProfilePage.tsx
│   │   ├── LinksPage.tsx
│   │   └── PublicProfilePage.tsx
│   └── styles/
│       ├── tokens.css       Design tokens (light-dark() for theme)
│       └── app.css          Component styles
└── worker/                  Cloudflare Worker (Hono)
    ├── index.ts             Router entrypoint + auth middleware + cron handler
    ├── auth.ts              Google OAuth + JWT session
    ├── util.ts              newId(), nowIso()
    ├── types.ts             Worker-side types (Env, Variables)
    ├── routes/
    │   ├── applications.ts
    │   ├── contacts.ts
    │   ├── interview.ts
    │   ├── leads.ts
    │   ├── links.ts
    │   ├── profile.ts
    │   ├── public.ts
    │   └── resumes.ts
    └── cron/
        ├── fetchLeads.ts    Polls ATS/RSS sources, inserts new job_leads rows
        └── scoreLeads.ts    AI scoring (batch cron + on-demand single-lead)
```

---

## Forking & self-hosting

Rung is designed to be forked. Everything runs on Cloudflare's free tier for personal use — no credit card required up to generous limits.

```bash
# 1. Fork this repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/rung.git

# 2. Clone Keel into the same parent directory (required — it's a file: dependency)
#    Docs: https://keel.coscient.workers.dev/
git clone https://github.com/czhengjuarez/Keel.git
#    Your folder should now look like:
#      your-workspace/
#      ├── Keel/
#      └── rung/

# 3. Build Keel once
(cd Keel && npm install && npm run keel:build)

# 4. Install Rung dependencies
cd rung
npm install

# 5. Create your D1 database
npx wrangler d1 create rung
#    Copy the returned database_id into wrangler.toml under [[d1_databases]]

# 6. Create the R2 bucket for resume storage
npx wrangler r2 bucket create rung-documents

# 7. Apply the schema
npm run db:apply:local   # local dev database
npm run db:apply:remote  # production database

# 8. Seed the public interview question library (optional)
npx wrangler d1 execute rung --remote --file=migrations/seed_questions.sql

# 9. Set your secrets
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put JWT_SECRET          # any 32+ byte random string

# 10. Register your Google OAuth redirect URIs
#     In Google Cloud Console → APIs & Services → Credentials → your OAuth client:
#       https://YOUR_WORKER.workers.dev/auth/google/callback
#       http://localhost:8787/auth/google/callback

# 11. Update wrangler.toml
#     Set your worker name and APP_URL to match your deployment URL
```

### Customising the rate limits

Open `worker/routes/resumes.ts` and change:
```ts
const TAILOR_DAILY_LIMIT = 10;
```

For the lead scoring batch size, open `worker/cron/scoreLeads.ts` and change the `rn <= 5` clause in the SQL query.

### Using a different AI model

All AI calls go through `c.env.AI.run(...)`. Swap the model string to any model available in your Cloudflare account:

```ts
// worker/cron/scoreLeads.ts and worker/routes/interview.ts
const MODEL = '@cf/meta/llama-3.1-8b-instruct';
```

Larger models (e.g. `@cf/meta/llama-3.3-70b-instruct`) will give better results but cost more Neurons per call.

---

## Local development

You need two terminals running simultaneously:

```bash
# Terminal A — Cloudflare Worker with local D1 + R2 on :8787
npm run cf:dev

# Terminal B — Vite dev server on :5173 (proxies /api/* and /auth/* to :8787)
npm run dev
```

Open http://localhost:5173. The Vite proxy handles CORS so the two servers feel like one.

---

## Deploying

```bash
npm run cf:deploy
```

This runs `tsc -b && vite build` then `wrangler deploy`. The Worker serves both the SPA (static assets via the `ASSETS` binding) and the JSON API from a single `workers.dev` URL.

---

## Scripts reference

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server (UI only, no Worker) |
| `npm run cf:dev` | Wrangler dev (Worker + local D1 + R2) |
| `npm run build` | Type-check + Vite production build |
| `npm run typecheck` | TypeScript type-check only (no emit) |
| `npm run cf:deploy` | Build + deploy Worker to Cloudflare |
| `npm run db:apply:local` | Apply all pending migrations to the local D1 database |
| `npm run db:apply:remote` | Apply all pending migrations to the remote (production) D1 database |

---

## Contributing

Contributions are welcome. If you have an idea for a feature or improvement, open an issue first to discuss it before writing code — this avoids duplicated effort and helps keep the scope focused.

### How to contribute

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make your changes. Keep commits small and focused.
4. Make sure the TypeScript build passes: `npm run build`
5. Open a pull request against `main` with a clear description of what you changed and why

### What's in scope

- Bug fixes (always welcome)
- Improvements to existing features that don't change the core data model
- New lead source types (Greenhouse, Lever, Workable, RSS are the four currently supported)
- UI polish and accessibility improvements
- Performance improvements

### What's out of scope (for now)

- Third-party integrations that require server-side secrets beyond what's already in `wrangler.toml`
- Features that require a paid Cloudflare plan

### Code style

- TypeScript throughout — no `any` unless there's a very good reason
- No comments that describe *what* the code does — only *why* when it's non-obvious
- Keep components small. If a component is over ~250 lines, consider splitting it
- All API routes must scope queries to `user_id` — never expose one user's data to another

---

## Reporting a bug

Open a [GitHub Issue](../../issues/new) and include:

- What you were trying to do
- What you expected to happen
- What actually happened
- Your browser and OS (for UI bugs)
- Any error messages from the browser console or network tab

For security issues (auth bypass, data exposure between users, etc.), please **do not open a public issue**. Email the maintainer directly instead.

---

## License

MIT. Do whatever you want with it. If you build something cool on top of it, a mention would be appreciated but is not required.

import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { newId, nowIso } from '../util';
import { runLeadsFetch } from '../cron/fetchLeads';
import { scoreLeads, scoreSingleLead } from '../cron/scoreLeads';

export const leadsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// ── Criteria ──────────────────────────────────────────────────────────────────

leadsRouter.get('/criteria', async (c) => {
  const user = c.get('user');
  const criteria = await c.env.DB
    .prepare('SELECT * FROM lead_criteria WHERE user_id = ?')
    .bind(user.id).first();
  return c.json({ criteria: criteria ?? null });
});

leadsRouter.put('/criteria', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    title_keywords?: string;
    seniority?: string;
    work_modes?: string;
    salary_min?: number | null;
    salary_max?: number | null;
    salary_currency?: string;
    location?: string;
    include_keywords?: string;
    exclude_keywords?: string;
  }>();

  await c.env.DB.prepare(
    `INSERT INTO lead_criteria (user_id, title_keywords, seniority, work_modes, salary_min, salary_max, salary_currency, location, include_keywords, exclude_keywords, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       title_keywords    = excluded.title_keywords,
       seniority         = excluded.seniority,
       work_modes        = excluded.work_modes,
       salary_min        = excluded.salary_min,
       salary_max        = excluded.salary_max,
       salary_currency   = excluded.salary_currency,
       location          = excluded.location,
       include_keywords  = excluded.include_keywords,
       exclude_keywords  = excluded.exclude_keywords,
       updated_at        = excluded.updated_at`
  ).bind(
    user.id,
    body.title_keywords ?? null,
    body.seniority ?? null,
    body.work_modes ?? null,
    body.salary_min ?? null,
    body.salary_max ?? null,
    body.salary_currency ?? 'USD',
    body.location ?? null,
    body.include_keywords ?? null,
    body.exclude_keywords ?? null,
    nowIso()
  ).run();

  const criteria = await c.env.DB
    .prepare('SELECT * FROM lead_criteria WHERE user_id = ?')
    .bind(user.id).first();
  return c.json({ criteria });
});

// ── Sources ───────────────────────────────────────────────────────────────────

leadsRouter.get('/sources', async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB
    .prepare('SELECT * FROM lead_sources WHERE user_id = ? ORDER BY created_at ASC')
    .bind(user.id).all();
  return c.json({ sources: results });
});

leadsRouter.post('/sources', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    source_type: string;
    slug?: string;
    url?: string;
    label: string;
  }>();
  if (!body.source_type || !body.label) {
    return c.json({ error: 'source_type and label are required' }, 400);
  }
  const id = newId();
  await c.env.DB.prepare(
    'INSERT INTO lead_sources (id, user_id, source_type, slug, url, label, active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
  ).bind(id, user.id, body.source_type, body.slug ?? null, body.url ?? null, body.label, nowIso()).run();
  const source = await c.env.DB.prepare('SELECT * FROM lead_sources WHERE id = ?').bind(id).first();
  return c.json({ source }, 201);
});

leadsRouter.patch('/sources/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json<{ label?: string; slug?: string; url?: string; active?: number }>();

  const owned = await c.env.DB
    .prepare('SELECT id FROM lead_sources WHERE id = ? AND user_id = ?')
    .bind(id, user.id).first();
  if (!owned) return c.json({ error: 'not found' }, 404);

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (body.label !== undefined)  { sets.push('label = ?');  vals.push(body.label); }
  if (body.slug !== undefined)   { sets.push('slug = ?');   vals.push(body.slug); }
  if (body.url !== undefined)    { sets.push('url = ?');    vals.push(body.url); }
  if (body.active !== undefined) { sets.push('active = ?'); vals.push(body.active); }
  if (sets.length === 0) return c.json({ error: 'nothing to update' }, 400);
  vals.push(id);

  await c.env.DB.prepare(`UPDATE lead_sources SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  const source = await c.env.DB.prepare('SELECT * FROM lead_sources WHERE id = ?').bind(id).first();
  return c.json({ source });
});

leadsRouter.delete('/sources/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await c.env.DB
    .prepare('DELETE FROM lead_sources WHERE id = ? AND user_id = ?')
    .bind(id, user.id).run();
  return new Response(null, { status: 204 });
});

// ── Leads ─────────────────────────────────────────────────────────────────────

leadsRouter.get('/', async (c) => {
  const user = c.get('user');
  const state = c.req.query('state') ?? 'new';
  const { results } = await c.env.DB
    .prepare(
      `SELECT jl.*, ls.label AS source_label, ls.source_type
       FROM job_leads jl
       LEFT JOIN lead_sources ls ON ls.id = jl.source_id
       WHERE jl.user_id = ? AND jl.state = ?
       ORDER BY COALESCE(jl.score, 0) DESC, jl.fetched_at DESC
       LIMIT 100`
    )
    .bind(user.id, state).all();
  return c.json({ leads: results });
});

// ── URL scraper ───────────────────────────────────────────────────────────────
// POST /api/leads/scrape — fetch a job posting URL server-side and extract
// structured fields. Tries (in order): JSON-LD JobPosting → OpenGraph/meta →
// AI (llama-3.1-8b) fallback. Returns extracted fields without saving.

function stripHtml(html: string): string {
  // Remove scripts/styles/noscript blocks entirely
  let s = html.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  // Strip remaining tags
  s = s.replace(/<[^>]+>/g, ' ');
  // Collapse whitespace
  return s.replace(/\s+/g, ' ').trim();
}

leadsRouter.post('/scrape', async (c) => {
  const body = await c.req.json<{ url: string }>();
  const rawUrl = body.url?.trim();
  if (!rawUrl) return c.json({ error: 'url is required' }, 400);

  // Validate URL
  let parsedUrl: URL;
  try { parsedUrl = new URL(rawUrl); } catch {
    return c.json({ error: 'Invalid URL' }, 400);
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return c.json({ error: 'Only http/https URLs are supported' }, 400);
  }

  // Fetch the page (15 s timeout)
  let html: string;
  try {
    const res = await fetch(rawUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Rung/1.0; +https://rung.coscient.workers.dev)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15_000),
      redirect: 'follow',
    });
    if (!res.ok) return c.json({ error: `Could not fetch page (${res.status})` }, 422);
    html = await res.text();
  } catch (err) {
    return c.json({ error: `Fetch failed: ${(err as Error).message}` }, 422);
  }

  // ── 1. Try JSON-LD JobPosting ────────────────────────────────────────────
  const ldMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of ldMatches) {
    try {
      const obj = JSON.parse(m[1]);
      const items: unknown[] = Array.isArray(obj) ? obj : obj['@graph'] ? obj['@graph'] : [obj];
      const job = items.find((o: unknown) => (o as { '@type'?: string })['@type'] === 'JobPosting') as
        { title?: string; hiringOrganization?: { name?: string }; jobLocation?: { address?: { addressLocality?: string; addressRegion?: string } | { addressLocality?: string } }; baseSalary?: { value?: { minValue?: number; maxValue?: number; unitText?: string } }; description?: string } | undefined;
      if (job) {
        const loc = job.jobLocation?.address?.addressLocality ?? '';
        const region = (job.jobLocation?.address as { addressRegion?: string })?.addressRegion ?? '';
        const sal = job.baseSalary?.value;
        let salary_hint: string | null = null;
        if (sal?.minValue && sal?.maxValue) {
          salary_hint = `$${Math.round(sal.minValue / 1000)}k–$${Math.round(sal.maxValue / 1000)}k`;
        }
        return c.json({
          title:       job.title ?? null,
          company:     job.hiringOrganization?.name ?? null,
          location:    [loc, region].filter(Boolean).join(', ') || null,
          salary_hint,
          description: job.description ? stripHtml(job.description).slice(0, 3000) : null,
          source:      'json-ld',
        });
      }
    } catch { /* skip malformed JSON-LD */ }
  }

  // ── 2. Try OpenGraph / meta tags ─────────────────────────────────────────

  // Job platforms whose og:site_name is the platform, NOT the employer
  const PLATFORM_NAMES = [
    'LinkedIn', 'Indeed', 'Glassdoor', 'Monster', 'ZipRecruiter', 'Dice',
    'SimplyHired', 'CareerBuilder', 'Handshake', 'Built In', 'Wellfound',
    'AngelList', 'Hired', 'Ladders', 'FlexJobs',
  ];
  const PLATFORM_SUFFIX_RE = new RegExp(
    `\\s*[|\\-–]\\s*(${PLATFORM_NAMES.join('|')})\\s*$`, 'i'
  );

  function metaContent(prop: string): string | null {
    const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
            || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'));
    return m ? m[1].trim() : null;
  }
  function titleTag(): string | null {
    const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return m ? m[1].trim() : null;
  }

  const ogSite    = metaContent('og:site_name');
  const ogDesc    = metaContent('og:description') || metaContent('description');

  // Determine if og:site_name is a known job platform (not the actual employer)
  const isPlatform = ogSite ? PLATFORM_NAMES.some(p => p.toLowerCase() === ogSite.toLowerCase()) : false;
  let company: string | null = isPlatform ? null : (ogSite ?? null);

  // Prefer og:title; strip trailing "| Platform" suffix
  const rawOgTitle = metaContent('og:title') || titleTag() || '';
  const cleanTitle = rawOgTitle.replace(PLATFORM_SUFFIX_RE, '').trim();

  let title = cleanTitle;

  // Pattern 1 (LinkedIn style): "Company hiring [a|an] Role"
  // e.g. "University of California Office of the President hiring DIRECTOR OF DIGITAL STRATEGY"
  const hiringMatch = cleanTitle.match(/^(.+?)\s+(?:is\s+)?hiring\s+(?:a\s+|an\s+)?(.+)$/i);

  // Pattern 2: "Role at Company"
  const atMatch = cleanTitle.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);

  // Pattern 3: "Role | Company" or "Role - Company" (only if not a platform suffix)
  const pipeMatch = cleanTitle.match(/^(.+?)\s*[|\-–]\s*(.+)$/);

  if (hiringMatch) {
    // LinkedIn: "Company hiring Role"
    company = hiringMatch[1].trim();
    title   = hiringMatch[2].trim();
  } else if (atMatch) {
    // "Role at Company"
    title   = atMatch[1].trim();
    company = company ?? atMatch[2].trim();
  } else if (pipeMatch && !isPlatform) {
    const left  = pipeMatch[1].trim();
    const right = pipeMatch[2].trim();
    // If og:site_name matches the LEFT side → "Company - Role" (e.g. Greenhouse)
    // Otherwise → "Role | Company" (most common format)
    if (ogSite && left.toLowerCase().includes(ogSite.toLowerCase())) {
      title   = right;
      company = company ?? left;
    } else {
      title   = left;
      company = company ?? right;
    }
  }

  // ── 3. AI gap-fill ────────────────────────────────────────────────────────
  // Always run AI to extract location, salary_hint, and description which
  // meta tags almost never carry. Pass already-known title/company as context
  // so the model focuses on the missing fields.
  // Use the og:description + stripped body text as the source.
  const pageText = [
    ogDesc ?? '',
    stripHtml(html).slice(0, 4000),
  ].join('\n').trim().slice(0, 4500);

  type AiExtracted = { title?: string; company?: string; location?: string; salary_hint?: string; description?: string };
  let extracted: AiExtracted = {};
  try {
    const knownContext = [
      title   ? `Job title: ${title}`   : '',
      company ? `Company: ${company}`   : '',
    ].filter(Boolean).join('\n');

    const result = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You extract job posting details. Always respond with a valid JSON object only — no prose, no markdown, no code fences.',
        },
        {
          role: 'user',
          content: `Extract job details from the text below. Return ONLY a JSON object with these keys (use null if not found):
- title (job title)
- company (employer name, NOT the job board platform)
- location (city/state/region or "Remote")
- salary_hint (e.g. "$120k–$150k" or null)
- description (first 150 words of the job description, or null)

${knownContext ? `Already known — only override if you find something more specific:\n${knownContext}\n` : ''}
Text:
${pageText}`,
        },
      ],
      max_tokens: 400,
    }) as { response?: string };

    const raw = (result.response ?? '').trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) extracted = JSON.parse(jsonMatch[0]);
  } catch { /* AI failed — fall through to best-effort */ }

  return c.json({
    title:       title    || extracted.title       || null,
    company:     company  || extracted.company     || null,
    location:    extracted.location    || null,
    salary_hint: extracted.salary_hint || null,
    description: extracted.description || ogDesc   || null,
    source:      title || company ? 'opengraph+ai' : 'ai',
  });
  // (dead code below kept to close the try/catch that was here)
  {
    return c.json({ title: title || null, company, location: null, salary_hint: null, description: ogDesc ?? null, source: 'meta' });
  }
});

// ── Browser extension clip ────────────────────────────────────────────────────
// POST /api/leads/clip — add a manually clipped lead from the browser extension.
// Returns 409 if the URL already exists for this user.

leadsRouter.post('/clip', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    title: string;
    company: string;
    external_url: string;
    location?: string;
    salary_hint?: string;
    description?: string;
  }>();

  if (!body.title?.trim() || !body.company?.trim()) {
    return c.json({ error: 'title and company are required' }, 400);
  }

  // Normalise the URL — fall back to a placeholder so the UNIQUE constraint
  // doesn't conflate multiple URL-less clips.
  const url = body.external_url?.trim() || `rung://clip/${newId()}`;

  // Check for existing lead with this URL
  const existing = await c.env.DB
    .prepare('SELECT id, state FROM job_leads WHERE user_id = ? AND external_url = ?')
    .bind(user.id, url).first<{ id: string; state: string }>();

  if (existing) {
    if (existing.state === 'new') {
      // Already sitting in the active leads list — nothing to do
      return c.json({ error: 'This URL is already in your active leads.', id: existing.id }, 409);
    }
    // Was converted or dismissed — restore it to 'new' with updated fields
    await c.env.DB.prepare(
      `UPDATE job_leads SET
         state       = 'new',
         title       = ?,
         company     = ?,
         location    = COALESCE(?, location),
         salary_hint = COALESCE(?, salary_hint),
         description = COALESCE(?, description),
         score       = NULL,
         score_reason = NULL,
         converted_application_id = NULL,
         fetched_at  = ?
       WHERE id = ?`
    ).bind(
      body.title.trim(),
      body.company.trim(),
      body.location?.trim() ?? null,
      body.salary_hint?.trim() ?? null,
      body.description?.slice(0, 5000) ?? null,
      nowIso(),
      existing.id,
    ).run();

    const lead = await c.env.DB
      .prepare('SELECT * FROM job_leads WHERE id = ?')
      .bind(existing.id).first();
    return c.json({ lead }, 200);
  }

  const id = newId();
  await c.env.DB.prepare(
    `INSERT INTO job_leads
       (id, user_id, source_id, external_url, title, company, location, salary_hint, description, state, fetched_at)
     VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, 'new', ?)`
  ).bind(
    id,
    user.id,
    url,
    body.title.trim(),
    body.company.trim(),
    body.location?.trim() ?? null,
    body.salary_hint?.trim() ?? null,
    body.description?.slice(0, 5000) ?? null,
    nowIso(),
  ).run();

  const lead = await c.env.DB
    .prepare('SELECT * FROM job_leads WHERE id = ?')
    .bind(id).first();
  return c.json({ lead }, 201);
});

leadsRouter.post('/:id/dismiss', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const owned = await c.env.DB
    .prepare('SELECT id FROM job_leads WHERE id = ? AND user_id = ?')
    .bind(id, user.id).first();
  if (!owned) return c.json({ error: 'not found' }, 404);
  await c.env.DB
    .prepare("UPDATE job_leads SET state = 'dismissed' WHERE id = ?")
    .bind(id).run();
  return c.json({ ok: true });
});

// Parse a free-text salary hint into numeric low/high + currency.
// Handles: "$140k–$180k", "$120k-$150k", "$140,000–$180,000",
//          "£80k-£100k", "€90k", "120000-150000", etc.
function parseSalaryHint(hint: string | null): {
  salary_low: number | null;
  salary_high: number | null;
  salary_currency: string;
} {
  if (!hint) return { salary_low: null, salary_high: null, salary_currency: 'USD' };

  let currency = 'USD';
  if (/£/.test(hint))              currency = 'GBP';
  else if (/€/.test(hint))         currency = 'EUR';
  else if (/CAD|C\$/.test(hint))   currency = 'CAD';
  else if (/AUD|A\$/.test(hint))   currency = 'AUD';

  // Extract values expressed as NNNk (e.g. 140k → 140000)
  const kVals = [...hint.matchAll(/(\d+(?:\.\d+)?)\s*k/gi)]
    .map(m => Math.round(parseFloat(m[1]) * 1000));

  // Extract plain large numbers (5+ digits, e.g. 140,000 or 140000)
  const plainVals = [...hint.matchAll(/(\d{2,3}(?:,\d{3})+|\d{5,})/g)]
    .map(m => parseInt(m[1].replace(/,/g, ''), 10));

  const all = [...new Set([...kVals, ...plainVals])].sort((a, b) => a - b);

  if (all.length === 0) return { salary_low: null, salary_high: null, salary_currency: currency };
  if (all.length === 1) return { salary_low: all[0], salary_high: all[0], salary_currency: currency };
  return { salary_low: all[0], salary_high: all[all.length - 1], salary_currency: currency };
}

leadsRouter.post('/:id/convert', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const lead = await c.env.DB
    .prepare('SELECT * FROM job_leads WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .first<{ id: string; title: string; company: string; location: string | null; work_mode: string | null; external_url: string; salary_hint: string | null; notes: string | null }>();
  if (!lead) return c.json({ error: 'not found' }, 404);

  const { salary_low, salary_high, salary_currency } = parseSalaryHint(lead.salary_hint);

  const appId = newId();
  const notes = lead.notes || null;
  await c.env.DB.prepare(
    `INSERT INTO applications
       (id, user_id, company, role, location, work_mode, salary_low, salary_high, salary_currency, status, notes, external_url, last_activity_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Saved', ?, ?, ?)`
  ).bind(appId, user.id, lead.company, lead.title, lead.location, lead.work_mode,
         salary_low, salary_high, salary_currency, notes, lead.external_url, nowIso()).run();

  await c.env.DB
    .prepare("UPDATE job_leads SET state = 'converted', converted_application_id = ? WHERE id = ?")
    .bind(appId, id).run();

  const application = await c.env.DB
    .prepare('SELECT * FROM applications WHERE id = ?').bind(appId).first();
  return c.json({ application }, 201);
});

// On-demand score a single lead
leadsRouter.post('/:id/score', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const result = await scoreSingleLead(c.env.DB, c.env.AI, id, user.id);
  if (!result) return c.json({ error: 'not found' }, 404);
  return c.json(result);
});

// Manual trigger — scoped to the current user, returns per-source counts
leadsRouter.post('/run', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const fetchResults = await runLeadsFetch(db, user.id);
  await scoreLeads(db, c.env.AI);
  const totalInserted = fetchResults.reduce((s, r) => s + r.inserted, 0);
  return c.json({ ok: true, inserted: totalInserted, sources: fetchResults });
});

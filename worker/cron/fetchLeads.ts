import type { D1Database } from '@cloudflare/workers-types';
import { newId, nowIso } from '../util';

interface RawLead {
  title: string;
  company: string;
  external_url: string;
  location: string | null;
  work_mode: string | null;
  salary_hint: string | null;
  description: string | null;
}

async function fetchGreenhouse(slug: string): Promise<RawLead[]> {
  const res = await fetch(`https://boards.greenhouse.io/${slug}/jobs?content=true`);
  if (!res.ok) return [];
  const data = await res.json<{ jobs?: Array<{ title: string; absolute_url: string; location: { name: string }; content: string }> }>();
  return (data.jobs ?? []).map(j => ({
    title: j.title,
    company: slug,
    external_url: j.absolute_url,
    location: j.location?.name ?? null,
    work_mode: null,
    salary_hint: null,
    description: j.content ? j.content.replace(/<[^>]+>/g, ' ').slice(0, 2000) : null,
  }));
}

async function fetchLever(slug: string): Promise<RawLead[]> {
  const res = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`);
  if (!res.ok) return [];
  const data = await res.json<Array<{ text: string; hostedUrl: string; categories: { location: string; commitment?: string }; descriptionPlain: string }>>();
  return (Array.isArray(data) ? data : []).map(j => ({
    title: j.text,
    company: slug,
    external_url: j.hostedUrl,
    location: j.categories?.location ?? null,
    work_mode: j.categories?.commitment ?? null,
    salary_hint: null,
    description: j.descriptionPlain ? j.descriptionPlain.slice(0, 2000) : null,
  }));
}

async function fetchWorkable(slug: string): Promise<RawLead[]> {
  const res = await fetch(`https://${slug}.workable.com/api/v1/jobs`);
  if (!res.ok) return [];
  const data = await res.json<{ jobs?: Array<{ title: string; url: string; location: { city: string; country: string; telecommuting?: boolean }; description?: string }> }>();
  return (data.jobs ?? []).map(j => ({
    title: j.title,
    company: slug,
    external_url: j.url,
    location: [j.location?.city, j.location?.country].filter(Boolean).join(', ') || null,
    work_mode: j.location?.telecommuting ? 'Remote' : null,
    salary_hint: null,
    description: j.description ? j.description.replace(/<[^>]+>/g, ' ').slice(0, 2000) : null,
  }));
}

async function fetchRss(url: string, label: string): Promise<RawLead[]> {
  const res = await fetch(url);
  if (!res.ok) return [];
  const text = await res.text();
  const items: RawLead[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRe.exec(text)) !== null) {
    const block = match[1];
    const title = (/<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(block) ?? /<title>(.*?)<\/title>/.exec(block))?.[1] ?? '';
    const link = (/<link>(.*?)<\/link>/.exec(block) ?? /<guid>(.*?)<\/guid>/.exec(block))?.[1] ?? '';
    const desc = (/<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(block) ?? /<description>(.*?)<\/description>/.exec(block))?.[1] ?? '';
    if (title && link) {
      items.push({
        title,
        company: label,
        external_url: link,
        location: null,
        work_mode: null,
        salary_hint: null,
        description: desc ? desc.replace(/<[^>]+>/g, ' ').slice(0, 2000) : null,
      });
    }
  }
  return items;
}

interface Source {
  id: string;
  user_id: string;
  source_type: string;
  slug: string | null;
  url: string | null;
  label: string;
}

async function fetchForSource(source: Source): Promise<RawLead[]> {
  try {
    switch (source.source_type) {
      case 'greenhouse': return source.slug ? await fetchGreenhouse(source.slug) : [];
      case 'lever':      return source.slug ? await fetchLever(source.slug) : [];
      case 'workable':   return source.slug ? await fetchWorkable(source.slug) : [];
      case 'rss':        return source.url  ? await fetchRss(source.url, source.label) : [];
      default:           return [];
    }
  } catch {
    return [];
  }
}

export interface FetchResult {
  source_id: string;
  label: string;
  fetched: number;
  inserted: number;
  error: string | null;
}

export async function runLeadsFetch(db: D1Database, userId?: string): Promise<FetchResult[]> {
  const query = userId
    ? 'SELECT id, user_id, source_type, slug, url, label FROM lead_sources WHERE active = 1 AND user_id = ?'
    : 'SELECT id, user_id, source_type, slug, url, label FROM lead_sources WHERE active = 1';
  const { results: sources } = userId
    ? await db.prepare(query).bind(userId).all<Source>()
    : await db.prepare(query).all<Source>();

  const results: FetchResult[] = [];

  for (const source of sources) {
    let leads: RawLead[] = [];
    let errorMsg: string | null = null;
    try {
      leads = await fetchForSource(source);
    } catch (e) {
      errorMsg = String(e);
    }

    let inserted = 0;
    if (leads.length > 0) {
      const stmts = leads.map(lead =>
        db.prepare(
          `INSERT OR IGNORE INTO job_leads
           (id, user_id, source_id, external_url, title, company, location, work_mode, salary_hint, description, state, fetched_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`
        ).bind(
          newId(), source.user_id, source.id,
          lead.external_url, lead.title, lead.company,
          lead.location, lead.work_mode, lead.salary_hint,
          lead.description, nowIso()
        )
      );
      for (let i = 0; i < stmts.length; i += 100) {
        const batchResults = await db.batch(stmts.slice(i, i + 100));
        inserted += batchResults.reduce((sum, r) => sum + (r.meta?.changes ?? 0), 0);
      }
    }

    results.push({ source_id: source.id, label: source.label, fetched: leads.length, inserted, error: errorMsg });
  }

  return results;
}

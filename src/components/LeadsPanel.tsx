import { useEffect, useRef, useState } from 'react';
import { buttonClass, inputClass, labelClass, selectClass, textareaClass } from '@ops-forward/keel';
import {
  Check, ChevronDown, ChevronUp, ExternalLink, Link, Loader2, Pencil, PlayCircle, Plus, RefreshCw, Trash2, X
} from 'lucide-react';
import { api } from '../api';
import type { JobLead, LeadCriteria, LeadSource } from '../types';

const WORK_MODES = ['', 'Remote', 'Hybrid', 'Onsite'];

const SOURCE_TYPES = ['greenhouse', 'lever', 'workable', 'rss'] as const;
const SOURCE_LABELS: Record<string, string> = {
  greenhouse: 'Greenhouse',
  lever: 'Lever',
  workable: 'Workable',
  rss: 'RSS feed',
};

function ScoreDot({ score, scoring, onScore }: { score: number | null; scoring?: boolean; onScore?: () => void }) {
  if (scoring) return <span className="rung-score-dot unscored scoring" title="Scoring…"><Loader2 size={10} className="spin" /></span>;
  if (score === null) {
    return (
      <button className="rung-score-dot unscored btn" title="Score now with AI" onClick={onScore}>
        ?
      </button>
    );
  }
  const cls = score >= 7 ? 'high' : score >= 4 ? 'mid' : 'low';
  return <span className={`rung-score-dot ${cls}`} title={`Match score: ${score}/10`}>{score}</span>;
}

// ── Criteria form ──────────────────────────────────────────────────────────────
function CriteriaForm({ onSaved }: { onSaved: () => void }) {
  const [criteria, setCriteria] = useState<Partial<LeadCriteria>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.getCriteria().then(r => {
      if (r.criteria) setCriteria(r.criteria);
      setLoaded(true);
    });
  }, []);

  const set = (patch: Partial<LeadCriteria>) => setCriteria(prev => ({ ...prev, ...patch }));

  const save = async () => {
    setSaving(true);
    try { await api.saveCriteria(criteria); onSaved(); } finally { setSaving(false); }
  };

  if (!loaded) return <div className="rung-leads-loading"><Loader2 size={16} className="spin" /> Loading…</div>;

  return (
    <div className="rung-criteria-form">
      <div className="rung-form-grid">
        <div className="pair">
          <div>
            <label className={labelClass()}>Title keywords</label>
            <input className={inputClass()} placeholder="e.g. engineer, manager"
              value={criteria.title_keywords ?? ''}
              onChange={e => set({ title_keywords: e.target.value })} />
          </div>
          <div>
            <label className={labelClass()}>Location preference</label>
            <input className={inputClass()} placeholder="e.g. San Francisco, Remote"
              value={criteria.location ?? ''}
              onChange={e => set({ location: e.target.value })} />
          </div>
        </div>
        <div className="pair">
          <div>
            <label className={labelClass()}>Preferred work modes</label>
            <input className={inputClass()} placeholder="e.g. Remote, Hybrid"
              value={criteria.work_modes ?? ''}
              onChange={e => set({ work_modes: e.target.value })} />
          </div>
          <div>
            <label className={labelClass()}>Seniority</label>
            <input className={inputClass()} placeholder="e.g. Senior, Staff, Lead"
              value={criteria.seniority ?? ''}
              onChange={e => set({ seniority: e.target.value })} />
          </div>
        </div>
        <div className="pair">
          <div>
            <label className={labelClass()}>Salary min (k)</label>
            <input className={inputClass()} type="number" placeholder="e.g. 120"
              value={criteria.salary_min ?? ''}
              onChange={e => set({ salary_min: e.target.value ? Number(e.target.value) : null })} />
          </div>
          <div>
            <label className={labelClass()}>Salary max (k)</label>
            <input className={inputClass()} type="number" placeholder="e.g. 200"
              value={criteria.salary_max ?? ''}
              onChange={e => set({ salary_max: e.target.value ? Number(e.target.value) : null })} />
          </div>
        </div>
        <div className="pair">
          <div>
            <label className={labelClass()}>Must-include keywords</label>
            <input className={inputClass()} placeholder="e.g. TypeScript, React"
              value={criteria.include_keywords ?? ''}
              onChange={e => set({ include_keywords: e.target.value })} />
          </div>
          <div>
            <label className={labelClass()}>Exclude keywords</label>
            <input className={inputClass()} placeholder="e.g. Java, PHP"
              value={criteria.exclude_keywords ?? ''}
              onChange={e => set({ exclude_keywords: e.target.value })} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className={buttonClass({ variant: 'primary' })} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save criteria'}
        </button>
      </div>
    </div>
  );
}

// ── Popular pre-built feeds ───────────────────────────────────────────────────
const POPULAR_FEEDS: Array<{ label: string; url: string; group: string }> = [
  { group: 'Remote boards', label: 'We Work Remotely – All',        url: 'https://weworkremotely.com/remote-jobs.rss' },
  { group: 'Remote boards', label: 'We Work Remotely – Programming', url: 'https://weworkremotely.com/categories/remote-programming-jobs.rss' },
  { group: 'Remote boards', label: 'We Work Remotely – Design',      url: 'https://weworkremotely.com/categories/remote-design-jobs.rss' },
  { group: 'Remote boards', label: 'We Work Remotely – Product',     url: 'https://weworkremotely.com/categories/remote-product-jobs.rss' },
  { group: 'Remote boards', label: 'We Work Remotely – Marketing',   url: 'https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss' },
  { group: 'Remote boards', label: 'Remotive – All',                 url: 'https://remotive.com/remote-jobs/feed/' },
  { group: 'Remote boards', label: 'Remotive – Engineering',         url: 'https://remotive.com/remote-jobs/feed/?category=software-dev' },
  { group: 'Remote boards', label: 'Remotive – Product',             url: 'https://remotive.com/remote-jobs/feed/?category=product' },
  { group: 'Remote boards', label: 'Remotive – Design',              url: 'https://remotive.com/remote-jobs/feed/?category=design' },
  { group: 'Remote boards', label: 'Remote OK – All',                url: 'https://remoteok.com/remote-jobs.rss' },
  { group: 'Tech & startup', label: 'HN Who\'s Hiring (hnrss)',      url: 'https://hnrss.org/jobs' },
];

// ── Keyword URL builder ───────────────────────────────────────────────────────
function KeywordBuilder({ onAdd }: { onAdd: (label: string, url: string) => Promise<void> }) {
  const [board, setBoard] = useState<'indeed' | 'remotive'>('indeed');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [adding, setAdding] = useState(false);

  const builtUrl = (() => {
    const q = encodeURIComponent(keywords.trim());
    if (!q) return '';
    if (board === 'indeed') {
      const l = encodeURIComponent(location.trim());
      return `https://www.indeed.com/rss?q=${q}${l ? `&l=${l}` : ''}`;
    }
    return `https://remotive.com/remote-jobs/feed/?q=${q}`;
  })();

  const label = (() => {
    const suffix = board === 'indeed'
      ? `Indeed${location.trim() ? ` · ${location.trim()}` : ''}`
      : 'Remotive';
    return keywords.trim() ? `${keywords.trim()} – ${suffix}` : '';
  })();

  const submit = async () => {
    if (!builtUrl || !label) return;
    setAdding(true);
    try { await onAdd(label, builtUrl); setKeywords(''); setLocation(''); } finally { setAdding(false); }
  };

  return (
    <div className="rung-keyword-builder">
      <div className="rung-keyword-builder-row">
        <select className={selectClass()} value={board}
          onChange={e => setBoard(e.target.value as 'indeed' | 'remotive')}>
          <option value="indeed">Indeed</option>
          <option value="remotive">Remotive</option>
        </select>
        <input className={inputClass()} placeholder="Job title / keywords (e.g. product manager)"
          value={keywords} onChange={e => setKeywords(e.target.value)} style={{ flex: 2 }} />
        {board === 'indeed' && (
          <input className={inputClass()} placeholder="Location (e.g. Remote, New York)"
            value={location} onChange={e => setLocation(e.target.value)} style={{ flex: 1 }} />
        )}
        <button className={buttonClass({ variant: 'primary' })} onClick={submit}
          disabled={adding || !builtUrl}>
          <Plus size={14} /> Add feed
        </button>
      </div>
      {builtUrl && (
        <p className="rung-kb-preview">
          <span className="rung-kb-label">{label}</span>
          <a href={builtUrl} target="_blank" rel="noopener noreferrer" className="rung-kb-url">
            <ExternalLink size={11} /> preview
          </a>
        </p>
      )}
    </div>
  );
}

// ── Sources manager ────────────────────────────────────────────────────────────
function SourcesManager() {
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualType, setManualType] = useState<typeof SOURCE_TYPES[number]>('greenhouse');
  const [manualSlug, setManualSlug] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualLabel, setManualLabel] = useState('');
  const [manualAdding, setManualAdding] = useState(false);

  const refresh = () => api.listSources().then(r => setSources(r.sources));
  useEffect(() => { refresh(); }, []);

  const addRss = async (label: string, url: string) => {
    await api.createSource({ source_type: 'rss', url, label });
    await refresh();
  };

  const togglePopular = async (feed: typeof POPULAR_FEEDS[number]) => {
    const existing = sources.find(s => s.url === feed.url);
    setAddingId(feed.url);
    try {
      if (existing) {
        await api.deleteSource(existing.id);
        setSources(prev => prev.filter(s => s.id !== existing.id));
      } else {
        await addRss(feed.label, feed.url);
      }
    } finally { setAddingId(null); }
  };

  const addManual = async () => {
    if (!manualLabel) return;
    setManualAdding(true);
    try {
      await api.createSource({
        source_type: manualType,
        slug: manualSlug || undefined,
        url: manualUrl || undefined,
        label: manualLabel,
      });
      setManualSlug(''); setManualUrl(''); setManualLabel('');
      await refresh();
    } finally { setManualAdding(false); }
  };

  const toggle = async (s: LeadSource) => {
    await api.updateSource(s.id, { active: s.active ? 0 : 1 });
    await refresh();
  };

  const remove = async (id: string) => {
    await api.deleteSource(id);
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const addedUrls = new Set(sources.map(s => s.url).filter(Boolean));
  const needsSlug = manualType !== 'rss';
  const needsUrl = manualType === 'rss';

  // Group popular feeds by category
  const groups = [...new Set(POPULAR_FEEDS.map(f => f.group))];

  return (
    <div className="rung-sources-manager">

      {/* ── Quick-add popular feeds ── */}
      <div className="rung-sources-section-label">Quick-add popular job boards</div>
      {groups.map(group => (
        <div key={group} className="rung-popular-group">
          <div className="rung-popular-group-name">{group}</div>
          <div className="rung-popular-feeds">
            {POPULAR_FEEDS.filter(f => f.group === group).map(feed => {
              const added = addedUrls.has(feed.url);
              const busy = addingId === feed.url;
              return (
                <button key={feed.url}
                  className={`rung-popular-feed${added ? ' added' : ''}`}
                  onClick={() => !busy && togglePopular(feed)}
                  disabled={busy}
                  title={added ? 'Click to remove' : feed.url}>
                  {busy
                    ? <Loader2 size={11} className="spin" />
                    : added ? <X size={11} /> : <Plus size={11} />}
                  {feed.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Keyword builder ── */}
      <div className="rung-sources-section-label" style={{ marginTop: 16 }}>
        Build a feed from keywords
      </div>
      <KeywordBuilder onAdd={addRss} />

      {/* ── Manual add (ATS slugs) ── */}
      <button className="rung-sources-manual-toggle"
        onClick={() => setShowManual(v => !v)}>
        {showManual ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        Add a specific company (Greenhouse / Lever / Workable slug)
      </button>
      {showManual && (
        <div className="rung-source-add">
          <select className={selectClass()} value={manualType}
            onChange={e => setManualType(e.target.value as typeof SOURCE_TYPES[number])}>
            {SOURCE_TYPES.map(t => <option key={t} value={t}>{SOURCE_LABELS[t]}</option>)}
          </select>
          {needsSlug && (
            <input className={inputClass()} placeholder="Company slug (e.g. airbnb)" value={manualSlug}
              onChange={e => setManualSlug(e.target.value)} />
          )}
          {needsUrl && (
            <input className={inputClass()} placeholder="RSS URL" value={manualUrl}
              onChange={e => setManualUrl(e.target.value)} />
          )}
          <input className={inputClass()} placeholder="Display label" value={manualLabel}
            onChange={e => setManualLabel(e.target.value)} />
          <button className={buttonClass({ variant: 'primary' })} onClick={addManual}
            disabled={manualAdding || !manualLabel || (needsSlug && !manualSlug) || (needsUrl && !manualUrl)}>
            <Plus size={14} /> Add
          </button>
        </div>
      )}

      {/* ── Current sources ── */}
      {sources.length > 0 && (
        <>
          <div className="rung-sources-section-label" style={{ marginTop: 16 }}>Your sources</div>
          <div className="rung-sources-list">
            {sources.map(s => (
              <div key={s.id} className="rung-source-row">
                <span className="rung-source-type">{SOURCE_LABELS[s.source_type]}</span>
                <div className="rung-source-info">
                  <span className="rung-source-label">{s.label}</span>
                  {s.slug && <span className="rung-source-detail">slug: {s.slug}</span>}
                  {s.url && <span className="rung-source-detail" title={s.url}>{s.url.length > 55 ? s.url.slice(0, 55) + '…' : s.url}</span>}
                </div>
                <button className={`rung-icon-btn${s.active ? '' : ' off'}`} onClick={() => toggle(s)}
                  title={s.active ? 'Disable' : 'Enable'}>
                  {s.active ? <PlayCircle size={13} /> : <X size={13} />}
                </button>
                <button className="rung-icon-btn danger" onClick={() => remove(s.id)} title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface RunSourceResult { source_id: string; label: string; fetched: number; inserted: number; error: string | null }

// ── Edit form (manual correction of a fetched/clipped lead) ────────────────────
type LeadEditFields = {
  title: string;
  company: string;
  location: string;
  work_mode: string;
  salary_hint: string;
  external_url: string;
  description: string;
};

function leadToEditFields(lead: JobLead): LeadEditFields {
  return {
    title: lead.title,
    company: lead.company,
    location: lead.location ?? '',
    work_mode: lead.work_mode ?? '',
    salary_hint: lead.salary_hint ?? '',
    external_url: lead.external_url,
    description: lead.description ?? '',
  };
}

// ── Clip-from-URL form ────────────────────────────────────────────────────────
type ClipField = { title: string; company: string; location: string; salary_hint: string; external_url: string; };

function ClipForm({ onAdded, onClose }: { onAdded: () => void; onClose: () => void }) {
  const [url, setUrl]           = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeErr, setScrapeErr] = useState('');
  const [fields, setFields]     = useState<ClipField | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState('');
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => { urlRef.current?.focus(); }, []);

  const scrape = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setScraping(true); setScrapeErr(''); setFields(null);
    try {
      const res = await api.scrapeLeadUrl(trimmed);
      setFields({
        title:        res.title       ?? '',
        company:      res.company     ?? '',
        location:     res.location    ?? '',
        salary_hint:  res.salary_hint ?? '',
        external_url: trimmed,
      });
    } catch (e: unknown) {
      setScrapeErr((e as Error).message || 'Could not scrape that URL.');
    } finally { setScraping(false); }
  };

  const save = async () => {
    if (!fields) return;
    if (!fields.title.trim() || !fields.company.trim()) {
      setSaveErr('Title and company are required.'); return;
    }
    setSaving(true); setSaveErr('');
    try {
      await api.clipLead({
        title:        fields.title.trim(),
        company:      fields.company.trim(),
        location:     fields.location.trim()    || undefined,
        salary_hint:  fields.salary_hint.trim() || undefined,
        external_url: fields.external_url.trim() || url.trim(),
        description:  undefined,
      });
      onAdded();
      onClose();
    } catch (e: unknown) {
      setSaveErr((e as Error).message || 'Could not save lead.');
    } finally { setSaving(false); }
  };

  return (
    <div className="rung-clip-form">
      {/* URL row */}
      <div className="rung-clip-url-row">
        <input
          ref={urlRef}
          className={inputClass()}
          placeholder="Paste job posting URL…"
          value={url}
          onChange={e => { setUrl(e.target.value); setFields(null); setScrapeErr(''); }}
          onKeyDown={e => e.key === 'Enter' && scrape()}
        />
        <button className={buttonClass({ variant: 'primary' })} onClick={scrape} disabled={scraping || !url.trim()}>
          {scraping ? <Loader2 size={13} className="spin" /> : <Link size={13} />}
          {scraping ? 'Scraping…' : 'Scrape'}
        </button>
        <button className={buttonClass({ variant: 'ghost' })} onClick={onClose}><X size={14} /></button>
      </div>

      {scrapeErr && <p className="rung-clip-err">{scrapeErr}</p>}

      {/* Editable fields appear after scrape */}
      {fields && (
        <div className="rung-clip-fields">
          <div className="rung-clip-field-row">
            <div className="rung-clip-field">
              <label className={labelClass()}>Job title *</label>
              <input className={inputClass()} value={fields.title}
                onChange={e => setFields(f => f && ({ ...f, title: e.target.value }))} />
            </div>
            <div className="rung-clip-field">
              <label className={labelClass()}>Company *</label>
              <input className={inputClass()} value={fields.company}
                onChange={e => setFields(f => f && ({ ...f, company: e.target.value }))} />
            </div>
          </div>
          <div className="rung-clip-field-row">
            <div className="rung-clip-field">
              <label className={labelClass()}>Location</label>
              <input className={inputClass()} value={fields.location}
                onChange={e => setFields(f => f && ({ ...f, location: e.target.value }))} />
            </div>
            <div className="rung-clip-field">
              <label className={labelClass()}>Salary hint</label>
              <input className={inputClass()} value={fields.salary_hint}
                placeholder="e.g. $120k–$150k"
                onChange={e => setFields(f => f && ({ ...f, salary_hint: e.target.value }))} />
            </div>
          </div>
          {saveErr && <p className="rung-clip-err">{saveErr}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={buttonClass({ variant: 'primary' })} onClick={save} disabled={saving}>
              {saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
              {saving ? 'Adding…' : 'Add to leads'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Leads table ────────────────────────────────────────────────────────────────
function LeadsTable({ onConverted }: { onConverted: () => void }) {
  const [leads, setLeads] = useState<JobLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResults, setRunResults] = useState<RunSourceResult[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scoring, setScoring] = useState<Set<string>>(new Set());
  const [clipOpen, setClipOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<LeadEditFields | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try { setLeads((await api.listLeads('new')).leads); } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  // Refresh when the tab regains focus — covers the case where a lead was
  // added via the browser extension while the user was on another tab.
  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const dismiss = async (id: string) => {
    await api.dismissLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const convert = async (id: string) => {
    await api.convertLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    onConverted();
  };

  const startEdit = (lead: JobLead) => {
    setEditingId(lead.id);
    setEditFields(leadToEditFields(lead));
    setExpanded(lead.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFields(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editFields) return;
    setSavingEdit(true);
    try {
      const { lead } = await api.updateLead(editingId, {
        title: editFields.title.trim(),
        company: editFields.company.trim(),
        location: editFields.location.trim() || null,
        work_mode: editFields.work_mode || null,
        salary_hint: editFields.salary_hint.trim() || null,
        external_url: editFields.external_url.trim(),
        description: editFields.description.trim() || null,
      });
      setLeads(prev => prev.map(l => l.id === editingId ? { ...l, ...lead } : l));
      cancelEdit();
    } finally {
      setSavingEdit(false);
    }
  };

  const scoreNow = async (id: string) => {
    setScoring(prev => new Set(prev).add(id));
    try {
      const result = await api.scoreLead(id);
      setLeads(prev => prev.map(l =>
        l.id === id ? { ...l, score: result.score, score_reason: result.score_reason } : l
      ));
    } finally {
      setScoring(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const run = async () => {
    setRunning(true);
    setRunResults(null);
    try {
      const result = await api.runLeads();
      setRunResults(result.sources);
      await refresh();
    } finally { setRunning(false); }
  };

  const clearAll = async () => {
    setClearing(true);
    try {
      await api.dismissAllLeads();
      await refresh();
    } finally {
      setClearing(false);
      setClearConfirm(false);
    }
  };

  return (
    <div className="rung-leads-table-wrap">
      <div className="rung-leads-toolbar">
        <span className="rung-leads-count">{leads.length} new lead{leads.length !== 1 ? 's' : ''}</span>
        <button className={buttonClass({ variant: 'ghost' })} onClick={() => { setClipOpen(o => !o); setRunResults(null); }} title="Add lead from URL">
          <Link size={14} /> Clip URL
        </button>
        <button className={buttonClass({ variant: 'ghost' })} onClick={run} disabled={running}>
          {running ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
          {running ? 'Fetching…' : 'Fetch now'}
        </button>
        {leads.length > 0 && (
          <button className={buttonClass({ variant: 'ghost' })} onClick={() => setClearConfirm(true)} style={{ color: 'var(--rung-text-muted)' }}>
            Clear all
          </button>
        )}
      </div>

      {clipOpen && (
        <ClipForm
          onAdded={() => { refresh(); setClipOpen(false); }}
          onClose={() => setClipOpen(false)}
        />
      )}

      {runResults && (
        <div className="rung-run-results">
          {runResults.length === 0
            ? <span className="rung-run-none">No active sources — add some in Settings.</span>
            : runResults.map(r => (
              <span key={r.source_id} className={`rung-run-source${r.error ? ' err' : ''}`}>
                <strong>{r.label}</strong>
                {r.error
                  ? <span className="rung-run-err" title={r.error}>⚠ error</span>
                  : <span>{r.fetched} fetched, {r.inserted} new</span>}
              </span>
            ))
          }
        </div>
      )}

      {loading ? (
        <div className="rung-leads-loading"><Loader2 size={16} className="spin" /> Loading leads…</div>
      ) : leads.length === 0 ? (
        <div className="rung-empty">No new leads. Add sources in Settings and click "Fetch now".</div>
      ) : (
        <div className="rung-leads-list">
          {leads.map(lead => (
            <div key={lead.id} className="rung-lead-row">
              <div className="rung-lead-main" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>
                <ScoreDot
                  score={lead.score}
                  scoring={scoring.has(lead.id)}
                  onScore={() => scoreNow(lead.id)}
                />
                <div className="rung-lead-info">
                  <strong>{lead.title}</strong>
                  <span className="rung-lead-meta">
                    {lead.company}
                    {lead.location ? ` · ${lead.location}` : ''}
                    {lead.work_mode ? ` · ${lead.work_mode}` : ''}
                    {lead.salary_hint ? ` · ${lead.salary_hint}` : ''}
                    {lead.source_label ? ` · ${lead.source_label}` : ''}
                  </span>
                </div>
                <div className="rung-lead-actions" onClick={e => e.stopPropagation()}>
                  <a href={lead.external_url} target="_blank" rel="noopener noreferrer"
                    className="rung-icon-btn" title="Open posting">
                    <ExternalLink size={13} />
                  </a>
                  <button className="rung-icon-btn" onClick={() => startEdit(lead)} title="Edit details">
                    <Pencil size={13} />
                  </button>
                  <button className={buttonClass({ variant: 'primary' })} onClick={() => convert(lead.id)}
                    style={{ fontSize: 12, padding: '3px 10px' }}>
                    Add to apps
                  </button>
                  <button className="rung-icon-btn danger" onClick={() => dismiss(lead.id)} title="Dismiss">
                    <X size={13} />
                  </button>
                </div>
                <span className="rung-lead-chevron">
                  {expanded === lead.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </div>
              {expanded === lead.id && (
                <div className="rung-lead-detail">
                  {editingId === lead.id && editFields ? (
                    <div className="rung-clip-fields">
                      <div className="rung-clip-field-row">
                        <div className="rung-clip-field">
                          <label className={labelClass()}>Job title</label>
                          <input className={inputClass()} value={editFields.title}
                            onChange={e => setEditFields(f => f && ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="rung-clip-field">
                          <label className={labelClass()}>Company</label>
                          <input className={inputClass()} value={editFields.company}
                            onChange={e => setEditFields(f => f && ({ ...f, company: e.target.value }))} />
                        </div>
                      </div>
                      <div className="rung-clip-field-row">
                        <div className="rung-clip-field">
                          <label className={labelClass()}>Location</label>
                          <input className={inputClass()} value={editFields.location}
                            onChange={e => setEditFields(f => f && ({ ...f, location: e.target.value }))} />
                        </div>
                        <div className="rung-clip-field">
                          <label className={labelClass()}>Work mode</label>
                          <select className={selectClass()} value={editFields.work_mode}
                            onChange={e => setEditFields(f => f && ({ ...f, work_mode: e.target.value }))}>
                            {WORK_MODES.map(m => <option key={m} value={m}>{m || '—'}</option>)}
                          </select>
                        </div>
                        <div className="rung-clip-field">
                          <label className={labelClass()}>Salary hint</label>
                          <input className={inputClass()} placeholder="e.g. $120k–$150k" value={editFields.salary_hint}
                            onChange={e => setEditFields(f => f && ({ ...f, salary_hint: e.target.value }))} />
                        </div>
                      </div>
                      <div className="rung-clip-field">
                        <label className={labelClass()}>Posting URL</label>
                        <input className={inputClass()} value={editFields.external_url}
                          onChange={e => setEditFields(f => f && ({ ...f, external_url: e.target.value }))} />
                      </div>
                      <div className="rung-clip-field">
                        <label className={labelClass()}>Description</label>
                        <textarea className={textareaClass()} rows={4} value={editFields.description}
                          onChange={e => setEditFields(f => f && ({ ...f, description: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className={buttonClass({ variant: 'primary' })} onClick={saveEdit} disabled={savingEdit}>
                          {savingEdit ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
                          {savingEdit ? 'Saving…' : 'Save'}
                        </button>
                        <button className={buttonClass({ variant: 'ghost' })} onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {lead.score_reason && (
                        <p className="rung-lead-reason"><strong>AI match:</strong> {lead.score_reason}</p>
                      )}
                      {lead.description && (
                        <p className="rung-lead-desc">{lead.description.slice(0, 500)}{lead.description.length > 500 ? '…' : ''}</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {clearConfirm && (
        <div className="rung-modal-backdrop" onClick={() => setClearConfirm(false)}>
          <div className="rung-modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 8 }}>Clear all leads?</h2>
            <p style={{ margin: '0 0 20px', color: 'var(--rung-text-muted)', fontSize: 14 }}>
              This will dismiss all {leads.length} new lead{leads.length !== 1 ? 's' : ''}. They'll move to your Dismissed tab and won't appear in the feed again.
            </p>
            <div className="rung-modal-actions">
              <button className={buttonClass({ variant: 'ghost' })} onClick={() => setClearConfirm(false)} disabled={clearing}>
                Cancel
              </button>
              <button className={buttonClass({ variant: 'danger' })} onClick={clearAll} disabled={clearing}>
                {clearing ? <Loader2 size={14} className="spin" /> : null}
                {clearing ? 'Clearing…' : 'Clear all'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
function LeadsPanelBody({ onApplicationAdded }: { onApplicationAdded: () => void }) {
  const [tab, setTab] = useState<'leads' | 'settings'>('leads');
  const [criteriaMsg, setCriteriaMsg] = useState('');

  return (
    <>
      <div className="rung-leads-tabs">
        <button className={`rung-tab ${tab === 'leads' ? 'active' : ''}`} onClick={() => setTab('leads')}>
          Leads
        </button>
        <button className={`rung-tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
          Settings
        </button>
      </div>

      {tab === 'leads' && (
        <LeadsTable onConverted={onApplicationAdded} />
      )}

      {tab === 'settings' && (
        <div className="rung-leads-settings">
          <h3>Job search criteria</h3>
          <p className="rung-leads-section-hint">
            Workers AI uses these to score each lead 1–10 for fit.
          </p>
          <CriteriaForm onSaved={() => setCriteriaMsg('Criteria saved!')} />
          {criteriaMsg && <p className="rung-leads-saved-msg">{criteriaMsg}</p>}

          <h3 style={{ marginTop: 24 }}>Sources</h3>
          <p className="rung-leads-section-hint">
            Add Greenhouse / Lever / Workable company slugs or RSS URLs. Polled daily at 7 AM UTC.
          </p>
          <SourcesManager />
        </div>
      )}
    </>
  );
}

export function LeadsPanel({
  onApplicationAdded,
  standalone = false,
}: {
  onApplicationAdded: () => void;
  standalone?: boolean;
}) {
  const [open, setOpen] = useState(true);

  if (standalone) {
    return (
      <div className="rung-leads-page">
        <div className="rung-page-heading">
          <h1>Job Leads</h1>
          <p className="rung-page-subheading">Daily job discovery from your sources, scored by AI</p>
        </div>
        <div className="rung-leads-panel rung-leads-panel--standalone">
          <LeadsPanelBody onApplicationAdded={onApplicationAdded} />
        </div>
      </div>
    );
  }

  return (
    <div className="rung-leads-panel">
      <div className="rung-leads-header" onClick={() => setOpen(o => !o)}>
        <div className="rung-leads-title">
          <span className="rung-section-chevron">
            {open ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </span>
          <span>Job Leads</span>
          <span className="rung-leads-subtitle">Daily job discovery from your sources</span>
        </div>
      </div>

      {open && (
        <div className="rung-leads-body">
          <LeadsPanelBody onApplicationAdded={onApplicationAdded} />
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { badgeClass, buttonClass } from '@ops-forward/keel';
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronUp, Plus, Search, Star, Upload, Users } from 'lucide-react';
import { api } from '../api';
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from '../types';
import type { AppContext } from '../App';
import { ApplicationModal } from '../components/ApplicationModal';
import { CsvImportModal } from '../components/CsvImportModal';

const statusVariant: Record<ApplicationStatus, 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'default'> = {
  Approached:            'blue',
  Referred:              'blue',
  Saved:                 'default',
  'Save for later':      'default',
  Applied:               'blue',
  'Recruiter interview': 'purple',
  Phone:                 'purple',
  'HM interview':        'purple',
  Presentation:          'amber',
  '1<>1':               'amber',
  Onsite:                'amber',
  'Final Call':          'amber',
  Offer:                 'green',
  Paused:                'default',
  '3m ghosted':          'red',
  Rejected:              'red',
  Withdrawn:             'default',
  Skip:                  'default',
};

const ACTIVE_STATUSES: ApplicationStatus[] = [
  'Recruiter interview', 'Phone', 'HM interview',
  'Presentation', '1<>1', 'Onsite', 'Final Call', 'Offer',
];
const STALE_STATUSES: ApplicationStatus[] = [
  'Applied', 'Recruiter interview', 'Phone', 'HM interview',
  'Presentation', '1<>1', 'Onsite', 'Final Call',
];
const STALE_DAYS = 7;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function lastTouch(app: Application): string {
  return app.last_activity_at ?? app.applied_at ?? app.created_at;
}

export default function DashboardPage() {
  const ctx = useOutletContext<AppContext>();
  const [apps, setApps] = useState<Application[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [editing, setEditing] = useState<Application | null>(null);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sortKey, setSortKey] = useState<keyof Application | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [appsOpen, setAppsOpen] = useState(true);

  const refresh = () => api.listApplications().then((r) => setApps(r.applications));
  useEffect(() => { refresh(); }, []);

  const kpis = useMemo(() => {
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    return {
      total: apps.length,
      thisWeek: apps.filter(a => a.applied_at && Date.now() - new Date(a.applied_at).getTime() < weekMs).length,
      active: apps.filter(a => ACTIVE_STATUSES.includes(a.status)).length,
      followUp: apps.filter(a => STALE_STATUSES.includes(a.status) && daysSince(lastTouch(a)) >= STALE_DAYS).length,
    };
  }, [apps]);

  const staleApps = useMemo(() =>
    apps
      .filter(a => STALE_STATUSES.includes(a.status) && daysSince(lastTouch(a)) >= STALE_DAYS)
      .sort((a, b) => new Date(lastTouch(a)).getTime() - new Date(lastTouch(b)).getTime())
  , [apps]);

  const cycleSort = (key: keyof Application) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortKey(null); }
  };

  const SortIcon = ({ col }: { col: keyof Application }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} style={{ opacity: 0.35 }} />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = apps.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (!q) return true;
      return [a.company, a.role, a.location, a.industry, a.referral, a.notes]
        .filter(Boolean)
        .some((v) => v!.toString().toLowerCase().includes(q));
    });
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = (a[sortKey] ?? '') as string;
        const bv = (b[sortKey] ?? '') as string;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [apps, query, statusFilter, sortKey, sortDir]);

  const toggleStar = async (app: Application) => {
    const next = app.starred ? 0 : 1;
    setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, starred: next } : a)));
    try {
      await api.updateApplication(app.id, { starred: next });
    } catch {
      refresh();
    }
  };

  return (
    <>
      <div className={`rung-section-header${appsOpen ? ' open' : ''}`} onClick={() => setAppsOpen(o => !o)}>
        <div className="rung-section-header-left">
          <span className="rung-section-chevron">
            {appsOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </span>
          <h1>Applications</h1>
          {!appsOpen && apps.length > 0 && (
            <span className="rung-section-summary">
              {apps.length} total · {kpis.active} in process
              {kpis.followUp > 0 && <span className="warn"> · {kpis.followUp} follow-up</span>}
            </span>
          )}
        </div>
        <div className="rung-section-header-right" onClick={e => e.stopPropagation()}>
          <button className={buttonClass({ variant: 'ghost' })} onClick={() => setImporting(true)}>
            <Upload size={15} /> Import CSV
          </button>
          <button className={buttonClass({ variant: 'primary' })} onClick={() => setCreating(true)}>
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      {appsOpen && (
        <div className="rung-section-body">
          {apps.length > 0 && (
            <div className="rung-kpi-strip">
              <div className="rung-kpi-card">
                <span className="rung-kpi-value">{kpis.total}</span>
                <span className="rung-kpi-label">Total</span>
              </div>
              <div className="rung-kpi-card">
                <span className="rung-kpi-value">{kpis.thisWeek}</span>
                <span className="rung-kpi-label">Applied this week</span>
              </div>
              <div className="rung-kpi-card">
                <span className="rung-kpi-value">{kpis.active}</span>
                <span className="rung-kpi-label">In process</span>
              </div>
              <div className={`rung-kpi-card${kpis.followUp > 0 ? ' warn' : ''}`}>
                <span className="rung-kpi-value">{kpis.followUp}</span>
                <span className="rung-kpi-label">Need follow-up</span>
              </div>
            </div>
          )}

          {staleApps.length > 0 && (
            <div className="rung-followup">
              <div className="rung-followup-header">
                <AlertCircle size={15} />
                <strong>Follow-up needed</strong>
                <span className="rung-followup-note">No activity in {STALE_DAYS}+ days</span>
              </div>
              <div className="rung-followup-list">
                {staleApps.map(app => (
                  <button
                    key={app.id}
                    className="rung-followup-item"
                    onClick={() => setEditing(app)}
                  >
                    <span className="rung-followup-company">{app.company}</span>
                    {app.role && <span className="rung-followup-role">{app.role}</span>}
                    <span className={`rung-followup-badge ${badgeClass({ variant: statusVariant[app.status] })}`}>
                      {app.status}
                    </span>
                    <span className="rung-followup-age">{daysSince(lastTouch(app))}d ago</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rung-toolbar">
            <div className="rung-search">
              <Search size={14} />
              <input
                type="search"
                placeholder="Search company, role, notes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className="rung-icon-btn"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ApplicationStatus)}
              aria-label="Status filter"
            >
              <option value="all">All statuses</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="rung-empty">
              {apps.length === 0
                ? 'No applications yet — add one or import from CSV.'
                : 'No applications match your filters.'}
            </div>
          ) : (
            <>
              <div className="rung-table-wrap">
                <table className="rung-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th title="Linked contacts"><Users size={13} /></th>
                      {([
                        ['company',      'Company'],
                        ['role',         'Role'],
                        ['location',     'Location'],
                        ['industry',     'Industry'],
                        ['resume_label', 'Resume'],
                        ['status',       'Status'],
                        ['applied_at',   'Applied'],
                      ] as [keyof Application, string][]).map(([key, label]) => (
                        <th key={key} className="rung-th-sort" onClick={() => cycleSort(key)}>
                          {label} <SortIcon col={key} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((app) => (
                      <tr key={app.id} onClick={() => setEditing(app)}>
                        <td onClick={(e) => { e.stopPropagation(); toggleStar(app); }}>
                          <button className={`rung-star ${app.starred ? 'on' : ''}`} aria-label="Star">
                            <Star size={16} fill={app.starred ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td style={{ color: app.contact_count > 0 ? 'var(--rung-text-muted)' : 'var(--rung-text-faint)', fontSize: 12 }}>
                          {app.contact_count > 0 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Users size={12} /> {app.contact_count}
                            </span>
                          ) : '—'}
                        </td>
                        <td><strong>{app.company}</strong></td>
                        <td>{app.role || '—'}</td>
                        <td>{app.location || '—'}</td>
                        <td>{app.industry || '—'}</td>
                        <td style={{ maxWidth: 120 }}>
                          {app.resume_label
                            ? <span className="rung-resume-chip" title={app.resume_label}>{app.resume_label}</span>
                            : <span style={{ color: 'var(--rung-text-faint)' }}>—</span>}
                        </td>
                        <td>
                          <span className={badgeClass({ variant: statusVariant[app.status] })}>
                            {app.status}
                          </span>
                        </td>
                        <td>{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rung-cards">
                {filtered.map((app) => (
                  <div className="rung-card" key={app.id} onClick={() => setEditing(app)}>
                    <div className="row">
                      <span className="company">{app.company}</span>
                      <button
                        className={`rung-star ${app.starred ? 'on' : ''}`}
                        aria-label="Star"
                        onClick={(e) => { e.stopPropagation(); toggleStar(app); }}
                      >
                        <Star size={16} fill={app.starred ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="meta">{app.role || '—'} · {app.location || '—'}</div>
                    <div className="row">
                      <span className={badgeClass({ variant: statusVariant[app.status] })}>{app.status}</span>
                      <span className="meta">
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'no date'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {(creating || editing) && (
        <ApplicationModal
          application={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={(msg) => {
            setCreating(false);
            setEditing(null);
            refresh();
            if (msg) ctx.showToast(msg);
          }}
        />
      )}

      {importing && (
        <CsvImportModal
          onClose={() => setImporting(false)}
          onImported={(count) => {
            setImporting(false);
            refresh();
            ctx.showToast(`Imported ${count} application${count === 1 ? '' : 's'}`);
          }}
        />
      )}

    </>
  );
}

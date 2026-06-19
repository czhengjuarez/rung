import { useEffect, useState } from 'react';
import { badgeClass } from '@ops-forward/keel';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { api } from '../api';
import type { AdminFeedback, AdminUser } from '../types';

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature request',
  other: 'Other',
};

const TYPE_VARIANT: Record<string, 'blue' | 'amber' | 'default'> = {
  bug: 'amber',
  feature: 'blue',
  other: 'default',
};

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminListUsers().then(r => setUsers(r.users)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rung-admin-loading"><Loader2 size={16} className="spin" /> Loading users…</div>;

  return (
    <div className="rung-admin-table-wrap">
      <table className="rung-admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Joined</th>
            <th title="Active applications">Apps</th>
            <th title="New job leads">Leads</th>
            <th title="Feedback submitted">Feedback</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <div className="rung-admin-user-cell">
                  {u.avatar_url
                    ? <img className="rung-avatar" src={u.avatar_url} alt="" />
                    : <div className="rung-admin-avatar-placeholder">{u.name[0]}</div>}
                  <span>{u.name}</span>
                </div>
              </td>
              <td className="rung-admin-muted">{u.email}</td>
              <td className="rung-admin-muted">
                {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td className="rung-admin-count">{u.app_count}</td>
              <td className="rung-admin-count">{u.lead_count}</td>
              <td className="rung-admin-count">{u.feedback_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p className="rung-empty">No users yet.</p>}
    </div>
  );
}

function FeedbackTab() {
  const [items, setItems] = useState<AdminFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.adminListFeedback().then(r => setItems(r.feedback)).finally(() => setLoading(false));
  }, []);

  const toggleResolved = async (item: AdminFeedback) => {
    setToggling(prev => new Set(prev).add(item.id));
    try {
      const { feedback } = await api.adminResolveFeedback(item.id, !item.resolved);
      setItems(prev => prev.map(f => f.id === item.id ? { ...f, resolved: feedback.resolved } : f));
    } finally {
      setToggling(prev => { const s = new Set(prev); s.delete(item.id); return s; });
    }
  };

  if (loading) return <div className="rung-admin-loading"><Loader2 size={16} className="spin" /> Loading feedback…</div>;

  const open = items.filter(f => !f.resolved);
  const resolved = items.filter(f => f.resolved);

  return (
    <div className="rung-admin-feedback-list">
      {items.length === 0 && <p className="rung-empty">No feedback submitted yet.</p>}

      {open.length > 0 && (
        <div className="rung-admin-feedback-group">
          <div className="rung-admin-feedback-group-label">Open ({open.length})</div>
          {open.map(f => <FeedbackCard key={f.id} item={f} toggling={toggling.has(f.id)} onToggle={toggleResolved} />)}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="rung-admin-feedback-group">
          <div className="rung-admin-feedback-group-label rung-admin-muted">Resolved ({resolved.length})</div>
          {resolved.map(f => <FeedbackCard key={f.id} item={f} toggling={toggling.has(f.id)} onToggle={toggleResolved} />)}
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ item, toggling, onToggle }: { item: AdminFeedback; toggling: boolean; onToggle: (f: AdminFeedback) => void }) {
  return (
    <div className={`rung-admin-feedback-card${item.resolved ? ' resolved' : ''}`}>
      <div className="rung-admin-feedback-header">
        <div className="rung-admin-feedback-meta">
          {item.user_avatar
            ? <img className="rung-avatar" src={item.user_avatar} alt="" />
            : <div className="rung-admin-avatar-placeholder">{item.user_name[0]}</div>}
          <span className="rung-admin-feedback-name">{item.user_name}</span>
          <span className="rung-admin-muted">{item.user_email}</span>
          <span className="rung-admin-dot">·</span>
          <span className={badgeClass({ variant: TYPE_VARIANT[item.type] ?? 'default' })}>
            {TYPE_LABELS[item.type] ?? item.type}
          </span>
          <span className="rung-admin-dot">·</span>
          <span className="rung-admin-muted">
            {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <button
          className={`rung-admin-resolve-btn${item.resolved ? ' resolved' : ''}`}
          onClick={() => onToggle(item)}
          disabled={toggling}
          title={item.resolved ? 'Mark open' : 'Mark resolved'}
        >
          {toggling
            ? <Loader2 size={15} className="spin" />
            : item.resolved ? <CheckCircle size={15} /> : <Circle size={15} />}
          {item.resolved ? 'Resolved' : 'Resolve'}
        </button>
      </div>
      <p className="rung-admin-feedback-message">{item.message}</p>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<'users' | 'feedback'>('feedback');

  return (
    <div className="rung-admin-page">
      <div className="rung-page-heading">
        <h1>Admin</h1>
        <p className="rung-page-subheading">Users and feedback</p>
      </div>

      <div className="rung-leads-tabs">
        <button className={`rung-tab${tab === 'feedback' ? ' active' : ''}`} onClick={() => setTab('feedback')}>
          Feedback
        </button>
        <button className={`rung-tab${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')}>
          Users
        </button>
      </div>

      {tab === 'users' ? <UsersTab /> : <FeedbackTab />}
    </div>
  );
}

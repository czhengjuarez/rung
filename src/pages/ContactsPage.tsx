import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { buttonClass } from '@ops-forward/keel';
import { ExternalLink, Mail, Plus, Search } from 'lucide-react';
import { api } from '../api';
import type { Contact } from '../types';
import type { AppContext } from '../App';
import { ContactModal } from '../components/ContactModal';

function daysSince(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export default function ContactsPage() {
  const ctx = useOutletContext<AppContext>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Contact | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = () => api.listContacts().then(r => setContacts(r.contacts));
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c =>
      [c.name, c.company, c.role, c.email].filter(Boolean).some(v => v!.toLowerCase().includes(q))
    );
  }, [contacts, query]);

  return (
    <>
      <div className="rung-page-title">
        <h1>Contacts</h1>
        <button className={buttonClass({ variant: 'primary' })} onClick={() => setCreating(true)}>
          <Plus size={16} /> New contact
        </button>
      </div>

      <div className="rung-toolbar">
        <div className="rung-search">
          <Search size={14} />
          <input
            type="search"
            placeholder="Search name, company, role…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rung-empty">
          {contacts.length === 0
            ? "No contacts yet. Add recruiters and hiring managers you've spoken with."
            : 'No contacts match your search.'}
        </div>
      ) : (
        <>
          <div className="rung-table-wrap">
            <table className="rung-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Title</th>
                  <th>Email</th>
                  <th>LinkedIn</th>
                  <th>Apps</th>
                  <th>Last touch</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => setEditing(c)}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.company || '—'}</td>
                    <td>{c.role || '—'}</td>
                    <td>
                      {c.email
                        ? <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()}
                             style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Mail size={12} /> {c.email}
                          </a>
                        : '—'}
                    </td>
                    <td>
                      {c.linkedin
                        ? <a href={c.linkedin} target="_blank" rel="noopener noreferrer"
                             onClick={e => e.stopPropagation()}
                             className="rung-icon-btn" style={{ border: 0, padding: '2px 4px' }}>
                            <ExternalLink size={13} />
                          </a>
                        : '—'}
                    </td>
                    <td>{c.app_count > 0 ? c.app_count : '—'}</td>
                    <td style={{ color: 'var(--rung-text-muted)' }}>{daysSince(c.last_touch_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rung-cards">
            {filtered.map(c => (
              <div key={c.id} className="rung-card" onClick={() => setEditing(c)}>
                <div className="row">
                  <span className="company">{c.name}</span>
                  <span className="meta">{daysSince(c.last_touch_at)}</span>
                </div>
                <div className="meta">
                  {[c.role, c.company].filter(Boolean).join(' · ') || '—'}
                </div>
                {c.email && (
                  <div className="meta">
                    <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()}>{c.email}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {(creating || editing) && (
        <ContactModal
          contact={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={msg => {
            setCreating(false);
            setEditing(null);
            refresh();
            if (msg) ctx.showToast(msg);
          }}
        />
      )}
    </>
  );
}

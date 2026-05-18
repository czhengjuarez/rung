import { FormEvent, useEffect, useState } from 'react';
import { badgeClass, buttonClass, inputClass, labelClass, textareaClass } from '@ops-forward/keel';
import { ExternalLink, Trash2 } from 'lucide-react';
import { api } from '../api';
import type { Contact } from '../types';

interface Props {
  contact: Contact | null;
  onClose: () => void;
  onSaved: (msg?: string) => void;
}

interface State {
  name: string;
  company: string;
  role: string;
  email: string;
  linkedin: string;
  notes: string;
}

function toState(c: Contact | null): State {
  return {
    name: c?.name ?? '',
    company: c?.company ?? '',
    role: c?.role ?? '',
    email: c?.email ?? '',
    linkedin: c?.linkedin ?? '',
    notes: c?.notes ?? '',
  };
}

export function ContactModal({ contact, onClose, onSaved }: Props) {
  const [s, setS] = useState<State>(toState(contact));
  const [linkedApps, setLinkedApps] = useState<Array<{ id: string; company: string; role: string | null; status: string; relationship: string }>>([]);
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<State>) => setS(prev => ({ ...prev, ...patch }));

  useEffect(() => {
    if (contact) {
      api.getContactApplications(contact.id).then(r => setLinkedApps(r.applications));
    }
  }, [contact]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: s.name,
        company: s.company || null,
        role: s.role || null,
        email: s.email || null,
        linkedin: s.linkedin || null,
        notes: s.notes || null,
      };
      if (contact) {
        await api.updateContact(contact.id, body);
        onSaved('Contact updated');
      } else {
        await api.createContact(body);
        onSaved('Contact added');
      }
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!contact) return;
    if (!confirm(`Delete ${contact.name}? This will also remove all application links.`)) return;
    await api.deleteContact(contact.id);
    onSaved('Contact deleted');
  };

  return (
    <div className="rung-modal-backdrop" onClick={onClose}>
      <form className="rung-modal" onClick={e => e.stopPropagation()} onSubmit={onSubmit}>
        <h2>{contact ? 'Edit contact' : 'New contact'}</h2>
        <div className="rung-form-grid">
          <div className="pair">
            <div>
              <label className={labelClass()} htmlFor="ct-name">Name</label>
              <input id="ct-name" className={inputClass()} required
                     value={s.name} onChange={e => update({ name: e.target.value })} />
            </div>
            <div>
              <label className={labelClass()} htmlFor="ct-role">Their title</label>
              <input id="ct-role" className={inputClass()} placeholder="e.g. Recruiter, HM"
                     value={s.role} onChange={e => update({ role: e.target.value })} />
            </div>
          </div>
          <div className="pair">
            <div>
              <label className={labelClass()} htmlFor="ct-company">Company</label>
              <input id="ct-company" className={inputClass()}
                     value={s.company} onChange={e => update({ company: e.target.value })} />
            </div>
            <div>
              <label className={labelClass()} htmlFor="ct-email">Email</label>
              <input id="ct-email" className={inputClass()} type="email"
                     value={s.email} onChange={e => update({ email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass()} htmlFor="ct-linkedin">LinkedIn URL</label>
            <input id="ct-linkedin" className={inputClass()} type="url" placeholder="https://linkedin.com/in/…"
                   value={s.linkedin} onChange={e => update({ linkedin: e.target.value })} />
          </div>
          <div>
            <label className={labelClass()} htmlFor="ct-notes">Notes</label>
            <textarea id="ct-notes" className={textareaClass()} rows={3}
                      value={s.notes} onChange={e => update({ notes: e.target.value })} />
          </div>

          {linkedApps.length > 0 && (
            <div>
              <label className={labelClass()}>Linked applications</label>
              <div className="rung-contact-apps">
                {linkedApps.map(a => (
                  <div key={a.id} className="rung-contact-app-row">
                    <span className="rung-contact-app-company">{a.company}</span>
                    <span className="rung-contact-app-role">{a.role || '—'}</span>
                    <span className={badgeClass({ variant: ({ Recruiter: 'blue', 'Hiring Manager': 'purple', Interviewer: 'amber', Referral: 'green' } as Record<string, 'blue'|'purple'|'amber'|'green'>)[a.relationship] ?? 'default' })}>
                      {a.relationship}
                    </span>
                    <span className={badgeClass({ variant: 'default' })}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rung-modal-actions">
          {contact && (
            <button type="button" className={buttonClass({ variant: 'ghost' })} onClick={onDelete}
                    style={{ marginRight: 'auto', color: '#C0392B' }}>
              <Trash2 size={14} /> Delete
            </button>
          )}
          {contact?.linkedin && (
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer"
               className={buttonClass({ variant: 'ghost' })}
               style={{ textDecoration: 'none' }}>
              <ExternalLink size={14} /> LinkedIn
            </a>
          )}
          <button type="button" className={buttonClass({ variant: 'ghost' })} onClick={onClose}>Cancel</button>
          <button type="submit" className={buttonClass({ variant: 'primary' })} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

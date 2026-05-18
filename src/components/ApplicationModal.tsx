import { FormEvent, useEffect, useState } from 'react';
import { badgeClass, buttonClass, inputClass, labelClass, selectClass, textareaClass } from '@ops-forward/keel';
import { ExternalLink, Trash2, UserMinus, UserPlus } from 'lucide-react';
import { api } from '../api';
import { APPLICATION_STATUSES, type Application, type ApplicationStatus, type Contact, type ContactLink } from '../types';

const COMPANY_SIZES = ['', '1-10', '11-50', '51-200', '201-500', '501-2000', '2000+'];
const WORK_MODES = ['', 'Remote', 'Hybrid', 'Onsite'];
const RELATIONSHIPS = ['Recruiter', 'Hiring Manager', 'Interviewer', 'Referral', 'Other'];

const relationshipVariant: Record<string, 'blue' | 'purple' | 'amber' | 'green' | 'default'> = {
  Recruiter: 'blue',
  'Hiring Manager': 'purple',
  Interviewer: 'amber',
  Referral: 'green',
  Other: 'default',
};

interface State {
  company: string;
  role: string;
  location: string;
  work_mode: string;
  size: string;
  industry: string;
  status: ApplicationStatus;
  referral: string;
  salary_low: string;
  salary_high: string;
  applied_at: string;
  notes: string;
}

function toState(a: Application | null): State {
  return {
    company: a?.company ?? '',
    role: a?.role ?? '',
    location: a?.location ?? '',
    work_mode: a?.work_mode ?? '',
    size: a?.size ?? '',
    industry: a?.industry ?? '',
    status: a?.status ?? 'Saved',
    referral: a?.referral ?? '',
    salary_low: a?.salary_low?.toString() ?? '',
    salary_high: a?.salary_high?.toString() ?? '',
    applied_at: a?.applied_at ? a.applied_at.slice(0, 10) : '',
    notes: a?.notes ?? ''
  };
}

export function ApplicationModal({
  application,
  onClose,
  onSaved
}: {
  application: Application | null;
  onClose: () => void;
  onSaved: (toastMessage?: string) => void;
}) {
  const [s, setS] = useState<State>(toState(application));
  const [saving, setSaving] = useState(false);
  const [linkedContacts, setLinkedContacts] = useState<ContactLink[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [addContactId, setAddContactId] = useState('');
  const [addRelationship, setAddRelationship] = useState('Recruiter');
  const [linkBusy, setLinkBusy] = useState(false);

  const update = (patch: Partial<State>) => setS((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (application) {
      api.listAppContacts(application.id).then(r => setLinkedContacts(r.contacts));
      api.listContacts().then(r => setAllContacts(r.contacts));
    }
  }, [application]);

  const availableContacts = allContacts.filter(c => !linkedContacts.some(l => l.id === c.id));

  const linkContact = async () => {
    if (!application || !addContactId) return;
    setLinkBusy(true);
    try {
      await api.linkContact(application.id, addContactId, addRelationship);
      const r = await api.listAppContacts(application.id);
      setLinkedContacts(r.contacts);
      setAddContactId('');
    } finally {
      setLinkBusy(false);
    }
  };

  const unlinkContact = async (contactId: string) => {
    if (!application) return;
    await api.unlinkContact(application.id, contactId);
    setLinkedContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Partial<Application> = {
        company: s.company,
        role: s.role || null,
        location: s.location || null,
        work_mode: s.work_mode || null,
        size: s.size || null,
        industry: s.industry || null,
        status: s.status,
        referral: s.referral || null,
        salary_low: s.salary_low ? Number(s.salary_low) : null,
        salary_high: s.salary_high ? Number(s.salary_high) : null,
        applied_at: s.applied_at || null,
        notes: s.notes || null
      };
      if (application) {
        await api.updateApplication(application.id, body);
        onSaved('Updated');
      } else {
        await api.createApplication(body);
        onSaved('Added');
      }
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!application) return;
    if (!confirm(`Delete application at ${application.company}?`)) return;
    await api.deleteApplication(application.id);
    onSaved('Deleted');
  };

  return (
    <div className="rung-modal-backdrop" onClick={onClose}>
      <form className="rung-modal" onClick={(e) => e.stopPropagation()} onSubmit={onSubmit}>
        <h2>{application ? 'Edit application' : 'New application'}</h2>
        <div className="rung-form-grid">
          <div className="pair">
            <div>
              <label className={labelClass()} htmlFor="company">Company</label>
              <input id="company" className={inputClass()} required value={s.company}
                     onChange={(e) => update({ company: e.target.value })} />
            </div>
            <div>
              <label className={labelClass()} htmlFor="role">Role</label>
              <input id="role" className={inputClass()} value={s.role}
                     onChange={(e) => update({ role: e.target.value })} />
            </div>
          </div>
          <div className="pair">
            <div>
              <label className={labelClass()} htmlFor="location">Location</label>
              <input id="location" className={inputClass()} value={s.location}
                     onChange={(e) => update({ location: e.target.value })} />
            </div>
            <div>
              <label className={labelClass()} htmlFor="work_mode">Work mode</label>
              <select id="work_mode" className={selectClass()} value={s.work_mode}
                      onChange={(e) => update({ work_mode: e.target.value })}>
                {WORK_MODES.map((m) => <option key={m} value={m}>{m || '—'}</option>)}
              </select>
            </div>
          </div>
          <div className="pair">
            <div>
              <label className={labelClass()} htmlFor="industry">Industry</label>
              <input id="industry" className={inputClass()} value={s.industry}
                     onChange={(e) => update({ industry: e.target.value })} />
            </div>
            <div>
              <label className={labelClass()} htmlFor="size">Company size</label>
              <select id="size" className={selectClass()} value={s.size}
                      onChange={(e) => update({ size: e.target.value })}>
                {COMPANY_SIZES.map((m) => <option key={m} value={m}>{m || '—'}</option>)}
              </select>
            </div>
          </div>
          <div className="pair">
            <div>
              <label className={labelClass()} htmlFor="status">Status</label>
              <select id="status" className={selectClass()} value={s.status}
                      onChange={(e) => update({ status: e.target.value as ApplicationStatus })}>
                {APPLICATION_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass()} htmlFor="applied_at">Applied date</label>
              <input id="applied_at" className={inputClass()} type="date" value={s.applied_at}
                     onChange={(e) => update({ applied_at: e.target.value })} />
            </div>
          </div>
          <div className="pair">
            <div>
              <label className={labelClass()} htmlFor="referral">Referral</label>
              <input id="referral" className={inputClass()} value={s.referral}
                     onChange={(e) => update({ referral: e.target.value })} />
            </div>
            <div>
              <label className={labelClass()}>Salary range (k)</label>
              <div className="pair">
                <input className={inputClass()} type="number" placeholder="Low" value={s.salary_low}
                       onChange={(e) => update({ salary_low: e.target.value })} />
                <input className={inputClass()} type="number" placeholder="High" value={s.salary_high}
                       onChange={(e) => update({ salary_high: e.target.value })} />
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass()} htmlFor="notes">Notes</label>
            <textarea id="notes" className={textareaClass()} rows={4} value={s.notes}
                      onChange={(e) => update({ notes: e.target.value })} />
          </div>

          {application && (
            <div>
              <label className={labelClass()}>Contacts</label>

              {linkedContacts.length > 0 && (
                <div className="rung-linked-contacts">
                  {linkedContacts.map(c => (
                    <div key={c.id} className="rung-linked-contact-row">
                      <div className="rung-linked-contact-info">
                        <strong>{c.name}</strong>
                        {(c.role || c.company) && (
                          <span>{[c.role, c.company].filter(Boolean).join(' · ')}</span>
                        )}
                      </div>
                      <span className={badgeClass({ variant: relationshipVariant[c.relationship] ?? 'default' })}>
                        {c.relationship}
                      </span>
                      {c.linkedin && (
                        <a href={c.linkedin} target="_blank" rel="noopener noreferrer"
                           className="rung-icon-btn" style={{ border: 0, padding: '4px 6px' }}
                           onClick={e => e.stopPropagation()} title="LinkedIn">
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button type="button" className="rung-icon-btn danger"
                              onClick={() => unlinkContact(c.id)} aria-label="Remove">
                        <UserMinus size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {allContacts.length === 0 ? (
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--rung-text-muted)' }}>
                  No contacts yet — add people on the Contacts page first.
                </p>
              ) : availableContacts.length > 0 ? (
                <div className="rung-link-contact-add">
                  <select className={selectClass()} value={addContactId}
                          onChange={e => setAddContactId(e.target.value)}>
                    <option value="">Select a contact…</option>
                    {availableContacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}{c.company ? ` · ${c.company}` : ''}
                      </option>
                    ))}
                  </select>
                  <select className={selectClass()} value={addRelationship}
                          onChange={e => setAddRelationship(e.target.value)}>
                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button type="button" className={buttonClass({ variant: 'primary' })}
                          disabled={!addContactId || linkBusy} onClick={linkContact}>
                    <UserPlus size={14} /> Link
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="rung-modal-actions">
          {application && (
            <button type="button" className={buttonClass({ variant: 'ghost' })} onClick={onDelete}
                    style={{ marginRight: 'auto', color: '#C0392B' }}>
              <Trash2 size={14} /> Delete
            </button>
          )}
          <button type="button" className={buttonClass({ variant: 'ghost' })} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={buttonClass({ variant: 'primary' })} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

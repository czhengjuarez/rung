import { useEffect, useRef, useState } from 'react';
import { buttonClass, inputClass, labelClass, textareaClass } from '@ops-forward/keel';
import { ChevronDown, ChevronRight, Download, FileText, Plus, Sparkles, Trash2 } from 'lucide-react';
import { api } from '../api';
import type { Resume, TailoredResume } from '../types';

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: (r: Resume) => void }) {
  const [label, setLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async () => {
    if (!file || !label.trim()) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('label', label.trim());
      if (resumeText.trim()) fd.append('resume_text', resumeText.trim());
      const r = await api.uploadResume(fd);
      onUploaded(r.resume);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rung-modal-backdrop" onClick={onClose}>
      <div className="rung-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <h2>Upload resume</h2>

        <div className="rung-form-grid" style={{ marginTop: 12 }}>
          <div>
            <label className={labelClass()}>Label</label>
            <input className={inputClass()} placeholder="e.g. PM resume v2, IC track, General"
              value={label} onChange={e => setLabel(e.target.value)} />
          </div>

          <div>
            <label className={labelClass()}>File <span style={{ color: 'var(--rung-text-faint)', fontWeight: 400 }}>(PDF, DOCX, TXT · max 10 MB)</span></label>
            <div className="rung-file-drop" onClick={() => fileRef.current?.click()}>
              {file
                ? <><FileText size={15} /> {file.name} <span style={{ color: 'var(--rung-text-muted)' }}>({fmt(file.size)})</span></>
                : <><Plus size={15} /> Choose file…</>}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }}
              onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </div>

          <div>
            <label className={labelClass()}>
              Resume text <span style={{ color: 'var(--rung-text-faint)', fontWeight: 400 }}>(paste for AI tailoring — optional)</span>
            </label>
            <textarea className={textareaClass()} rows={7}
              placeholder="Paste your resume text here to enable AI tailoring later. You can also add it later by editing the resume."
              value={resumeText} onChange={e => setResumeText(e.target.value)} />
          </div>
        </div>

        {error && <p style={{ color: 'var(--of-fg-danger)', fontSize: 13, marginTop: 8 }}>{error}</p>}

        <div className="rung-modal-actions">
          <button className={buttonClass({ variant: 'ghost' })} onClick={onClose}>Cancel</button>
          <button className={buttonClass({ variant: 'primary' })} onClick={upload}
            disabled={uploading || !file || !label.trim()}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Text Modal ───────────────────────────────────────────────────────────
function EditTextModal({
  resume,
  onClose,
  onSaved,
}: { resume: Resume; onClose: () => void; onSaved: () => void }) {
  const [label, setLabel] = useState(resume.label);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // The list view doesn't return text; fetch from the tailored endpoint or just let user paste
    setLoading(false);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.updateResume(resume.id, { label: label.trim() || resume.label, resume_text: text || undefined });
      onSaved();
    } finally { setSaving(false); }
  };

  if (loading) return null;

  return (
    <div className="rung-modal-backdrop" onClick={onClose}>
      <div className="rung-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <h2>Edit resume</h2>

        <div className="rung-form-grid" style={{ marginTop: 12 }}>
          <div>
            <label className={labelClass()}>Label</label>
            <input className={inputClass()} value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div>
            <label className={labelClass()}>
              Resume text <span style={{ color: 'var(--rung-text-faint)', fontWeight: 400 }}>(paste or update for AI tailoring)</span>
            </label>
            <textarea className={textareaClass()} rows={10}
              placeholder={resume.has_text ? 'This resume already has text. Paste new text to replace it.' : 'Paste your resume text here…'}
              value={text} onChange={e => setText(e.target.value)} />
            {resume.has_text && !text && (
              <p style={{ fontSize: 12, color: 'var(--rung-text-muted)', marginTop: 4 }}>
                This resume already has text stored. Leave blank to keep it unchanged.
              </p>
            )}
          </div>
        </div>

        <div className="rung-modal-actions">
          <button className={buttonClass({ variant: 'ghost' })} onClick={onClose}>Cancel</button>
          <button className={buttonClass({ variant: 'primary' })} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Usage meter ───────────────────────────────────────────────────────────────
function UsageMeter({ used, limit }: { used: number; limit: number }) {
  const remaining = limit - used;
  const pct = Math.min(used / limit, 1);
  const color = pct >= 1 ? 'var(--of-fg-danger)' : pct >= 0.7 ? 'var(--of-fg-warning)' : 'var(--of-fg-brand)';
  return (
    <div className="rung-tailor-usage">
      <div className="rung-tailor-usage-bar">
        <div className="rung-tailor-usage-fill" style={{ width: `${pct * 100}%`, background: color }} />
      </div>
      <span style={{ color, fontWeight: 600 }}>{used}/{limit}</span>
      <span style={{ color: 'var(--rung-text-muted)' }}>
        {remaining > 0 ? `${remaining} tailoring credit${remaining === 1 ? '' : 's'} left today` : 'Daily limit reached — resets in 24 hours'}
      </span>
    </div>
  );
}

// ── Tailor Modal ──────────────────────────────────────────────────────────────
function TailorModal({
  resume,
  usage,
  onClose,
  onTailored,
}: {
  resume: Resume;
  usage: { used: number; limit: number };
  onClose: () => void;
  onTailored: () => void;
}) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [tailoring, setTailoring] = useState(false);
  const [result, setResult] = useState<TailoredResume | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const atLimit = usage.used >= usage.limit;

  const tailor = async () => {
    if (!jobDesc.trim()) return;
    setTailoring(true);
    setError('');
    try {
      const r = await api.tailorResume(resume.id, {
        job_description: jobDesc,
        job_title: jobTitle || undefined,
        company: company || undefined,
      });
      setResult({ id: r.id, source_resume_id: resume.id, job_title: jobTitle || null, company: company || null, tailored_text: r.tailored_text, created_at: new Date().toISOString() });
      onTailored();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Tailoring failed');
    } finally { setTailoring(false); }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.tailored_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rung-modal-backdrop" onClick={onClose}>
      <div className="rung-modal rung-tailor-modal" onClick={e => e.stopPropagation()}>
        <div className="rung-tailor-header">
          <h2><Sparkles size={16} /> AI Tailor</h2>
          <p style={{ color: 'var(--rung-text-muted)', fontSize: 13, margin: 0 }}>
            Paste a job description and AI will rewrite your bullet points to match, without fabricating experience.
          </p>
          <UsageMeter used={usage.used} limit={usage.limit} />
          {!resume.has_text && (
            <div className="rung-tailor-warn">
              This resume has no stored text. Edit the resume and paste your resume text first.
            </div>
          )}
          {atLimit && (
            <div className="rung-tailor-warn" style={{ background: 'var(--of-bg-danger-tint)', color: 'var(--of-fg-danger)' }}>
              You've used all {usage.limit} tailoring credits for today. Come back in 24 hours.
            </div>
          )}
        </div>

        {resume.has_text && !atLimit && !result && (
          <div className="rung-tailor-form">
            <div className="rung-tailor-row">
              <div>
                <label className={labelClass()}>Job title</label>
                <input className={inputClass()} placeholder="e.g. Senior Product Manager"
                  value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
              </div>
              <div>
                <label className={labelClass()}>Company</label>
                <input className={inputClass()} placeholder="e.g. Stripe"
                  value={company} onChange={e => setCompany(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass()}>Job description</label>
              <textarea className={textareaClass()} rows={10}
                placeholder="Paste the full job description here…"
                value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
            </div>
            {error && <p style={{ color: 'var(--of-fg-danger)', fontSize: 13 }}>{error}</p>}
            <div className="rung-modal-actions" style={{ marginTop: 0 }}>
              <button className={buttonClass({ variant: 'ghost' })} onClick={onClose}>Cancel</button>
              <button className={buttonClass({ variant: 'primary' })} onClick={tailor}
                disabled={tailoring || !jobDesc.trim()}>
                {tailoring ? 'Tailoring… (this may take 15–30s)' : <><Sparkles size={14} /> Tailor resume</>}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="rung-tailor-result">
            <div className="rung-tailor-result-header">
              <span>Tailored result</span>
              <button className={buttonClass({ variant: 'ghost' })} onClick={copy}>
                {copied ? 'Copied!' : 'Copy text'}
              </button>
            </div>
            <pre className="rung-tailor-pre">{result.tailored_text}</pre>
            <div className="rung-modal-actions">
              <button className={buttonClass({ variant: 'ghost' })} onClick={() => { setResult(null); setJobDesc(''); }}>
                Try again
              </button>
              <button className={buttonClass({ variant: 'primary' })} onClick={onClose}>Done</button>
            </div>
          </div>
        )}

        {(!resume.has_text || atLimit) && !result && (
          <div className="rung-modal-actions">
            <button className={buttonClass({ variant: 'ghost' })} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Resume Card ───────────────────────────────────────────────────────────────
function ResumeCard({
  resume,
  usage,
  onDeleted,
  onUpdated,
  onTailored,
}: {
  resume: Resume;
  usage: { used: number; limit: number };
  onDeleted: (id: string) => void;
  onUpdated: () => void;
  onTailored: () => void;
}) {
  const [tailored, setTailored] = useState<TailoredResume[]>([]);
  const [tailoredOpen, setTailoredOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [loadingTailored, setLoadingTailored] = useState(false);
  const atLimit = usage.used >= usage.limit;

  const loadTailored = async () => {
    if (tailoredOpen) { setTailoredOpen(false); return; }
    setLoadingTailored(true);
    try {
      const r = await api.listTailoredResumes(resume.id);
      setTailored(r.tailored);
      setTailoredOpen(true);
    } finally { setLoadingTailored(false); }
  };

  const del = async () => {
    if (!confirm(`Delete "${resume.label}"? This cannot be undone.`)) return;
    await api.deleteResume(resume.id);
    onDeleted(resume.id);
  };

  return (
    <>
      <div className="rung-resume-card">
        <div className="rung-resume-icon">
          <FileText size={20} />
        </div>
        <div className="rung-resume-info">
          <div className="rung-resume-label">{resume.label}</div>
          <div className="rung-resume-meta">
            {resume.filename} · {fmt(resume.size)} · {fmtDate(resume.updated_at)}
            {resume.has_text ? (
              <span className="rung-resume-badge ai">AI ready</span>
            ) : (
              <span className="rung-resume-badge">No text</span>
            )}
          </div>
        </div>
        <div className="rung-resume-actions">
          <button className="rung-icon-btn" title="Download"
            onClick={() => window.open(api.downloadResumeUrl(resume.id), '_blank')}>
            <Download size={14} />
          </button>
          <button
            className={`rung-resume-tailor-btn${resume.has_text && !atLimit ? '' : ' dim'}`}
            title={
              !resume.has_text ? 'Add resume text to enable AI tailoring'
              : atLimit ? `Daily limit of ${usage.limit} reached — resets in 24 hours`
              : 'AI Tailor'
            }
            onClick={() => setTailoring(true)}>
            <Sparkles size={13} /> Tailor
          </button>
          <button className="rung-icon-btn" title="Edit label / text"
            onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="rung-icon-btn danger" title="Delete" onClick={del}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {tailored.length > 0 || tailoredOpen ? (
        <div className="rung-resume-tailored-section">
          <button className="rung-resume-tailored-toggle" onClick={loadTailored} disabled={loadingTailored}>
            {tailoredOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            {tailored.length} tailored version{tailored.length !== 1 ? 's' : ''}
          </button>
          {tailoredOpen && (
            <div className="rung-resume-tailored-list">
              {tailored.map(t => (
                <div key={t.id} className="rung-resume-tailored-item">
                  <span>{t.job_title || 'Tailored'}{t.company ? ` @ ${t.company}` : ''}</span>
                  <span style={{ color: 'var(--rung-text-muted)', fontSize: 12 }}>{fmtDate(t.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {editing && (
        <EditTextModal
          resume={resume}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); onUpdated(); }}
        />
      )}

      {tailoring && (
        <TailorModal
          resume={resume}
          usage={usage}
          onClose={() => setTailoring(false)}
          onTailored={onTailored}
        />
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [usage, setUsage] = useState<{ used: number; limit: number }>({ used: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [r, u] = await Promise.all([api.listResumes(), api.getTailorUsage()]);
      setResumes(r.resumes);
      setUsage(u);
    } finally { setLoading(false); }
  };

  const onTailored = () => setUsage(u => ({ ...u, used: u.used + 1 }));

  useEffect(() => { load(); }, []);

  return (
    <div className="rung-resume-page">
      <div className="rung-page-heading">
        <div className="rung-page-heading-row">
          <div>
            <h1>Resume</h1>
            <p className="rung-page-subheading">Store versions and tailor to specific roles with AI</p>
          </div>
          <button className={buttonClass({ variant: 'primary' })} onClick={() => setUploading(true)}>
            <Plus size={15} /> Upload resume
          </button>
        </div>
        {!loading && (
          <div className="rung-resume-usage-row">
            <Sparkles size={13} style={{ color: 'var(--of-fg-brand)', flexShrink: 0 }} />
            <UsageMeter used={usage.used} limit={usage.limit} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="rung-leads-loading" style={{ padding: '32px 0' }}>Loading…</div>
      ) : resumes.length === 0 ? (
        <div className="rung-resume-empty">
          <FileText size={32} strokeWidth={1.2} />
          <p>No resumes yet. Upload your first version to get started.</p>
          <button className={buttonClass({ variant: 'primary' })} onClick={() => setUploading(true)}>
            <Plus size={15} /> Upload resume
          </button>
        </div>
      ) : (
        <div className="rung-resume-list">
          {resumes.map(r => (
            <ResumeCard
              key={r.id}
              resume={r}
              usage={usage}
              onDeleted={id => setResumes(prev => prev.filter(x => x.id !== id))}
              onUpdated={load}
              onTailored={onTailored}
            />
          ))}
        </div>
      )}

      {uploading && (
        <UploadModal
          onClose={() => setUploading(false)}
          onUploaded={r => { setResumes(prev => [r, ...prev]); setUploading(false); }}
        />
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { badgeClass, buttonClass, inputClass, labelClass, selectClass, textareaClass } from '@ops-forward/keel';
import { ChevronDown, ChevronUp, Globe, Lock, Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import { api } from '../api';
import { INTERVIEW_CATEGORIES, type CoachFeedback, type InterviewCategory, type InterviewQuestion } from '../types';

const CATEGORY_COLORS: Record<InterviewCategory, 'blue' | 'purple' | 'amber' | 'green' | 'red' | 'default'> = {
  Behavioral:         'green',
  Technical:          'blue',
  Situational:        'amber',
  Leadership:         'purple',
  'Company-specific': 'red',
  DesignOps:          'blue',
  Other:              'default',
};

// ── Add Question Modal ────────────────────────────────────────────────────────
function AddQuestionModal({
  defaultVisibility,
  onClose,
  onSaved,
}: {
  defaultVisibility: 'public' | 'private';
  onClose: () => void;
  onSaved: (q: InterviewQuestion) => void;
}) {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<InterviewCategory>('Behavioral');
  const [visibility, setVisibility] = useState<'public' | 'private'>(defaultVisibility);
  const [source, setSource] = useState('');
  const [tags, setTags] = useState('');
  const [hint, setHint] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!question.trim()) return;
    setSaving(true);
    try {
      const r = await api.createInterviewQuestion({ question, category, visibility, source: source || undefined, tags: tags || undefined, hint: hint || undefined });
      onSaved(r.question);
    } finally { setSaving(false); }
  };

  return (
    <div className="rung-modal-backdrop" onClick={onClose}>
      <div className="rung-modal" onClick={e => e.stopPropagation()}>
        <h2>Add interview question</h2>

        <div className="rung-iq-vis-toggle">
          <button
            className={`rung-iq-vis-btn${visibility === 'public' ? ' active' : ''}`}
            onClick={() => setVisibility('public')}>
            <Globe size={14} /> Contribute to public library
          </button>
          <button
            className={`rung-iq-vis-btn${visibility === 'private' ? ' active' : ''}`}
            onClick={() => setVisibility('private')}>
            <Lock size={14} /> Keep private
          </button>
        </div>

        {visibility === 'public' && (
          <p className="rung-iq-vis-hint">
            Public questions are visible to all users. They can add their own private answers.
          </p>
        )}

        <div className="rung-form-grid" style={{ marginTop: 12 }}>
          <div>
            <label className={labelClass()}>Question</label>
            <textarea className={textareaClass()} rows={3} value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. Tell me about a time you had to lead through ambiguity." />
          </div>
          <div className="pair">
            <div>
              <label className={labelClass()}>Category</label>
              <select className={selectClass()} value={category}
                onChange={e => setCategory(e.target.value as InterviewCategory)}>
                {INTERVIEW_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass()}>Source (company / role)</label>
              <input className={inputClass()} placeholder="e.g. Google, PM interview"
                value={source} onChange={e => setSource(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass()}>Tags (comma-separated)</label>
            <input className={inputClass()} placeholder="e.g. conflict, leadership, data"
              value={tags} onChange={e => setTags(e.target.value)} />
          </div>
          {visibility === 'public' && (
            <div>
              <label className={labelClass()}>Why employers ask this <span style={{ color: 'var(--rung-text-faint)', fontWeight: 400 }}>(optional hint for other users)</span></label>
              <textarea className={textareaClass()} rows={3}
                placeholder="e.g. Employers want to understand your capacity to step up and lead with good judgment…"
                value={hint} onChange={e => setHint(e.target.value)} />
            </div>
          )}
        </div>

        <div className="rung-modal-actions">
          <button className={buttonClass({ variant: 'ghost' })} onClick={onClose}>Cancel</button>
          <button className={buttonClass({ variant: 'primary' })} onClick={save}
            disabled={saving || !question.trim()}>
            {saving ? 'Saving…' : 'Add question'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Coach Modal ───────────────────────────────────────────────────────────────
function CoachModal({ q, onClose }: { q: InterviewQuestion; onClose: () => void }) {
  const [answer, setAnswer] = useState('');
  const [coaching, setCoaching] = useState(false);
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const [error, setError] = useState('');

  const getCoaching = async () => {
    if (!answer.trim()) return;
    setCoaching(true);
    setError('');
    try {
      const r = await api.coachAnswer({ question: q.question, answer, category: q.category });
      setFeedback(r.feedback);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Coaching failed, please try again.');
    } finally { setCoaching(false); }
  };

  const scoreColor = feedback
    ? feedback.score >= 4 ? 'var(--of-fg-success)' : feedback.score >= 3 ? 'var(--of-fg-warning)' : 'var(--of-fg-danger)'
    : undefined;

  return (
    <div className="rung-modal-backdrop" onClick={onClose}>
      <div className="rung-coach-modal" onClick={e => e.stopPropagation()}>
        <div className="rung-coach-header">
          <h2><Sparkles size={16} /> Practice with AI Coach</h2>
          <button className="rung-icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="rung-coach-question">
          <span className={badgeClass({ variant: CATEGORY_COLORS[q.category] })}>{q.category}</span>
          <p>{q.question}</p>
        </div>

        {!feedback ? (
          <>
            <div>
              <label className={labelClass()}>Your answer</label>
              <textarea className={textareaClass()} rows={8}
                placeholder="Write your answer here. Try using the STAR method: Situation, Task, Action, Result."
                value={answer} onChange={e => setAnswer(e.target.value)} />
            </div>
            {error && <p style={{ color: 'var(--of-fg-danger)', fontSize: 13 }}>{error}</p>}
            <div className="rung-modal-actions">
              <button className={buttonClass({ variant: 'ghost' })} onClick={onClose}>Cancel</button>
              <button className={buttonClass({ variant: 'primary' })} onClick={getCoaching}
                disabled={coaching || !answer.trim()}>
                {coaching ? 'Analyzing… (15–30s)' : <><Sparkles size={14} /> Get feedback</>}
              </button>
            </div>
          </>
        ) : (
          <div className="rung-coach-feedback">
            <div className="rung-coach-score">
              <span className="rung-coach-score-num" style={{ color: scoreColor }}>
                {feedback.score}/5
              </span>
              <span className="rung-coach-score-label">
                {'★'.repeat(feedback.score)}{'☆'.repeat(5 - feedback.score)}
              </span>
              <span className="rung-coach-structure">{feedback.structure}</span>
            </div>

            <div className="rung-coach-section">
              <div className="rung-coach-section-title good">What worked well</div>
              <ul className="rung-coach-list">
                {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div className="rung-coach-section">
              <div className="rung-coach-section-title improve">Areas to improve</div>
              <ul className="rung-coach-list">
                {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            {feedback.rewrite_tip && (
              <div className="rung-coach-section">
                <div className="rung-coach-section-title tip">Stronger opening</div>
                <p className="rung-coach-tip">{feedback.rewrite_tip}</p>
              </div>
            )}

            <div className="rung-modal-actions">
              <button className={buttonClass({ variant: 'ghost' })}
                onClick={() => { setFeedback(null); }}>
                Try again
              </button>
              <button className={buttonClass({ variant: 'primary' })} onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Question Card ─────────────────────────────────────────────────────────────
function QuestionCard({
  q,
  onDeleted,
  onAnswerSaved,
}: {
  q: InterviewQuestion;
  onDeleted: (id: string) => void;
  onAnswerSaved: (id: string, answer: string | null, notes: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [coaching, setCoaching] = useState(false);
  const [answer, setAnswer] = useState(q.my_answer ?? '');
  const [notes, setNotes] = useState(q.my_notes ?? '');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const saveAnswer = async () => {
    setSaving(true);
    try {
      await api.saveInterviewAnswer(q.id, { answer: answer || undefined, notes: notes || undefined });
      onAnswerSaved(q.id, answer || null, notes || null);
      setEditing(false);
    } finally { setSaving(false); }
  };

  const deleteQ = async () => {
    if (!confirm('Delete this question?')) return;
    await api.deleteInterviewQuestion(q.id);
    onDeleted(q.id);
  };

  const toggleOpen = () => {
    setOpen(o => !o);
    if (!open) setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const tags = q.tags ? q.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className={`rung-iq-card${open ? ' open' : ''}`}>
      <div className="rung-iq-card-header" onClick={toggleOpen}>
        <div className="rung-iq-card-meta">
          <span className={badgeClass({ variant: CATEGORY_COLORS[q.category] })}>{q.category}</span>
          {q.source && <span className="rung-iq-source">{q.source}</span>}
          {tags.map(t => <span key={t} className="rung-iq-tag">{t}</span>)}
          {q.visibility === 'private' && (
            <span className="rung-iq-private"><Lock size={10} /> private</span>
          )}
        </div>
        <div className="rung-iq-card-actions" onClick={e => e.stopPropagation()}>
          <button className="rung-iq-practice-btn" onClick={() => setCoaching(true)} title="Practice with AI coach">
            <Sparkles size={12} /> Practice
          </button>
          {q.is_mine ? (
            <button className="rung-icon-btn danger" onClick={deleteQ} title="Delete">
              <Trash2 size={13} />
            </button>
          ) : null}
          <span className="rung-iq-chevron">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </div>

      <p className="rung-iq-question" onClick={toggleOpen}>{q.question}</p>

      {!q.is_mine && q.visibility === 'public' && (
        <p className="rung-iq-contributor">Contributed by {q.contributor_name}</p>
      )}

      {coaching && <CoachModal q={q} onClose={() => setCoaching(false)} />}

      {open && (
        <div className="rung-iq-answer-section">
          {q.hint && (
            <div className="rung-iq-hint">
              <span className="rung-iq-hint-label">Why employers ask this</span>
              <p>{q.hint}</p>
            </div>
          )}
          <div className="rung-iq-answer-label">
            <span>Your answer</span>
            {!editing && (
              <button className="rung-iq-edit-btn" onClick={() => setEditing(true)}>
                <Pencil size={12} /> {q.my_answer ? 'Edit' : 'Add answer'}
              </button>
            )}
          </div>

          {editing ? (
            <>
              <textarea ref={textareaRef} className={textareaClass()} rows={5}
                placeholder="Write your answer using the STAR method or your preferred framework…"
                value={answer} onChange={e => setAnswer(e.target.value)} />
              <textarea className={textareaClass()} rows={2} style={{ marginTop: 6 }}
                placeholder="Private notes (reminders, variations…)"
                value={notes} onChange={e => setNotes(e.target.value)} />
              <div className="rung-iq-answer-actions">
                <button className={buttonClass({ variant: 'ghost' })} onClick={() => {
                  setAnswer(q.my_answer ?? ''); setNotes(q.my_notes ?? ''); setEditing(false);
                }}>
                  <X size={13} /> Cancel
                </button>
                <button className={buttonClass({ variant: 'primary' })} onClick={saveAnswer} disabled={saving}>
                  {saving ? 'Saving…' : 'Save answer'}
                </button>
              </div>
            </>
          ) : q.my_answer ? (
            <p className="rung-iq-answer-text">{q.my_answer}</p>
          ) : (
            <p className="rung-iq-no-answer">No answer yet — click "Add answer" to write one.</p>
          )}
        </div>
      )}
    </div>
  );
}

const QUESTIONS_PER_PAGE = 10;

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InterviewPage() {
  const [tab, setTab] = useState<'public' | 'private'>('public');
  const [category, setCategory] = useState<InterviewCategory | 'All'>('All');
  const [search, setSearch] = useState('');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.listInterviewQuestions(tab, category === 'All' ? undefined : category);
      setQuestions(r.questions);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab, category]);
  useEffect(() => { setPage(1); }, [tab, category, search]);

  const onDeleted = (id: string) => setQuestions(prev => prev.filter(q => q.id !== id));

  const onAdded = (q: InterviewQuestion) => {
    if (q.visibility === tab || (tab === 'public' && q.visibility === 'public')) {
      setQuestions(prev => [q, ...prev]);
    }
    setAdding(false);
  };

  const onAnswerSaved = (id: string, answer: string | null, notes: string | null) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, my_answer: answer, my_notes: notes } : q));
  };

  const filteredQuestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(iq =>
      iq.question.toLowerCase().includes(q) ||
      (iq.tags ?? '').toLowerCase().includes(q) ||
      (iq.source ?? '').toLowerCase().includes(q)
    );
  }, [questions, search]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * QUESTIONS_PER_PAGE;
  const pageQuestions = filteredQuestions.slice(pageStart, pageStart + QUESTIONS_PER_PAGE);

  return (
    <div className="rung-interview-page">
      <div className="rung-page-heading">
        <div className="rung-page-heading-row">
          <div>
            <h1>Interview Prep</h1>
            <p className="rung-page-subheading">Build and refine your answers — public library + private notes</p>
          </div>
          <button className={buttonClass({ variant: 'primary' })} onClick={() => setAdding(true)}>
            <Plus size={15} /> Add question
          </button>
        </div>
      </div>

      <div className="rung-iq-tabs-bar">
        <div className="rung-leads-tabs" style={{ border: 'none', padding: 0, borderBottom: '1px solid var(--rung-border)' }}>
          <button className={`rung-tab${tab === 'public' ? ' active' : ''}`} onClick={() => setTab('public')}>
            <Globe size={13} /> Public library
          </button>
          <button className={`rung-tab${tab === 'private' ? ' active' : ''}`} onClick={() => setTab('private')}>
            <Lock size={13} /> My private questions
          </button>
        </div>

        <div className="rung-iq-category-filters">
          {(['All', ...INTERVIEW_CATEGORIES] as const).map(cat => (
            <button key={cat}
              className={`rung-iq-cat-chip${category === cat ? ' active' : ''}`}
              onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="rung-iq-search-row">
        <div className="rung-search" style={{ flex: 1 }}>
          <Search size={14} />
          <input
            type="search"
            placeholder="Search questions, tags, or source…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <span className="rung-iq-search-count">
            {filteredQuestions.length} of {questions.length} matching
          </span>
        )}
      </div>

      {loading ? (
        <div className="rung-leads-loading" style={{ padding: '32px 0' }}>Loading questions…</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="rung-empty" style={{ marginTop: 16 }}>
          {search
            ? `No questions match "${search}". Try a different keyword.`
            : tab === 'public'
              ? 'No questions in the public library yet. Be the first to contribute!'
              : 'No private questions yet. Add one to start building your prep notes.'}
        </div>
      ) : (
        <>
          <div className="rung-iq-list">
            {pageQuestions.map(q => (
              <QuestionCard key={q.id} q={q} onDeleted={onDeleted} onAnswerSaved={onAnswerSaved} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="rung-iq-pagination">
              <button
                className="rung-iq-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}>
                ← Prev
              </button>
              <span className="rung-iq-page-info">
                {pageStart + 1}–{Math.min(pageStart + QUESTIONS_PER_PAGE, filteredQuestions.length)} of {filteredQuestions.length}
              </span>
              <button
                className="rung-iq-page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}>
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {adding && (
        <AddQuestionModal
          defaultVisibility={tab === 'private' ? 'private' : 'public'}
          onClose={() => setAdding(false)}
          onSaved={onAdded}
        />
      )}
    </div>
  );
}

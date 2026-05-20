import { useState } from 'react';
import { buttonClass, textareaClass } from '@ops-forward/keel';
import { Bug, CheckCircle, Lightbulb, MessageCircle, X } from 'lucide-react';
import { api } from '../api';
import type { LucideIcon } from 'lucide-react';

type FeedbackType = 'bug' | 'feature' | 'other';

const TYPES: { value: FeedbackType; label: string; icon: LucideIcon }[] = [
  { value: 'bug',     label: 'Bug',            icon: Bug },
  { value: 'feature', label: 'Feature',         icon: Lightbulb },
  { value: 'other',   label: 'Other',           icon: MessageCircle },
];

interface Props {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: Props) {
  const [type, setType]       = useState<FeedbackType>('feature');
  const [message, setMessage] = useState('');
  const [saving, setSaving]   = useState(false);
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!message.trim()) return;
    setSaving(true);
    try {
      await api.submitFeedback(type, message);
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rung-modal-overlay" onClick={onClose}>
      <div className="rung-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="rung-modal-header">
          <h2 className="rung-modal-title">Send feedback</h2>
          <button className="rung-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {done ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <CheckCircle size={36} style={{ color: 'var(--rung-primary)', marginBottom: 12 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Thanks for the feedback!</p>
            <p style={{ margin: '6px 0 24px', color: 'var(--rung-text-muted)', fontSize: 14 }}>
              It helps make Rung better.
            </p>
            <button className={buttonClass({ variant: 'primary' })} onClick={onClose}>Done</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="rung-feedback-types">
              {TYPES.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    className={`rung-feedback-type-btn${type === t.value ? ' active' : ''}`}
                    onClick={() => setType(t.value)}
                  >
                    <Icon size={18} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <textarea
              className={textareaClass()}
              rows={5}
              placeholder={
                type === 'bug'     ? 'What happened? What did you expect?' :
                type === 'feature' ? 'What would you like to see?' :
                'What\'s on your mind?'
              }
              value={message}
              onChange={e => setMessage(e.target.value)}
              autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className={buttonClass({ variant: 'ghost' })} onClick={onClose}>Cancel</button>
              <button
                className={buttonClass({ variant: 'primary' })}
                onClick={submit}
                disabled={!message.trim() || saving}
              >
                {saving ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

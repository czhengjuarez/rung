import { FormEvent, useState } from 'react';
import { buttonClass, inputClass, labelClass } from '@ops-forward/keel';
import { api } from '../api';
import type { ShortcutLink } from '../types';

export function LinkModal({
  link,
  onClose,
  onSaved
}: {
  link: ShortcutLink | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [label, setLabel] = useState(link?.label ?? '');
  const [url, setUrl] = useState(link?.url ?? '');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (link) {
        await api.updateLink(link.id, { label, url });
      } else {
        await api.createLink({ label, url });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rung-modal-backdrop" onClick={onClose}>
      <form className="rung-modal" onClick={(e) => e.stopPropagation()} onSubmit={onSubmit}>
        <h2>{link ? 'Edit link' : 'Add link'}</h2>
        <div className="rung-form-grid">
          <div>
            <label className={labelClass()} htmlFor="link-label">Label</label>
            <input
              id="link-label"
              className={inputClass()}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              placeholder="LinkedIn"
            />
          </div>
          <div>
            <label className={labelClass()} htmlFor="link-url">URL</label>
            <input
              id="link-url"
              className={inputClass()}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://linkedin.com/in/you"
              type="url"
            />
          </div>
        </div>
        <div className="rung-modal-actions">
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

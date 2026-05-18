import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { buttonClass } from '@ops-forward/keel';
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api';
import type { ShortcutLink } from '../types';
import type { AppContext } from '../App';
import { LinkModal } from '../components/LinkModal';

export default function LinksPage() {
  const ctx = useOutletContext<AppContext>();
  const [links, setLinks] = useState<ShortcutLink[]>([]);
  const [editing, setEditing] = useState<ShortcutLink | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = () => api.listLinks().then((r) => setLinks(r.links));
  useEffect(() => { refresh(); }, []);

  const copy = async (link: ShortcutLink) => {
    await navigator.clipboard.writeText(link.url);
    ctx.showToast(`Copied ${link.label}`);
  };

  const remove = async (link: ShortcutLink) => {
    if (!confirm(`Delete "${link.label}"?`)) return;
    await api.deleteLink(link.id);
    refresh();
  };

  return (
    <>
      <div className="rung-page-title">
        <h1>Shortcut links</h1>
        <button className={buttonClass({ variant: 'primary', size: 'md' })} onClick={() => setCreating(true)}>
          <Plus size={16} /> Add link
        </button>
      </div>

      {links.length === 0 ? (
        <div className="rung-empty">
          No links yet. Add your LinkedIn, GitHub, resume, calendar — anything you copy often.
        </div>
      ) : (
        <div className="rung-links">
          {links.map((link) => (
            <div className="rung-link-row" key={link.id}>
              <div className="info">
                <div className="label">{link.label}</div>
                <div className="url">{link.url}</div>
              </div>
              <button className="rung-icon-btn" onClick={() => copy(link)}>
                <Copy size={14} /> Copy
              </button>
              <span style={{ display: 'inline-flex', gap: 4 }}>
                <button className="rung-icon-btn" onClick={() => setEditing(link)} aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button className="rung-icon-btn danger" onClick={() => remove(link)} aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <LinkModal
          link={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            refresh();
          }}
        />
      )}
    </>
  );
}

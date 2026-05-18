import { FormEvent, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { buttonClass, inputClass, labelClass, switchInputClass, switchLabelClass, switchRootClass, switchThumbClass, switchTrackClass, textareaClass } from '@ops-forward/keel';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { api } from '../api';
import type { OwnProfile } from '../types';
import type { AppContext } from '../App';

interface LinkRow {
  label: string;
  url: string;
}

const SEED_LINKS: LinkRow[] = [
  { label: 'LinkedIn', url: '' },
  { label: 'Personal website', url: '' }
];

export default function ProfilePage() {
  const ctx = useOutletContext<AppContext>();
  const [profile, setProfile] = useState<OwnProfile | null>(null);
  const [slug, setSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [publicEnabled, setPublicEnabled] = useState(false);
  const [links, setLinks] = useState<LinkRow[]>(SEED_LINKS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.getProfile(), api.getProfileLinks()]).then(([{ profile }, { links: saved }]) => {
      setProfile(profile);
      setSlug(profile.slug ?? '');
      setDisplayName(profile.display_name ?? ctx.user.name ?? '');
      setHeadline(profile.headline ?? '');
      setPublicEnabled(!!profile.public_enabled);

      if (saved.length) {
        setLinks(saved.map(l => ({ label: l.label, url: l.url })));
      } else {
        setLinks(SEED_LINKS);
      }
    });
  }, [ctx.user.name]);

  const setLink = (i: number, field: 'label' | 'url', val: string) =>
    setLinks(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  const removeLink = (i: number) =>
    setLinks(prev => prev.filter((_, idx) => idx !== i));

  const addLink = () =>
    setLinks(prev => [...prev, { label: '', url: '' }]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const [{ profile }] = await Promise.all([
        api.updateProfile({
          slug: cleanSlug,
          display_name: displayName,
          headline,
          public_enabled: publicEnabled ? 1 : 0
        }),
        api.setProfileLinks(links.filter(l => l.url.trim()))
      ]);
      setProfile(profile);
      setSlug(profile.slug ?? '');
      ctx.showToast('Profile saved');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = profile?.slug
    ? `${window.location.origin}/u/${profile.slug}`
    : null;

  const copy = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    ctx.showToast('Public URL copied');
  };

  return (
    <>
      <div className="rung-page-title">
        <h1>Profile</h1>
      </div>
      <form className="rung-form-grid" onSubmit={onSubmit} style={{ maxWidth: 560 }}>
        <div>
          <label className={labelClass()} htmlFor="slug">Public URL slug</label>
          <input id="slug" className={inputClass()} placeholder="changying"
                 value={slug} onChange={(e) => setSlug(e.target.value)} />
          {publicUrl && (
            <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: 'var(--rung-text-muted)' }}>
              <span>{publicUrl}</span>
              <button type="button" className="rung-icon-btn" onClick={copy}>
                <Copy size={12} /> Copy
              </button>
            </div>
          )}
        </div>
        <div>
          <label className={labelClass()} htmlFor="display_name">Display name</label>
          <input id="display_name" className={inputClass()} value={displayName}
                 onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <label className={labelClass()} htmlFor="headline">Headline</label>
          <textarea id="headline" className={textareaClass()} rows={2}
                    placeholder="DesignOps leader open to Head of / CoS roles"
                    value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </div>

        <div>
          <label className={labelClass()}>Public links</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {links.map((link, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 6, alignItems: 'center' }}>
                <input
                  className={inputClass()}
                  placeholder="Site"
                  value={link.label}
                  onChange={(e) => setLink(i, 'label', e.target.value)}
                />
                <input
                  className={inputClass()}
                  placeholder="https://"
                  type="url"
                  value={link.url}
                  onChange={(e) => setLink(i, 'url', e.target.value)}
                />
                <button
                  type="button"
                  className="rung-icon-btn"
                  onClick={() => removeLink(i)}
                  aria-label="Remove link"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div>
              <button type="button" className={buttonClass({ variant: 'ghost', size: 'sm' })} onClick={addLink}>
                <Plus size={14} /> Add link
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className={switchRootClass()}>
            <input
              type="checkbox"
              className={switchInputClass()}
              checked={publicEnabled}
              onChange={(e) => setPublicEnabled(e.target.checked)}
            />
            <span className={switchTrackClass()}>
              <span className={switchThumbClass()} />
            </span>
            <span className={switchLabelClass()}>Publish public profile</span>
          </label>
          <p style={{ fontSize: 13, color: 'var(--rung-text-muted)', margin: '6px 0 0' }}>
            When on, anyone with the link can see your public links and headline.
            Application data is never shown publicly.
          </p>
        </div>
        <div>
          <button type="submit" className={buttonClass({ variant: 'primary' })} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </>
  );
}

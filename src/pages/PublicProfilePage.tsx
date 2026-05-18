import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import type { PublicProfile } from '../types';

export default function PublicProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<PublicProfile | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    api.getPublicProfile(slug)
      .then((r) => setProfile(r.profile))
      .catch(() => setProfile(null));
  }, [slug]);

  if (profile === undefined) return <div className="rung-public" />;

  if (!profile) {
    return (
      <div className="rung-public">
        <div className="rung-public-card">
          <div className="rung-brand" style={{ justifyContent: 'center', marginBottom: 16 }}>
            <span className="rung-brand-mark" aria-hidden />
            Rung
          </div>
          <p>This profile doesn't exist or isn't public.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rung-public">
      <div className="rung-public-card">
        {profile.avatar_url && <img className="avatar" src={profile.avatar_url} alt="" />}
        <h1>{profile.display_name}</h1>
        {profile.headline && <p className="headline">{profile.headline}</p>}
        <div className="public-links">
          {profile.links.map((link) => (
            <a key={link.url} href={link.url} className="public-link" target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { RungLogo } from '../components/RungLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    api.me().then((res) => {
      if (res.user) navigate('/', { replace: true });
    }).catch(() => {});
  }, [navigate]);

  return (
    <div className="rung-login">
      <div className="rung-login-card">
        <div className="rung-brand">
          <RungLogo size={28} />
          Rung
        </div>
        <p>Track your job search. One ladder, one rung at a time.</p>
        <a className="rung-google-btn" href="/auth/google/start">
          <GoogleG /> Sign in with Google
        </a>
      </div>

      <div className="rung-login-philosophy">
        <p className="rung-login-philosophy-lead">Built for intentional job searching.</p>
        <ul>
          <li>Track each application deliberately — status, contacts, notes, timeline.</li>
          <li>Practice interview questions and get AI coaching on your answers.</li>
          <li>Discover leads from sources you choose, scored for fit against your criteria.</li>
        </ul>
        <p className="rung-login-philosophy-note">
          Rung is mostly manual by design. It is not a mass-apply bot, a resume blaster, or a scraper.
          If you are looking to fire off 500 applications with one click, this is not that.
          Fewer applications, more thought — that is the idea.
        </p>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.34A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l2.99-2.34z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.36l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"/>
    </svg>
  );
}

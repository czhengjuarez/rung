import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { api } from './api';
import type { User } from './types';
import { Toast } from './components/Toast';

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api
      .me()
      .then((res) => {
        if (!res.user) {
          navigate('/login', { replace: true });
        } else {
          setUser(res.user);
        }
      })
      .catch(() => navigate('/login', { replace: true }));
  }, [navigate]);

  if (user === undefined) {
    return <div className="rung-shell" />;
  }
  if (!user) return null;

  const onLogout = async () => {
    await api.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="rung-shell">
      <header className="rung-topbar">
        <div className="rung-brand">
          <span className="rung-brand-mark" aria-hidden />
          Rung
        </div>
        <nav className="rung-nav">
          <NavLink to="/" end>Applications</NavLink>
          <NavLink to="/contacts">Contacts</NavLink>
          <NavLink to="/links">Links</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
        <div className="rung-user">
          {user.avatar_url && <img className="rung-avatar" src={user.avatar_url} alt="" />}
          <span>{user.name || user.email}</span>
          <button className="rung-icon-btn" onClick={onLogout} aria-label="Log out">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </header>
      <main className="rung-main">
        <Outlet context={{ user, showToast: (msg: string) => setToast(msg) }} />
      </main>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

export interface AppContext {
  user: User;
  showToast: (msg: string) => void;
}

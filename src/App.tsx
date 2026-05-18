import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, FileText, HelpCircle, Link2, LogOut, Moon, Sparkles, Sun, User as UserIcon, Users } from 'lucide-react';
import { api } from './api';
import type { User } from './types';
import { Toast } from './components/Toast';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const saved = window.localStorage.getItem('rung-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const NAV_GROUPS = [
  {
    label: 'Job Search',
    items: [
      { to: '/',          label: 'Applications',   icon: Briefcase,    end: true },
      { to: '/leads',     label: 'Job Leads',       icon: Sparkles,     end: false },
      { to: '/contacts',  label: 'Contacts',        icon: Users,        end: false },
      { to: '/interview', label: 'Interview Prep',  icon: HelpCircle,   end: false },
    ],
  },
  {
    label: 'Personal',
    items: [
      { to: '/resume',  label: 'Resume',  icon: FileText,  end: false },
      { to: '/profile', label: 'Profile', icon: UserIcon,  end: false },
      { to: '/links',   label: 'Links',   icon: Link2, end: false },
    ],
  },
] as const;

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('rung-theme', theme);
  }, [theme]);

  useEffect(() => {
    api.me().then((res) => {
      if (!res.user) navigate('/login', { replace: true });
      else setUser(res.user);
    }).catch(() => navigate('/login', { replace: true }));
  }, [navigate]);

  if (user === undefined) return <div className="rung-shell" />;
  if (!user) return null;

  const onLogout = async () => {
    await api.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="rung-shell">
      <aside className="rung-sidebar">
        <div className="rung-sidebar-brand">
          <span className="rung-brand-mark" aria-hidden />
          <span className="rung-sidebar-brand-name">Rung</span>
        </div>

        <nav className="rung-sidebar-nav">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="rung-nav-group">
              <div className="rung-nav-group-label">{group.label}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `rung-nav-link${isActive ? ' active' : ''}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="rung-sidebar-footer">
          <div className="rung-sidebar-user">
            {user.avatar_url && <img className="rung-avatar" src={user.avatar_url} alt="" />}
            <span className="rung-sidebar-username">{user.name?.split(' ')[0] || user.email}</span>
          </div>
          <div className="rung-sidebar-footer-actions">
            <button
              className="rung-icon-btn"
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button className="rung-icon-btn" onClick={onLogout} title="Log out" aria-label="Log out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

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

import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Briefcase, FileText, HelpCircle, Link2, LogOut, MessageSquare, MoreHorizontal, Moon, Sparkles, Sun, User as UserIcon, Users } from 'lucide-react';
import { api } from './api';
import type { User } from './types';
import { RungLogo } from './components/RungLogo';
import { Toast } from './components/Toast';
import { FeedbackModal } from './components/FeedbackModal';

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
      { to: '/resume',        label: 'Resume',        icon: FileText,  end: false },
      { to: '/profile',       label: 'Profile',       icon: UserIcon,  end: false },
      { to: '/links',         label: 'Links',         icon: Link2,     end: false },
      { to: '/notifications', label: 'Notifications', icon: Bell,      end: false },
    ],
  },
] as const;

const BOTTOM_TABS = [
  { to: '/',          label: 'Jobs',      icon: Briefcase,  end: true },
  { to: '/leads',     label: 'Leads',     icon: Sparkles,   end: false },
  { to: '/interview', label: 'Prep',      icon: HelpCircle, end: false },
  { to: '/resume',    label: 'Resume',    icon: FileText,   end: false },
] as const;

const MORE_ITEMS = [
  { to: '/contacts',      label: 'Contacts',      icon: Users },
  { to: '/profile',       label: 'Profile',       icon: UserIcon },
  { to: '/links',         label: 'Links',         icon: Link2 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
] as const;

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [moreOpen, setMoreOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

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
          <RungLogo size={22} />
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
          <button
            className="rung-feedback-btn"
            onClick={() => setFeedbackOpen(true)}
            title="Send feedback"
          >
            <MessageSquare size={14} /> Feedback
          </button>
          <div className="rung-sidebar-footer-row">
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
        </div>

        {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
      </aside>

      <main className="rung-main">
        <Outlet context={{ user, showToast: (msg: string) => setToast(msg) }} />
      </main>

      {/* Bottom tab bar — mobile only */}
      <nav className="rung-bottom-nav">
        {BOTTOM_TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `rung-bottom-tab${isActive ? ' active' : ''}`}
          >
            <tab.icon size={22} />
            <span>{tab.label}</span>
          </NavLink>
        ))}
        <button
          className={`rung-bottom-tab${moreOpen || MORE_ITEMS.some(i => location.pathname.startsWith(i.to)) ? ' active' : ''}`}
          onClick={() => setMoreOpen(o => !o)}
        >
          <MoreHorizontal size={22} />
          <span>More</span>
        </button>
      </nav>

      {/* More sheet + backdrop — mobile only */}
      {moreOpen && (
        <>
          <div className="rung-sheet-backdrop" onClick={() => setMoreOpen(false)} />
          <div className="rung-more-sheet">
            {MORE_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `rung-sheet-item${isActive ? ' active' : ''}`}
                onClick={() => setMoreOpen(false)}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
            <div className="rung-sheet-divider" />
            <button
              className="rung-sheet-item"
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
            <button className="rung-sheet-item rung-sheet-item--danger" onClick={onLogout}>
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

export interface AppContext {
  user: User;
  showToast: (msg: string) => void;
}

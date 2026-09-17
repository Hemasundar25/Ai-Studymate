import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home,
  MessageCircle,
  CalendarDays,
  ListChecks,
  CircleHelp,
  BarChart3,
  Brain,
  Settings as SettingsIcon,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  Search,
  Bell,
  RotateCcw,
  Command,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Overview', icon: Home },
  { to: '/chat', label: 'AI Tutor', icon: MessageCircle },
  { to: '/study-plan', label: 'Study plan', icon: CalendarDays },
  { to: '/quiz', label: 'Quiz lab', icon: ListChecks },
  { to: '/doubt-solver', label: 'Doubt solver', icon: CircleHelp },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/knowledge-map', label: 'Knowledge map', icon: Brain },
];

export function AppShell({ profile, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const initials = (profile?.name || 'Student')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const currentNav = navItems.find((item) => item.to === location.pathname);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (event.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const commands = [
    ...navItems.map((item) => ({ ...item, action: () => navigate(item.to) })),
    { to: '/settings', label: 'Settings', icon: SettingsIcon, action: () => navigate('/settings') },
  ];

  const runCommand = (action) => {
    action();
    setCommandOpen(false);
    setMenuOpen(false);
    setMobileOpen(false);
  };

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>
          <span>
            StudyMate <b>AI</b>
          </span>
        </div>

        <div className="workspace-switcher">
          <div className="avatar avatar-small">{initials}</div>
          <div className="workspace-name">
            <strong>{profile?.name || 'Student'}</strong>
            <small>{profile?.exam || 'JEE'} preparation</small>
          </div>
          <ChevronDown size={15} />
        </div>

        <nav className="nav-list" aria-label="Main Navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </NavLink>

          <div className="sidebar-tip">
            <Zap size={16} />
            <div>
              <strong>Local-first mode</strong>
              <small>No account or API key required</small>
            </div>
          </div>

          <button
            className="collapse-button"
            aria-label="Collapse sidebar"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{currentNav?.label || 'StudyMate'}</strong>
          </div>

          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} />
              <input
                aria-label="Search"
                placeholder="Search anything"
                onFocus={() => setCommandOpen(true)}
                onKeyDown={(e) => e.key === 'Enter' && setCommandOpen(true)}
              />
              <kbd>⌘ K</kbd>
            </label>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => navigate('/analytics')}
            >
              <Bell size={18} />
              <i />
            </button>

            <div className="profile-control">
              <button
                className="profile-trigger"
                aria-label="Open profile menu"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="avatar">{initials}</span>
                <ChevronDown size={15} />
              </button>

              {menuOpen && (
                <div className="popover profile-menu">
                  <strong>{profile?.name || 'Student'}</strong>
                  <small>{profile?.exam || 'Exam'} learner</small>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/settings');
                    }}
                  >
                    <SettingsIcon size={15} /> Account settings
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/onboarding');
                    }}
                  >
                    <RotateCcw size={15} /> Update profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {commandOpen && (
          <motion.div
            className="command-backdrop"
            role="presentation"
            onMouseDown={() => setCommandOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="command-palette"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              onMouseDown={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: -12, scale: .98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: .98 }}
            >
              <div className="command-header">
                <div>
                  <Command size={17} />
                  <strong>Jump anywhere</strong>
                </div>
                <button className="icon-button" aria-label="Close command palette" onClick={() => setCommandOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <input autoFocus placeholder="Search pages and tools..." aria-label="Command search" />
              <div className="command-list">
                {commands.map(({ label, icon: Icon, action }) => (
                  <button key={label} onClick={() => runCommand(action)}>
                    <Icon size={17} />
                    <span>{label}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
              <small>Use Ctrl/⌘ K anytime · Esc to close</small>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AppShell;

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UiContext';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/cycle', label: 'Cycle Tracker' },
  { to: '/symptoms', label: 'Symptom Log' },
  { to: '/chatbot', label: 'AI Assistant' },
];

const Navbar = ({ focusMode, toggleFocusMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUI();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeDrawer = () => setDrawerOpen(false);

  // Request notification permission on login
  React.useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };
    if (user) requestNotificationPermission();
  }, [user]);

  const sendReminder = () => {
    if (Notification.permission === 'granted') {
      new Notification('🌸 Wellness Reminder', {
        body: 'Time to log your daily symptoms and stay on top of your cycle!',
        icon: '/favicon.ico',
      });
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('🌸 Wellness Reminder', {
            body: 'Notifications enabled! We will remind you to log daily.',
            icon: '/favicon.ico',
          });
        } else {
          alert('Please enable notifications to use this feature!');
        }
      });
    }
  };

  return (
    <>
      <nav className="topbar" aria-label="Primary navigation">
        <div className="brand">
          <div className="brand__mark">MW</div>
          <div>
            <div className="brand__eyebrow">Enterprise wellness</div>
            <div className="brand__title">Menstrual Wellness OS</div>
          </div>
        </div>

        {user && (
          <div className="topbar__actions">
            <button
              type="button"
              className="icon-button icon-button--ghost topbar__mobileToggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation drawer"
            >
              ☰
            </button>

            <div className="topbar__links">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="pill pill--ghost"
              onClick={sendReminder}
              aria-label="Send wellness reminder notification"
              title="Get a wellness reminder notification"
            >
              🔔 Remind me
            </button>

            {/* Focus Mode Toggle */}
            <button
              type="button"
              className={`pill ${focusMode ? 'pill--active' : 'pill--ghost'}`}
              onClick={toggleFocusMode}
              aria-label={focusMode ? 'Turn off focus mode' : 'Turn on focus mode'}
              title="Focus mode reduces visual decoration and highlights core content."
            >
              {focusMode ? '✨ Focus on' : '✨ Focus mode'}
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              className="pill pill--ghost"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>

            <div className="topbar__profile">
              <span className="topbar__avatar">{user.name?.charAt(0)?.toUpperCase()}</span>
              <div className="topbar__profileText">
                <span className="topbar__profileLabel">Welcome back</span>
                <strong>{user.name}</strong>
              </div>
            </div>

            <button onClick={handleLogout} className="btn btn--secondary">
              Logout
            </button>
          </div>
        )}
      </nav>

      {user && drawerOpen && (
        <div className="drawer-backdrop" onClick={closeDrawer} role="presentation">
          <aside
            className="drawer-panel"
            onClick={(event) => event.stopPropagation()}
            aria-label="Navigation drawer"
            role="dialog"
            aria-modal="true"
          >
            <div className="drawer-panel__header">
              <div>
                <div className="brand__eyebrow">Navigation</div>
                <div className="brand__title">Quick actions</div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={closeDrawer}
                aria-label="Close navigation drawer"
              >
                ×
              </button>
            </div>

            <div className="drawer-panel__content">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `drawer-link${isActive ? ' drawer-link--active' : ''}`}
                  onClick={closeDrawer}
                >
                  {item.label}
                </NavLink>
              ))}

              <button
                type="button"
                className="pill pill--ghost"
                onClick={sendReminder}
              >
                🔔 Send reminder
              </button>

              <button
                type="button"
                className={`btn ${focusMode ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => { toggleFocusMode(); closeDrawer(); }}
              >
                {focusMode ? '✨ Focus mode on' : '✨ Focus mode'}
              </button>

              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => { toggleTheme(); closeDrawer(); }}
              >
                {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
              </button>

              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => { handleLogout(); closeDrawer(); }}
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
import { cloneElement, useEffect, useState } from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import GroupsPage from './pages/GroupsPage';
import ActivityPage from './pages/ActivityPage';
import api from './api/client';

function ProtectedRoute({ children }) {
  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    const verify = async () => {
      try {
        await api.get('/auth/me');
        if (active) {
          setAuthorized(true);
        }
      } catch {
        if (active) {
          setAuthorized(false);
        }
      } finally {
        if (active) {
          setChecked(true);
        }
      }
    };

    verify();
    return () => {
      active = false;
    };
  }, []);

  if (!checked) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">Checking session…</div>;
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppShell({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('splitmate-theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('splitmate-theme', theme);
  }, [theme]);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/groups', label: 'Groups' },
    { to: '/activity', label: 'Activity' },
  ];

  const content = children ? cloneElement(children, { theme }) : children;

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_30%),#020617] text-slate-100' : 'min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_30%),#f8fafc] text-slate-900'}>
      <header className={theme === 'dark' ? 'border-b border-white/10 bg-slate-900/80 backdrop-blur' : 'border-b border-slate-200 bg-white/80 backdrop-blur'}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-500">SplitMate</p>
            <p className="text-sm text-slate-400">Expense tracker</p>
          </div>

          <nav className="flex items-center gap-2 rounded-full border border-slate-200/10 bg-slate-800/60 p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={theme === 'dark' ? 'rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm' : 'rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm'}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={async () => {
                try {
                  await api.post('/auth/logout');
                } catch {
                  // ignore logout errors and redirect anyway
                }
                window.location.href = '/login';
              }}
              className="rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {content}
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><AppShell><GroupsPage /></AppShell></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><AppShell><ActivityPage /></AppShell></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

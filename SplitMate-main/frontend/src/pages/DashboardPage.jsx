import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const groups = [
  { name: 'Tokyo Trip 2025', emoji: '✈️', category: 'Trip', total: '$4,280.50', balance: '+$340.25' },
  { name: 'Apartment — 14B', emoji: '🏠', category: 'Home', total: '$8,920.00', balance: '-$180.00' },
  { name: 'Team Lunch Collective', emoji: '🍜', category: 'Food', total: '$1,240.00', balance: '+$95.40' },
];

const activity = [
  { title: 'Hotel booking shared', time: '2h ago', amount: '$1,240.00' },
  { title: 'Jordan settled an expense', time: '4h ago', amount: '$160.00' },
  { title: 'Electricity bill added', time: '1d ago', amount: '$360.00' },
];

function DashboardPage({ theme }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data.user);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Unable to load dashboard.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-rose-400">{error}</div>;
  }

  const isDark = theme === 'dark';
  const surface = isDark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/90';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className="space-y-6">
      <section className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Dashboard</p>
            <h1 className={`mt-2 text-3xl font-semibold ${strong}`}>Welcome back, {user?.name || 'there'}.</h1>
            <p className={`mt-2 max-w-2xl text-sm leading-7 ${muted}`}>
              Keep shared bills, trips, and household costs organized in one calm place.
            </p>
          </div>
          <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            Balanced • 3 groups • 1 pending review
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <section className="space-y-6">
          <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className={`text-sm uppercase tracking-[0.28em] ${muted}`}>Overview</p>
                <h2 className={`mt-2 text-3xl font-semibold ${strong}`}>
                  You’re owed <span className="text-emerald-500">$180.75</span>
                </h2>
                <p className={`mt-2 max-w-xl text-sm leading-7 ${muted}`}>
                  Your balances are healthy and your next split is ready to post.
                </p>
              </div>
              <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                + Add expense
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { label: 'Total spent', value: '$12,440.50' },
                { label: 'You owe', value: '$420.00' },
                { label: 'You’re owed', value: '$600.75' },
              ].map((item) => (
                <div key={item.label} className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={`text-sm ${muted}`}>{item.label}</p>
                  <p className={`mt-2 text-xl font-semibold ${strong}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm uppercase tracking-[0.28em] ${muted}`}>Groups</p>
                <h3 className={`mt-1 text-xl font-semibold ${strong}`}>Your shared spaces</h3>
              </div>
              <button className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>View all</button>
            </div>

            <div className="mt-5 space-y-3">
              {groups.map((group) => (
                <div key={group.name} className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark ? 'bg-white/10' : 'bg-white'} text-xl`}>
                      {group.emoji}
                    </div>
                    <div>
                      <p className={`font-semibold ${strong}`}>{group.name}</p>
                      <p className={`text-sm ${muted}`}>{group.category} • {group.total}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${group.balance.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{group.balance}</p>
                    <p className={`text-xs ${muted}`}>Updated today</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
            <p className={`text-sm uppercase tracking-[0.28em] ${muted}`}>Balance trend</p>
            <div className="mt-5 space-y-3">
              {[76, 58, 82, 65, 90].map((value, index) => (
                <div key={value} className="flex items-center gap-3">
                  <span className={`w-10 text-sm ${muted}`}>{['Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}</span>
                  <div className={`h-2 flex-1 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
            <p className={`text-sm uppercase tracking-[0.28em] ${muted}`}>Recent activity</p>
            <div className="mt-5 space-y-3">
              {activity.map((item) => (
                <div key={item.title} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-sm font-medium ${strong}`}>{item.title}</p>
                    <span className="text-xs text-emerald-500">{item.amount}</span>
                  </div>
                  <p className={`mt-1 text-sm ${muted}`}>{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DashboardPage;

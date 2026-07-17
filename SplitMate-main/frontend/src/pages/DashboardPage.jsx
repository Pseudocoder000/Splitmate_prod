import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../store/slices/dashboardSlice'

function formatCurrency(amount = 0) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function DashboardPage({ theme }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);
  const {
    loading,
    error,
    summary,
    groups,
    recentExpenses,
    recentActivities,
    pendingBalances,
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    dispatch(fetchDashboard());
  }, [dispatch, navigate, user]);

  if (!user || (loading && !summary?.totalExpenses)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-rose-400">
        {error}
      </div>
    );
  }

  const isDark = theme === 'dark';
  const surface = isDark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/90';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-white' : 'text-slate-900';

  const currentUserId = user?._id || user?.id;
  const activityFeed = (recentActivities?.length > 0 ? recentActivities : recentExpenses) || [];

  return (
    <div className="space-y-6">
      <section className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Dashboard
            </p>
            <h1 className={`mt-2 text-2xl font-semibold sm:text-3xl ${strong}`}>
              Welcome back, {user?.name || 'there'}.
            </h1>
            <p className={`mt-2 max-w-2xl text-sm leading-7 ${muted}`}>
              Keep shared bills, trips, and household costs organized in one calm place.
            </p>
          </div>
          <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            {summary.netBalance >= 0 ? 'Ahead' : 'Behind'} • {summary.totalGroups ?? 0} group{summary.totalGroups === 1 ? '' : 's'} • {pendingBalances.length} pending {pendingBalances.length === 1 ? 'balance' : 'balances'}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <section className="space-y-6">
          <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className={`text-sm uppercase tracking-[0.28em] ${muted}`}>Overview</p>
                <h2 className={`mt-2 text-2xl font-semibold sm:text-3xl ${strong}`}>
                  {summary.netBalance >= 0 ? (
                    <>You're owed <span className="text-emerald-500">{formatCurrency(summary.netBalance)}</span></>
                  ) : (
                    <>You owe <span className="text-rose-500">{formatCurrency(Math.abs(summary.netBalance))}</span></>
                  )}
                </h2>
                <p className={`mt-2 max-w-xl text-sm leading-7 ${muted}`}>
                  {summary.netBalance >= 0
                    ? 'Your balances are healthy and your next split is ready to post.'
                    : 'Settle up when you get a chance — a few people are waiting on you.'}
                </p>
              </div>
              <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                + Add expense
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Total spent', value: formatCurrency(summary.totalSpent) },
                { label: 'You owe', value: formatCurrency(summary.youOwe) },
                { label: 'You’re owed', value: formatCurrency(summary.youAreOwed) },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}
                >
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
              <button className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                View all
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {groups.length === 0 ? (
                <div className={`rounded-2xl border px-4 py-6 text-center text-sm ${isDark ? 'border-white/10 bg-white/5 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  No groups yet — create one to start splitting expenses.
                </div>
              ) : (
                groups.map((group) => (
                  <div
                    key={group._id}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark ? 'bg-white/10' : 'bg-white'} text-xl`}>
                        {group.emoji || '👥'}
                      </div>
                      <div>
                        <p className={`font-semibold ${strong}`}>{group.name}</p>
                        <p className={`text-sm ${muted}`}>
                          {group.category || 'Group'} • {formatCurrency(group.total ?? 0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${(group.balance ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(group.balance ?? 0) >= 0 ? '+' : '-'}{formatCurrency(Math.abs(group.balance ?? 0))}
                      </p>
                      <p className={`text-xs ${muted}`}>Updated today</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
            <p className={`text-sm uppercase tracking-[0.28em] ${muted}`}>Balances</p>
            <div className="mt-5 space-y-3">
              {pendingBalances.length === 0 ? (
                <p className={`text-sm ${muted}`}>All settled up — nice work.</p>
              ) : (
                pendingBalances.map((b) => {
                  const youAreLender = b.lender._id === currentUserId;
                  const otherPerson = youAreLender ? b.borrower : b.lender;
                  const widthPct = summary.totalSpent
                    ? Math.min(100, (b.amount / summary.totalSpent) * 100)
                    : 0;
                  return (
                    <div key={b._id} className="flex items-center gap-3">
                      <span className={`w-24 shrink-0 truncate text-sm ${muted}`}>{otherPerson.name}</span>
                      <div className={`h-2 flex-1 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                        <div
                          className={`h-full rounded-full ${youAreLender ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-rose-500 to-orange-400'}`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className={`shrink-0 text-xs font-medium ${youAreLender ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {youAreLender ? '+' : '-'}{formatCurrency(b.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
            <p className={`text-sm uppercase tracking-[0.28em] ${muted}`}>Recent activity</p>
            <div className="mt-5 space-y-3">
              {activityFeed.length === 0 ? (
                <p className={`text-sm ${muted}`}>No recent activity yet.</p>
              ) : (
                activityFeed.map((item) => (
                  <div
                    key={item._id}
                    className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`truncate text-sm font-medium ${strong}`}>{item.title}</p>
                      <span className="shrink-0 text-xs text-emerald-500">{formatCurrency(item.amount)}</span>
                    </div>
                    <p className={`mt-1 text-sm ${muted}`}>
                      {item.group?.name ? `${item.group.name} • ` : ''}
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DashboardPage;
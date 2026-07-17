import { Link } from 'react-router-dom';

const groups = [
  { name: 'Tokyo Trip 2025', emoji: '✈️', members: 4, total: '$4,280.50', status: 'Balanced' },
  { name: 'Apartment — 14B', emoji: '🏠', members: 3, total: '$8,920.00', status: 'Needs review' },
  { name: 'Team Lunch Collective', emoji: '🍜', members: 5, total: '$1,240.00', status: 'Up to date' },
];

function GroupsPage({ theme }) {
  const isDark = theme === 'dark';
  const surface = isDark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/90';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className="space-y-6">
      <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Groups</p>
            <h2 className={`mt-2 text-2xl font-semibold ${strong}`}>Your shared circles</h2>
            <p className={`mt-2 text-sm leading-7 ${muted}`}>Track each shared plan with a clear view of expenses and balances.</p>
          </div>
          <Link to="/dashboard" className={`text-sm font-medium ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}>
            Back to dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <div key={group.name} className={`rounded-[28px] border p-5 shadow-sm ${surface}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-100'} text-xl`}>
                  {group.emoji}
                </div>
                <div>
                  <h3 className={`font-semibold ${strong}`}>{group.name}</h3>
                  <p className={`text-sm ${muted}`}>{group.members} members</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                {group.status}
              </span>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className={`text-sm ${muted}`}>Total spent</p>
                <p className={`mt-1 text-xl font-semibold ${strong}`}>{group.total}</p>
              </div>
              <button className={`rounded-2xl border px-3 py-2 text-sm font-medium ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupsPage;

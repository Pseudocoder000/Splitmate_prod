const activity = [
  { title: 'Hotel booking shared', time: '2 hours ago', amount: '$1,240.00' },
  { title: 'Jordan settled an expense', time: '4 hours ago', amount: '$160.00' },
  { title: 'Electricity bill added', time: '1 day ago', amount: '$360.00' },
  { title: 'Riley joined Team Lunch Collective', time: '2 days ago', amount: '$0.00' },
];

function ActivityPage({ theme }) {
  const isDark = theme === 'dark';
  const surface = isDark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/90';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className="space-y-6">
      <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Activity</p>
          <h2 className={`mt-2 text-2xl font-semibold ${strong}`}>Recent happenings</h2>
          <p className={`mt-2 text-sm leading-7 ${muted}`}>Stay aware of every expense update and settlement in your shared groups.</p>
        </div>
      </div>

      <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
        <div className="space-y-3">
          {activity.map((item) => (
            <div key={item.title} className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
              <div>
                <p className={`font-semibold ${strong}`}>{item.title}</p>
                <p className={`mt-1 text-sm ${muted}`}>{item.time}</p>
              </div>
              <span className={`text-sm font-semibold ${strong}`}>{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;

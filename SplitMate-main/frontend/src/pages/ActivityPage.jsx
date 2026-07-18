import { useEffect, useState } from 'react';
import api from '../api/client';

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

function ActivityPage({ theme }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';
  const surface = isDark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/90';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-white' : 'text-slate-900';

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/activity/recent');
      setActivities(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to load activity feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return (
    <div className='space-y-6'>
      <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Activity</p>
            <h2 className={`mt-2 text-2xl font-semibold ${strong}`}>Recent happenings</h2>
            <p className={`mt-2 text-sm leading-7 ${muted}`}>Stay aware of every expense update and settlement in your shared groups.</p>
          </div>
          <button type='button' onClick={loadActivities} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}`}>
            Refresh
          </button>
        </div>
      </div>

      <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
        {loading ? (
          <p className={`text-sm ${muted}`}>Loading activity feed…</p>
        ) : error ? (
          <p className='text-sm text-rose-500'>{error}</p>
        ) : activities.length === 0 ? (
          <p className={`text-sm ${muted}`}>No activity yet for your groups.</p>
        ) : (
          <div className='space-y-3'>
            {activities.map((item) => (
              <div key={item._id} className={`flex flex-col gap-2 rounded-2xl border px-4 py-4 md:flex-row md:items-center md:justify-between ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <div>
                  <p className={`font-semibold ${strong}`}>{item.description}</p>
                  <p className={`mt-1 text-sm ${muted}`}>{item.group?.name ? `${item.group.name} • ` : ''}{formatRelativeTime(item.createdAt)}</p>
                </div>
                {item.metadata?.expenseId ? <span className='text-sm font-semibold text-emerald-500'>Tracked</span> : <span className='text-sm font-semibold text-slate-500'>Update</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityPage;

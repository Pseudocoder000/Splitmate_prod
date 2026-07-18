import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function formatCurrency(amount = 0) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function GroupsPage({ theme }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const isDark = theme === 'dark';
  const surface = isDark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/90';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-white' : 'text-slate-900';

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups');
      const nextGroups = response.data.data || [];
      setGroups(nextGroups);
      if (!selectedGroupId && nextGroups.length > 0) {
        setSelectedGroupId(nextGroups[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to load your groups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    setCreateError('');

    try {
      await api.post('/groups', { name: groupName.trim() });
      setGroupName('');
      await loadGroups();
    } catch (err) {
      setCreateError(err.response?.data?.error?.message || 'Could not create the group.');
    } finally {
      setIsCreating(false);
    }
  };

  const selectedGroup = groups.find((group) => group._id === selectedGroupId) || null;

  return (
    <div className='space-y-6'>
      <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Groups</p>
            <h2 className={`mt-2 text-2xl font-semibold ${strong}`}>Your shared circles</h2>
            <p className={`mt-2 text-sm leading-7 ${muted}`}>Track each shared plan with a clear view of expenses and balances.</p>
          </div>
          <div className='flex items-center gap-3'>
            <Link to='/dashboard' className={`text-sm font-medium ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}>
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
        <form onSubmit={handleCreateGroup} className='flex flex-col gap-3 md:flex-row'>
          <input value={groupName} onChange={(event) => setGroupName(event.target.value)} className={`flex-1 rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} placeholder='Create a new group like Trip to Goa' required />
          <button type='submit' disabled={isCreating} className='rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60'>
            {isCreating ? 'Creating...' : 'Create group'}
          </button>
        </form>
        {createError ? <p className='mt-3 text-sm text-rose-500'>{createError}</p> : null}
      </div>

      {loading ? (
        <div className={`rounded-[28px] border p-6 text-center text-sm ${surface}`}>Loading groups…</div>
      ) : error ? (
        <div className={`rounded-[28px] border p-6 text-center text-sm text-rose-500 ${surface}`}>{error}</div>
      ) : null}

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {groups.map((group) => {
          const memberCount = group.members?.length ?? 0;
          const ownerName = group.owner?.name || 'You';
          const totalExpense = Number(group.totalExpense || 0);
          return (
            <div key={group._id} className={`rounded-[28px] border p-5 shadow-sm ${surface}`}>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-100'} text-xl`}>👥</div>
                  <div>
                    <h3 className={`font-semibold ${strong}`}>{group.name}</h3>
                    <p className={`text-sm ${muted}`}>{memberCount} members</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>Active</span>
              </div>
              <div className='mt-6 flex items-end justify-between'>
                <div>
                  <p className={`text-sm ${muted}`}>Total spent</p>
                  <p className={`mt-1 text-xl font-semibold ${strong}`}>{formatCurrency(totalExpense)}</p>
                </div>
                <button onClick={() => setSelectedGroupId(group._id)} className={`rounded-2xl border px-3 py-2 text-sm font-medium ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  Open
                </button>
              </div>
              <p className={`mt-3 text-sm ${muted}`}>Owned by {ownerName}</p>
            </div>
          );
        })}
      </div>

      {selectedGroup ? (
        <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Group details</p>
              <h3 className={`mt-2 text-xl font-semibold ${strong}`}>{selectedGroup.name}</h3>
              <p className={`mt-1 text-sm ${muted}`}>{selectedGroup.description || 'Shared budget and expense activity for this group.'}</p>
            </div>
            <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              {selectedGroup.members?.length || 0} members • {formatCurrency(Number(selectedGroup.totalExpense || 0))}
            </div>
          </div>
          <div className='mt-5 grid gap-3 md:grid-cols-2'>
            {(selectedGroup.members || []).map((member) => (
              <div key={member.user?._id || member.user} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`font-medium ${strong}`}>{member.user?.name || 'Member'}</p>
                <p className={`mt-1 text-sm ${muted}`}>{member.role || 'Member'}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default GroupsPage;

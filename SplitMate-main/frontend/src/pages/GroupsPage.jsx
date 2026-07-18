import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { getSocket } from '../socket';

function formatCurrency(amount = 0) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function GroupsPage({ theme }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupName, setGroupName] = useState('');
  const [memberInviteInput, setMemberInviteInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupDetail, setGroupDetail] = useState(null);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groupBalances, setGroupBalances] = useState([]);
  const [groupSettlements, setGroupSettlements] = useState([]);
  const [isLoadingGroupDetail, setIsLoadingGroupDetail] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberBusy, setMemberBusy] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [memberSuccess, setMemberSuccess] = useState('');
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseBusy, setExpenseBusy] = useState(false);
  const [expenseError, setExpenseError] = useState('');
  const [expenseSuccess, setExpenseSuccess] = useState('');
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    description: '',
    groupId: '',
    paidBy: '',
    splitType: 'EQUAL',
  });
  const [customSplits, setCustomSplits] = useState([]);
  const [settlementForm, setSettlementForm] = useState({ from: '', to: '', amount: '', note: '' });
  const [settlementBusy, setSettlementBusy] = useState(false);
  const [settlementError, setSettlementError] = useState('');
  const [settlementSuccess, setSettlementSuccess] = useState('');

  const isDark = theme === 'dark';
  const surface = isDark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/90';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-white' : 'text-slate-900';

  const currentUserId = useMemo(() => currentUser?._id || currentUser?.id || '', [currentUser]);

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

  const loadCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setCurrentUser(response.data.data?.user || null);
    } catch {
      setCurrentUser(null);
    }
  };

  const loadGroupDetails = async (groupId) => {
    if (!groupId) return;
    try {
      setIsLoadingGroupDetail(true);
      const [groupResponse, expensesResponse, balancesResponse, settlementsResponse] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/expenses/group/${groupId}`),
        api.get(`/groups/${groupId}/balances`),
        api.get(`/settlements/groups/${groupId}/history`),
      ]);

      setGroupDetail(groupResponse.data.data || null);
      setGroupExpenses(expensesResponse.data.data || []);
      setGroupBalances(balancesResponse.data.data || []);
      setGroupSettlements(settlementsResponse.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to load group details.');
    } finally {
      setIsLoadingGroupDetail(false);
    }
  };

  useEffect(() => {
    loadGroups();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupDetails(selectedGroupId);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    const socket = getSocket();
    const handleRefresh = () => {
      loadGroups();
      if (selectedGroupId) {
        loadGroupDetails(selectedGroupId);
      }
    };

    socket.on('group:update', handleRefresh);
    return () => socket.off('group:update', handleRefresh);
  }, [selectedGroupId]);

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    setCreateError('');

    try {
      const members = memberInviteInput
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean)
        .map((email) => ({ email }));

      await api.post('/groups', {
        name: groupName.trim(),
        members,
      });
      setGroupName('');
      setMemberInviteInput('');
      await loadGroups();
    } catch (err) {
      setCreateError(err.response?.data?.error?.message || 'Could not create the group.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    setMemberBusy(true);
    setMemberError('');
    setMemberSuccess('');

    try {
      await api.post(`/groups/${selectedGroupId}/members`, { email: memberEmail.trim() });
      setMemberSuccess('Member added successfully.');
      setMemberEmail('');
      await loadGroups();
      await loadGroupDetails(selectedGroupId);
    } catch (err) {
      setMemberError(err.response?.data?.error?.message || 'Could not add the member.');
    } finally {
      setMemberBusy(false);
    }
  };

  const openExpenseModal = (expense = null) => {
    const groupMembers = selectedGroup?.members || [];
    const defaultGroupId = selectedGroupId || groups[0]?._id || '';

    setExpenseForm({
      title: expense?.title || '',
      amount: expense?.amount?.toString() || '',
      description: expense?.description || '',
      groupId: expense?.group || defaultGroupId,
      paidBy: expense?.paidBy?._id || expense?.paidBy || currentUserId,
      splitType: expense?.splitType || 'EQUAL',
    });
    setEditingExpenseId(expense?._id || null);
    setCustomSplits(
      groupMembers.map((member) => ({
        user: member.user?._id || member.user,
        amount: '',
        percentage: '',
      })),
    );
    setExpenseError('');
    setExpenseSuccess('');
    setExpenseModalOpen(true);
  };

  const buildSplits = () => {
    const groupMembers = selectedGroup?.members || [];

    if (!groupMembers.length) {
      throw new Error('Add members before creating an expense.');
    }

    if (expenseForm.splitType === 'EQUAL') {
      return groupMembers.map((member) => ({ user: member.user?._id || member.user }));
    }

    if (expenseForm.splitType === 'EXACT') {
      const total = customSplits.reduce((sum, split) => sum + Number(split.amount || 0), 0);
      if (Number(total.toFixed(2)) !== Number(expenseForm.amount)) {
        throw new Error('Exact split amounts must match the expense amount.');
      }

      return customSplits.map((split) => ({
        user: split.user,
        amount: Number(split.amount),
        percentage: 0,
      }));
    }

    if (expenseForm.splitType === 'PERCENTAGE') {
      const total = customSplits.reduce((sum, split) => sum + Number(split.percentage || 0), 0);
      if (Number(total.toFixed(2)) !== 100) {
        throw new Error('Percentages must total 100.');
      }

      return customSplits.map((split) => ({
        user: split.user,
        percentage: Number(split.percentage),
        amount: Number(((Number(expenseForm.amount) * Number(split.percentage)) / 100).toFixed(2)),
      }));
    }

    throw new Error('Unsupported split type.');
  };

  const handleSaveExpense = async (event) => {
    event.preventDefault();
    setExpenseBusy(true);
    setExpenseError('');
    setExpenseSuccess('');

    try {
      const splits = buildSplits();
      const payload = {
        groupId: expenseForm.groupId,
        title: expenseForm.title.trim(),
        description: expenseForm.description.trim(),
        amount: Number(expenseForm.amount),
        expenseType: 'OTHER',
        paidBy: expenseForm.paidBy || currentUserId,
        splitType: expenseForm.splitType,
        splits,
      };

      if (editingExpenseId) {
        await api.put(`/expenses/${editingExpenseId}`, payload);
      } else {
        await api.post('/expenses', payload);
      }

      setExpenseSuccess(editingExpenseId ? 'Expense updated successfully.' : 'Expense created successfully.');
      setExpenseModalOpen(false);
      await loadGroups();
      await loadGroupDetails(selectedGroupId);
    } catch (err) {
      setExpenseError(err.response?.data?.error?.message || err.message || 'Could not save the expense.');
    } finally {
      setExpenseBusy(false);
    }
  };

  const handleCreateSettlement = async (event) => {
    event.preventDefault();
    setSettlementBusy(true);
    setSettlementError('');
    setSettlementSuccess('');

    try {
      await api.post('/settlements', {
        groupId: selectedGroupId,
        from: settlementForm.from || currentUserId,
        to: settlementForm.to,
        amount: Number(settlementForm.amount),
        note: settlementForm.note.trim(),
      });

      setSettlementSuccess('Settlement recorded successfully.');
      setSettlementForm({ from: currentUserId, to: '', amount: '', note: '' });
      await loadGroups();
      await loadGroupDetails(selectedGroupId);
    } catch (err) {
      setSettlementError(err.response?.data?.error?.message || 'Could not record the settlement.');
    } finally {
      setSettlementBusy(false);
    }
  };

  const selectedGroup = groupDetail || groups.find((group) => group._id === selectedGroupId) || null;

  return (
    <div className='space-y-6'>
      <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Groups</p>
            <h2 className={`mt-2 text-2xl font-semibold ${strong}`}>Your shared circles</h2>
            <p className={`mt-2 text-sm leading-7 ${muted}`}>Create a group, add a friend, split a bill, and settle up without leaving the flow.</p>
          </div>
          <div className='flex items-center gap-3'>
            <Link to='/dashboard' className={`text-sm font-medium ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}>
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
        <form onSubmit={handleCreateGroup} className='flex flex-col gap-3'>
          <input value={groupName} onChange={(event) => setGroupName(event.target.value)} className={`rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} placeholder='Create a new group like Trip to Goa' required />
          <input value={memberInviteInput} onChange={(event) => setMemberInviteInput(event.target.value)} className={`rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} placeholder='Add existing users by email (optional, comma separated)' />
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
            <div className='flex flex-wrap gap-3'>
              <button type='button' onClick={() => openExpenseModal()} className='rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950'>Add expense</button>
              <button type='button' onClick={() => setExpenseModalOpen(false)} className={`rounded-2xl border px-4 py-2 text-sm ${isDark ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-700'}`}>Add member</button>
            </div>
          </div>

          <div className='mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.7fr]'>
            <div className='space-y-4'>
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
                  <div>
                    <p className={`text-sm font-semibold ${strong}`}>Add a new member</p>
                    <p className={`mt-1 text-sm ${muted}`}>Invite a teammate by email so they can join the split.</p>
                  </div>
                  <form onSubmit={handleAddMember} className='flex flex-col gap-2 sm:flex-row'>
                    <input value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} className={`rounded-2xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'}`} placeholder='friend@example.com' required />
                    <button type='submit' disabled={memberBusy} className='rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950'>Add</button>
                  </form>
                </div>
                {memberError ? <p className='mt-3 text-sm text-rose-500'>{memberError}</p> : null}
                {memberSuccess ? <p className='mt-3 text-sm text-emerald-500'>{memberSuccess}</p> : null}
              </div>

              <div className='grid gap-3 md:grid-cols-2'>
                {(selectedGroup.members || []).map((member) => (
                  <div key={member.user?._id || member.user} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                    <p className={`font-medium ${strong}`}>{member.user?.name || 'Member'}</p>
                    <p className={`mt-1 text-sm ${muted}`}>{member.role || 'Member'}</p>
                  </div>
                ))}
              </div>

              <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <div className='flex items-center justify-between'>
                  <p className={`text-sm font-semibold ${strong}`}>Expenses</p>
                  <span className={`text-sm ${muted}`}>{groupExpenses.length} recorded</span>
                </div>
                <div className='mt-3 space-y-3'>
                  {groupExpenses.length === 0 ? (
                    <p className={`text-sm ${muted}`}>No expenses yet. Create one to start the split.</p>
                  ) : (
                    groupExpenses.map((expense) => (
                      <div key={expense._id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-slate-950/50' : 'border-slate-100 bg-white'}`}>
                        <div className='flex items-start justify-between gap-3'>
                          <div>
                            <p className={`font-medium ${strong}`}>{expense.title}</p>
                            <p className={`mt-1 text-sm ${muted}`}>{expense.description || 'Shared bill'}</p>
                          </div>
                          <button type='button' onClick={() => openExpenseModal(expense)} className='text-sm font-semibold text-emerald-500'>Edit</button>
                        </div>
                        <div className='mt-2 flex items-center justify-between text-sm'>
                          <span className={`text-sm ${muted}`}>{formatCurrency(expense.amount)}</span>
                          <span className={`rounded-full px-2 py-1 text-xs ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>{expense.splitType}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`text-sm font-semibold ${strong}`}>Current balances</p>
                <div className='mt-3 space-y-3'>
                  {groupBalances.length === 0 ? (
                    <p className={`text-sm ${muted}`}>No balances yet — everything is settled.</p>
                  ) : (
                    groupBalances.map((balance) => (
                      <div key={balance._id} className={`rounded-2xl border px-3 py-3 ${isDark ? 'border-white/10 bg-slate-950/50' : 'border-slate-100 bg-white'}`}>
                        <p className={`text-sm font-medium ${strong}`}>{balance.lender?.name || 'Someone'} owes {balance.borrower?.name || 'Someone'}</p>
                        <p className={`mt-1 text-sm ${muted}`}>{formatCurrency(balance.amount)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`text-sm font-semibold ${strong}`}>Record a settlement</p>
                <form onSubmit={handleCreateSettlement} className='mt-3 space-y-3'>
                  <select value={settlementForm.from} onChange={(event) => setSettlementForm((current) => ({ ...current, from: event.target.value }))} className={`w-full rounded-2xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
                    {(selectedGroup.members || []).map((member) => (
                      <option key={member.user?._id || member.user} value={member.user?._id || member.user}>{member.user?.name || 'Member'}</option>
                    ))}
                  </select>
                  <select value={settlementForm.to} onChange={(event) => setSettlementForm((current) => ({ ...current, to: event.target.value }))} className={`w-full rounded-2xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
                    <option value=''>Select recipient</option>
                    {(selectedGroup.members || []).filter((member) => (member.user?._id || member.user) !== settlementForm.from).map((member) => (
                      <option key={member.user?._id || member.user} value={member.user?._id || member.user}>{member.user?.name || 'Member'}</option>
                    ))}
                  </select>
                  <input type='number' min='1' step='0.01' value={settlementForm.amount} onChange={(event) => setSettlementForm((current) => ({ ...current, amount: event.target.value }))} className={`w-full rounded-2xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'}`} placeholder='Amount' required />
                  <input value={settlementForm.note} onChange={(event) => setSettlementForm((current) => ({ ...current, note: event.target.value }))} className={`w-full rounded-2xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'}`} placeholder='Note' />
                  {settlementError ? <p className='text-sm text-rose-500'>{settlementError}</p> : null}
                  {settlementSuccess ? <p className='text-sm text-emerald-500'>{settlementSuccess}</p> : null}
                  <button type='submit' disabled={settlementBusy} className='w-full rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950'>Record settlement</button>
                </form>
              </div>

              <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`text-sm font-semibold ${strong}`}>Recent settlements</p>
                <div className='mt-3 space-y-2'>
                  {groupSettlements.length === 0 ? (
                    <p className={`text-sm ${muted}`}>No settlements yet.</p>
                  ) : (
                    groupSettlements.map((settlement) => (
                      <div key={settlement._id} className={`rounded-2xl border px-3 py-2 text-sm ${isDark ? 'border-white/10 bg-slate-950/50' : 'border-slate-100 bg-white'}`}>
                        <p>{settlement.from?.name || 'Someone'} paid {settlement.to?.name || 'Someone'} {formatCurrency(settlement.amount)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {expenseModalOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4'>
          <div className={`w-full max-w-2xl rounded-[28px] border p-6 shadow-2xl ${isDark ? 'border-white/10 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
            <div className='flex items-start justify-between'>
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.3em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{editingExpenseId ? 'Edit expense' : 'Add expense'}</p>
                <h3 className={`mt-2 text-xl font-semibold ${strong}`}>{editingExpenseId ? 'Adjust a shared cost' : 'Record a new shared cost'}</h3>
              </div>
              <button type='button' onClick={() => setExpenseModalOpen(false)} className={`text-sm ${muted}`}>Close</button>
            </div>
            <form onSubmit={handleSaveExpense} className='mt-6 space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className={`mb-2 block text-sm font-medium ${muted}`}>Title</label>
                  <input value={expenseForm.title} onChange={(event) => setExpenseForm((current) => ({ ...current, title: event.target.value }))} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} placeholder='Dinner at the beach' required />
                </div>
                <div>
                  <label className={`mb-2 block text-sm font-medium ${muted}`}>Amount</label>
                  <input type='number' min='1' step='0.01' value={expenseForm.amount} onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} placeholder='1200' required />
                </div>
              </div>
              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className={`mb-2 block text-sm font-medium ${muted}`}>Group</label>
                  <select value={expenseForm.groupId} onChange={(event) => setExpenseForm((current) => ({ ...current, groupId: event.target.value }))} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`mb-2 block text-sm font-medium ${muted}`}>Paid by</label>
                  <select value={expenseForm.paidBy} onChange={(event) => setExpenseForm((current) => ({ ...current, paidBy: event.target.value }))} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>
                    {(selectedGroup?.members || []).map((member) => (
                      <option key={member.user?._id || member.user} value={member.user?._id || member.user}>{member.user?.name || 'Member'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={`mb-2 block text-sm font-medium ${muted}`}>Split style</label>
                <select value={expenseForm.splitType} onChange={(event) => setExpenseForm((current) => ({ ...current, splitType: event.target.value }))} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>
                  <option value='EQUAL'>Equal split</option>
                  <option value='EXACT'>Custom amount split</option>
                  <option value='PERCENTAGE'>Custom percentage split</option>
                </select>
              </div>
              {(expenseForm.splitType === 'EXACT' || expenseForm.splitType === 'PERCENTAGE') && (selectedGroup?.members || []).length > 0 ? (
                <div className='space-y-2'>
                  {(selectedGroup?.members || []).map((member, index) => (
                    <div key={member.user?._id || member.user} className='flex items-center gap-2'>
                      <div className={`flex-1 rounded-2xl border px-3 py-2 text-sm ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>{member.user?.name || 'Member'}</div>
                      <input type='number' min='0' step='0.01' value={customSplits[index]?.amount || ''} onChange={(event) => {
                        const next = [...customSplits];
                        next[index] = { ...next[index], amount: event.target.value };
                        setCustomSplits(next);
                      }} className={`w-24 rounded-2xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} placeholder={expenseForm.splitType === 'EXACT' ? 'Amount' : 'Pct'} />
                    </div>
                  ))}
                </div>
              ) : null}
              <div>
                <label className={`mb-2 block text-sm font-medium ${muted}`}>Description</label>
                <textarea value={expenseForm.description} onChange={(event) => setExpenseForm((current) => ({ ...current, description: event.target.value }))} className={`min-h-[96px] w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} placeholder='Shared meal and drinks.' />
              </div>
              {expenseError ? <p className='text-sm text-rose-500'>{expenseError}</p> : null}
              {expenseSuccess ? <p className='text-sm text-emerald-500'>{expenseSuccess}</p> : null}
              <button type='submit' disabled={expenseBusy} className='w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60'>
                {expenseBusy ? 'Saving...' : editingExpenseId ? 'Update expense' : 'Save expense'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default GroupsPage;

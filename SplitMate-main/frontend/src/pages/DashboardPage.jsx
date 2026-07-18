import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../store/slices/dashboardSlice';
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

function DashboardPage({ theme }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth?.user);
    const { loading, error, summary, groups, recentExpenses, recentActivities, pendingBalances } =
        useSelector((state) => state.dashboard);

    const [groupsForForm, setGroupsForForm] = useState([]);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupBusy, setGroupBusy] = useState(false);
    const [groupError, setGroupError] = useState('');
    const [groupSuccess, setGroupSuccess] = useState('');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        amount: '',
        description: '',
        groupId: '',
    });
    const [expenseBusy, setExpenseBusy] = useState(false);
    const [expenseError, setExpenseError] = useState('');
    const [expenseSuccess, setExpenseSuccess] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        dispatch(fetchDashboard());
        api.get('/groups')
            .then((response) => setGroupsForForm(response.data.data || []))
            .catch(() => setGroupsForForm([]));
    }, [dispatch, navigate, user]);

    useEffect(() => {
        if (!expenseForm.groupId && groupsForForm.length > 0) {
            setExpenseForm((current) => ({ ...current, groupId: groupsForForm[0]._id }));
        }
    }, [expenseForm.groupId, groupsForForm]);

    const isDark = theme === 'dark';
    const surface = isDark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/90';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const strong = isDark ? 'text-white' : 'text-slate-900';

    const currentUserId = useMemo(() => user?._id || user?.id || localStorage.getItem('userId'), [user]);
    const safeGroups = groups || [];
    const safeExpenses = recentExpenses || [];
    const safeActivities = recentActivities || [];
    const safeBalances = pendingBalances || [];

    const groupBalanceById = safeBalances.reduce((acc, b) => {
        const gid = b.group?._id;
        if (!gid) return acc;
        if (b.lender?._id === currentUserId) {
            acc[gid] = (acc[gid] || 0) + b.amount;
        } else if (b.borrower?._id === currentUserId) {
            acc[gid] = (acc[gid] || 0) - b.amount;
        }
        return acc;
    }, {});

    const groupLastActivityById = safeActivities.reduce((acc, a) => {
        const gid = a.group?._id || a.group;
        if (!gid) return acc;
        if (!acc[gid] || new Date(a.createdAt) > new Date(acc[gid])) {
            acc[gid] = a.createdAt;
        }
        return acc;
    }, {});

    const expenseAmountById = safeExpenses.reduce((acc, exp) => {
        acc[exp._id] = exp.amount;
        return acc;
    }, {});

    const groupNameById = safeGroups.reduce((acc, g) => {
        acc[g._id] = g.name;
        return acc;
    }, {});

    const activityFeed = safeActivities.map((item) => {
        const expenseId = item.metadata?.expenseId;
        const amount = expenseId ? expenseAmountById[expenseId] : undefined;
        const groupName =
            typeof item.group === 'string' ? groupNameById[item.group] : item.group?.name;
        return { ...item, amount, groupName };
    });

    const selectedGroupForExpense = groupsForForm.find((group) => group._id === expenseForm.groupId) || null;

    const handleCreateGroup = async (event) => {
        event.preventDefault();
        setGroupBusy(true);
        setGroupError('');
        setGroupSuccess('');

        try {
            await api.post('/groups', { name: groupName.trim() });
            setGroupSuccess('Group created successfully.');
            setGroupName('');
            setIsGroupModalOpen(false);
            dispatch(fetchDashboard());
            const response = await api.get('/groups');
            setGroupsForForm(response.data.data || []);
        } catch (err) {
            setGroupError(err.response?.data?.error?.message || 'Could not create the group.');
        } finally {
            setGroupBusy(false);
        }
    };

    const handleCreateExpense = async (event) => {
        event.preventDefault();
        setExpenseBusy(true);
        setExpenseError('');
        setExpenseSuccess('');

        if (!selectedGroupForExpense) {
            setExpenseError('Select a group to add an expense.');
            setExpenseBusy(false);
            return;
        }

        const amount = Number(expenseForm.amount);
        if (!expenseForm.title.trim() || !Number.isFinite(amount) || amount <= 0) {
            setExpenseError('Enter a valid title and amount.');
            setExpenseBusy(false);
            return;
        }

        try {
            const splits = (selectedGroupForExpense.members || []).map((member) => ({
                user: member.user?._id || member.user,
            }));

            await api.post('/expenses', {
                groupId: selectedGroupForExpense._id,
                title: expenseForm.title.trim(),
                description: expenseForm.description.trim(),
                amount,
                expenseType: 'OTHER',
                paidBy: currentUserId,
                splitType: 'EQUAL',
                splits,
            });

            setExpenseSuccess('Expense created successfully.');
            setExpenseForm({ title: '', amount: '', description: '', groupId: selectedGroupForExpense._id });
            setIsExpenseModalOpen(false);
            dispatch(fetchDashboard());
            const response = await api.get('/groups');
            setGroupsForForm(response.data.data || []);
        } catch (err) {
            setExpenseError(err.response?.data?.error?.message || 'Could not create the expense.');
        } finally {
            setExpenseBusy(false);
        }
    };

    if (!user || (loading && !summary?.totalExpenses)) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-slate-950 text-slate-300'>
                Loading dashboard…
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-slate-950 text-rose-400'>
                {error}
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <section className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
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
                        {summary.netBalance >= 0 ? 'Ahead' : 'Behind'} • {summary.totalGroups ?? 0}{' '}
                        group{summary.totalGroups === 1 ? '' : 's'} • {safeBalances.length} pending{' '}
                        {safeBalances.length === 1 ? 'balance' : 'balances'}
                    </div>
                </div>
            </section>

            <div className='flex flex-wrap gap-3'>
                <button
                    type='button'
                    onClick={() => {
                        setExpenseError('');
                        setExpenseSuccess('');
                        setIsExpenseModalOpen(true);
                    }}
                    className='rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400'
                >
                    + Add expense
                </button>
                <button
                    type='button'
                    onClick={() => {
                        setGroupError('');
                        setGroupSuccess('');
                        setIsGroupModalOpen(true);
                    }}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}`}
                >
                    + Create group
                </button>
            </div>

            <div className='grid gap-6 lg:grid-cols-[1.6fr_0.9fr]'>
                <section className='space-y-6'>
                    <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
                        <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                            <div>
                                <p className={`text-sm uppercase tracking-[0.28em] ${muted}`}>Overview</p>
                                <h2 className={`mt-2 text-2xl font-semibold sm:text-3xl ${strong}`}>
                                    {summary.netBalance >= 0 ? (
                                        <>
                                            You're owed{' '}
                                            <span className='text-emerald-500'>{formatCurrency(summary.netBalance)}</span>
                                        </>
                                    ) : (
                                        <>
                                            You owe{' '}
                                            <span className='text-rose-500'>{formatCurrency(Math.abs(summary.netBalance))}</span>
                                        </>
                                    )}
                                </h2>
                                <p className={`mt-2 max-w-xl text-sm leading-7 ${muted}`}>
                                    {summary.netBalance >= 0
                                        ? 'Your balances are healthy and your next split is ready to post.'
                                        : 'Settle up when you get a chance — a few people are waiting on you.'}
                                </p>
                            </div>
                        </div>

                        <div className='mt-6 grid gap-4 sm:grid-cols-3'>
                            {[
                                { label: 'Total spent', value: formatCurrency(summary.totalSpent) },
                                { label: 'You owe', value: formatCurrency(summary.youOwe) },
                                { label: 'You’re owed', value: formatCurrency(summary.youAreOwed) },
                            ].map((item) => (
                                <div key={item.label} className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <p className={`text-sm ${muted}`}>{item.label}</p>
                                    <p className={`mt-2 text-xl font-semibold ${strong}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className={`text-sm uppercase tracking-[0.28em] ${muted}`}>Groups</p>
                                <h3 className={`mt-1 text-xl font-semibold ${strong}`}>Your shared spaces</h3>
                            </div>
                            <button type='button' onClick={() => navigate('/groups')} className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                View all
                            </button>
                        </div>

                        <div className='mt-5 space-y-3'>
                            {safeGroups.length === 0 ? (
                                <div className={`rounded-2xl border px-4 py-6 text-center text-sm ${isDark ? 'border-white/10 bg-white/5 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                                    No groups yet — create one to start splitting expenses.
                                </div>
                            ) : (
                                safeGroups.map((group) => {
                                    const balance = groupBalanceById[group._id] || 0;
                                    const memberCount = group.memberCount ?? group.members?.length ?? 0;
                                    const lastActivityAt = groupLastActivityById[group._id] || group.createdAt;
                                    return (
                                        <div key={group._id} className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                                            <div className='flex items-center gap-3'>
                                                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark ? 'bg-white/10' : 'bg-white'} text-xl`}>👥</div>
                                                <div>
                                                    <p className={`font-semibold ${strong}`}>{group.name}</p>
                                                    <p className={`text-sm ${muted}`}>{memberCount} member{memberCount === 1 ? '' : 's'}</p>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <p className={`text-sm font-semibold ${balance === 0 ? muted : balance > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {balance === 0 ? 'Settled' : `${balance > 0 ? '+' : '-'}${formatCurrency(Math.abs(balance))}`}
                                                </p>
                                                <p className={`text-xs ${muted}`}>
                                                    {lastActivityAt ? `Updated ${formatRelativeTime(lastActivityAt)}` : 'No activity yet'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </section>

                <aside className='space-y-6'>
                    <div className={`rounded-[32px] border p-6 shadow-sm ${surface}`}>
                        <p className={`text-sm uppercase tracking-[0.28em] ${muted}`}>Balances</p>
                        <div className='mt-5 space-y-3'>
                            {safeBalances.length === 0 ? (
                                <p className={`text-sm ${muted}`}>All settled up — nice work.</p>
                            ) : (
                                safeBalances.map((b) => {
                                    const youAreLender = b.lender?._id === currentUserId;
                                    const otherPerson = youAreLender ? b.borrower : b.lender;
                                    const otherPersonName = otherPerson?.name || 'Unknown';
                                    const widthPct = summary.totalSpent ? Math.min(100, (b.amount / summary.totalSpent) * 100) : 0;
                                    return (
                                        <div key={b._id} className='flex items-center gap-3'>
                                            <span className={`w-24 shrink-0 truncate text-sm ${muted}`}>{otherPersonName}</span>
                                            <div className={`h-2 flex-1 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                                                <div className={`h-full rounded-full ${youAreLender ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-rose-500 to-orange-400'}`} style={{ width: `${widthPct}%` }} />
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
                        <div className='mt-5 space-y-3'>
                            {activityFeed.length === 0 ? (
                                <p className={`text-sm ${muted}`}>No recent activity yet.</p>
                            ) : (
                                activityFeed.map((item) => (
                                    <div key={item._id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                                        <div className='flex items-center justify-between gap-3'>
                                            <p className={`truncate text-sm font-medium ${strong}`}>{item.description}</p>
                                            {item.amount != null && <span className='shrink-0 text-xs text-emerald-500'>{formatCurrency(item.amount)}</span>}
                                        </div>
                                        <p className={`mt-1 text-sm ${muted}`}>
                                            {item.groupName ? `${item.groupName} • ` : ''}{formatRelativeTime(item.createdAt)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            {isGroupModalOpen ? (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4'>
                    <div className={`w-full max-w-md rounded-[28px] border p-6 shadow-2xl ${isDark ? 'border-white/10 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
                        <div className='flex items-start justify-between'>
                            <div>
                                <p className={`text-sm font-semibold uppercase tracking-[0.3em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Create a group</p>
                                <h3 className={`mt-2 text-xl font-semibold ${strong}`}>Start a new shared space</h3>
                            </div>
                            <button type='button' onClick={() => setIsGroupModalOpen(false)} className={`text-sm ${muted}`}>Close</button>
                        </div>
                        <form onSubmit={handleCreateGroup} className='mt-6 space-y-4'>
                            <div>
                                <label className={`mb-2 block text-sm font-medium ${muted}`}>Group name</label>
                                <input value={groupName} onChange={(event) => setGroupName(event.target.value)} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} placeholder='Trip to Goa' required />
                            </div>
                            {groupError ? <p className='text-sm text-rose-500'>{groupError}</p> : null}
                            {groupSuccess ? <p className='text-sm text-emerald-500'>{groupSuccess}</p> : null}
                            <button type='submit' disabled={groupBusy} className='w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60'>
                                {groupBusy ? 'Creating...' : 'Create group'}
                            </button>
                        </form>
                    </div>
                </div>
            ) : null}

            {isExpenseModalOpen ? (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4'>
                    <div className={`w-full max-w-lg rounded-[28px] border p-6 shadow-2xl ${isDark ? 'border-white/10 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
                        <div className='flex items-start justify-between'>
                            <div>
                                <p className={`text-sm font-semibold uppercase tracking-[0.3em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Add expense</p>
                                <h3 className={`mt-2 text-xl font-semibold ${strong}`}>Record a new shared cost</h3>
                            </div>
                            <button type='button' onClick={() => setIsExpenseModalOpen(false)} className={`text-sm ${muted}`}>Close</button>
                        </div>
                        <form onSubmit={handleCreateExpense} className='mt-6 space-y-4'>
                            <div>
                                <label className={`mb-2 block text-sm font-medium ${muted}`}>Group</label>
                                <select value={expenseForm.groupId} onChange={(event) => setExpenseForm((current) => ({ ...current, groupId: event.target.value }))} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>
                                    {groupsForForm.map((group) => (
                                        <option key={group._id} value={group._id}>{group.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={`mb-2 block text-sm font-medium ${muted}`}>Title</label>
                                <input value={expenseForm.title} onChange={(event) => setExpenseForm((current) => ({ ...current, title: event.target.value }))} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} placeholder='Dinner at the beach' required />
                            </div>
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <div>
                                    <label className={`mb-2 block text-sm font-medium ${muted}`}>Amount</label>
                                    <input type='number' min='1' step='0.01' value={expenseForm.amount} onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} placeholder='1200' required />
                                </div>
                                <div>
                                    <label className={`mb-2 block text-sm font-medium ${muted}`}>Split type</label>
                                    <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-white/10 bg-slate-950 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>Equal split</div>
                                </div>
                            </div>
                            <div>
                                <label className={`mb-2 block text-sm font-medium ${muted}`}>Description</label>
                                <textarea value={expenseForm.description} onChange={(event) => setExpenseForm((current) => ({ ...current, description: event.target.value }))} className={`min-h-[96px] w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} placeholder='Shared meal and drinks.' />
                            </div>
                            <p className={`text-sm ${muted}`}>This will split equally across {selectedGroupForExpense?.members?.length || 0} member{selectedGroupForExpense?.members?.length === 1 ? '' : 's'}.</p>
                            {expenseError ? <p className='text-sm text-rose-500'>{expenseError}</p> : null}
                            {expenseSuccess ? <p className='text-sm text-emerald-500'>{expenseSuccess}</p> : null}
                            <button type='submit' disabled={expenseBusy} className='w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60'>
                                {expenseBusy ? 'Creating...' : 'Save expense'}
                            </button>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default DashboardPage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { fetchDashboard } from '../store/slices/dashboardSlice'

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const { user, accessToken } = response.data.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('userId', user.id);

                dispatch(
                    login({
                        user,
                        accessToken,
                    })
                );
                console.log(response);
                try {
                    console.log('Before dashboard');

                    const result = await dispatch(fetchDashboard());

                    console.log('After dashboard');
                    console.log(result);
                } catch (err) {
                    console.error('Dispatch failed:', err);
                }

                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Unable to sign in.');
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100'>
            <div className='mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row'>
                <aside className='flex flex-col justify-between bg-slate-950/80 px-8 py-10 text-slate-100 lg:w-[460px] lg:px-12'>
                    <div>
                        <div className='flex items-center gap-3'>
                            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-semibold text-slate-950'>
                                S
                            </div>
                            <div>
                                <p className='text-xs uppercase tracking-[0.32em] text-emerald-400'>
                                    SplitMate
                                </p>
                                <p className='text-lg font-semibold'>Expense Tracker</p>
                            </div>
                        </div>

                        <h1 className='mt-10 text-4xl font-semibold leading-tight'>
                            Split expenses.
                            <br />
                            Not friendships.
                        </h1>
                        <p className='mt-4 max-w-md text-base leading-7 text-slate-300'>
                            Keep every shared trip, household, and lunch bill clear. Track what was
                            paid, who owes what, and settle up fast.
                        </p>

                        <div className='mt-8 space-y-4'>
                            {[
                                'Real-time balances for every group',
                                'Fair splitting with no messy spreadsheets',
                                'Instant reminders when someone settles up',
                            ].map((item) => (
                                <div
                                    key={item}
                                    className='flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3'
                                >
                                    <span className='mt-0.5 text-lg text-emerald-400'>•</span>
                                    <span className='text-sm text-slate-300'>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='mt-8 rounded-2xl border border-white/10 bg-white/10 p-4'>
                        <p className='text-sm font-semibold text-white'>
                            “Finally, everyone pays their fair share.”
                        </p>
                        <p className='mt-1 text-sm text-slate-300'>Jordan • Tokyo Trip 2025</p>
                    </div>
                </aside>

                <main className='flex flex-1 items-center justify-center bg-slate-50/95 px-4 py-10 sm:px-6 lg:px-10'>
                    <div className='w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl'>
                        <div className='mb-8'>
                            <p className='text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600'>
                                Welcome back
                            </p>
                            <h2 className='mt-2 text-3xl font-semibold text-slate-900'>
                                Sign in to your account
                            </h2>
                            <p className='mt-2 text-sm text-slate-600'>
                                Use your email and password to continue tracking shared costs.
                            </p>
                        </div>

                        <form className='space-y-4' onSubmit={handleSubmit}>
                            <div>
                                <label className='mb-2 block text-sm font-medium text-slate-700'>
                                    Email
                                </label>
                                <input
                                    className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                                    type='email'
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder='alex@example.com'
                                    required
                                />
                            </div>
                            <div>
                                <label className='mb-2 block text-sm font-medium text-slate-700'>
                                    Password
                                </label>
                                <input
                                    className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                                    type='password'
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder='••••••••'
                                    required
                                />
                            </div>

                            {error ? <p className='text-sm text-rose-600'>{error}</p> : null}

                            <button
                                className='w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800'
                                type='submit'
                            >
                                Sign in
                            </button>
                        </form>

                        <div className='mt-6 flex items-center justify-between text-sm text-slate-600'>
                            <button className='font-medium text-emerald-600 hover:text-emerald-700'>
                                Forgot password?
                            </button>
                            <Link
                                to='/signup'
                                className='font-medium text-slate-900 hover:text-slate-700'
                            >
                                Create account
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default LoginPage;

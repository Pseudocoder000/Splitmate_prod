import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const stats = [
  { value: '3x', label: 'faster settlements' },
  { value: '100%', label: 'clear shared balances' },
  { value: '24/7', label: 'group visibility' },
];

const features = [
  {
    title: 'Smart group tracking',
    body: 'Create shared circles for trips, households, and team events and keep every contribution visible.',
  },
  {
    title: 'Instant expense splits',
    body: 'Log a bill once and let SplitMate distribute it fairly across members without spreadsheets.',
  },
  {
    title: 'Live activity timeline',
    body: 'Follow updates in real time, so nobody is left guessing who paid what or what is still pending.',
  },
];

const steps = [
  {
    title: 'Create a group',
    body: 'Bring together friends, roommates, or coworkers in a dedicated shared space.',
  },
  {
    title: 'Add expenses',
    body: 'Record meals, travel, rents, and bills in seconds with clean, modern forms.',
  },
  {
    title: 'Settle in one tap',
    body: 'See exactly who owes what and settle up confidently without awkward reminders.',
  },
];

function LandingPage() {
  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-100'>
      <header className='mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-3'>
          <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-semibold text-slate-950'>S</div>
          <div>
            <p className='text-xs uppercase tracking-[0.32em] text-emerald-400'>SplitMate</p>
            <p className='text-sm text-slate-300'>Expense tracker</p>
          </div>
        </div>
        <div className='flex items-center gap-2 sm:gap-3'>
          <Link to='/login' className='rounded-full border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10'>Log in</Link>
          <Link to='/signup' className='rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400'>Get started</Link>
        </div>
      </header>

      <main className='mx-auto flex max-w-7xl flex-col px-4 pb-16 sm:px-6 lg:px-8'>
        <section className='grid gap-8 rounded-[36px] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur xl:grid-cols-[1.05fr_0.95fr] xl:p-10'>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className='flex flex-col justify-center'>
            <span className='mb-4 inline-flex w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300'>Classic, calm, and built for real groups</span>
            <h1 className='max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl'>Make shared expenses feel effortless.</h1>
            <p className='mt-5 max-w-xl text-lg leading-8 text-slate-300'>SplitMate turns everyday shared bills into a polished experience with clear balances, elegant activity updates, and zero spreadsheet stress.</p>
            <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
              <Link to='/signup' className='rounded-2xl bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400'>Start free</Link>
              <Link to='/login' className='rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/10'>See live dashboard</Link>
            </div>
            <div className='mt-8 grid gap-3 sm:grid-cols-3'>
              {stats.map((item) => (
                <div key={item.label} className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-2xl font-semibold text-white'>{item.value}</p>
                  <p className='mt-1 text-sm text-slate-400'>{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className='rounded-[32px] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/20 sm:p-6'>
            <div className='rounded-[24px] border border-white/10 bg-slate-900/80 p-4 sm:p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm uppercase tracking-[0.3em] text-emerald-400'>Overview</p>
                  <h2 className='mt-2 text-xl font-semibold text-white'>Shared trip, one calm view</h2>
                </div>
                <div className='rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300'>Live</div>
              </div>
              <div className='mt-5 space-y-3'>
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-semibold text-white'>Goa trip</p>
                      <p className='mt-1 text-sm text-slate-400'>4 members • 3 recent expenses</p>
                    </div>
                    <span className='text-sm font-semibold text-emerald-400'>+₹3,200</span>
                  </div>
                </div>
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-semibold text-white'>Rent split</p>
                      <p className='mt-1 text-sm text-slate-400'>3 members • due today</p>
                    </div>
                    <span className='text-sm font-semibold text-rose-400'>-₹1,800</span>
                  </div>
                </div>
                <div className='rounded-2xl border border-emeral d-400/20 bg-emerald-400/10 p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-semibold text-white'>Activity feed</p>
                      <p className='mt-1 text-sm text-slate-300'>A new dinner expense was added 10 min ago</p>
                    </div>
                    <span className='text-sm font-semibold text-emerald-300'>Updated</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className='mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]'>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className='rounded-[30px] border border-white/10 bg-slate-900/60 p-6'>
            <p className='text-sm uppercase tracking-[0.3em] text-emerald-400'>Why teams and friends love it</p>
            <h2 className='mt-3 text-3xl font-semibold text-white'>A polished experience for every shared plan.</h2>
            <p className='mt-4 text-base leading-8 text-slate-300'>Designed to feel familiar, elegant, and trustworthy, SplitMate keeps the mechanics simple while still offering the power of a full expense platform.</p>
          </motion.div>

          <div className='grid gap-4 md:grid-cols-3'>
            {features.map((feature, index) => (
              <motion.article key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.1 }} className='rounded-[24px] border border-white/10 bg-slate-900/60 p-5'>
                <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-lg text-emerald-300'>0{index + 1}</div>
                <h3 className='text-lg font-semibold text-white'>{feature.title}</h3>
                <p className='mt-2 text-sm leading-7 text-slate-400'>{feature.body}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className='mt-8 rounded-[32px] border border-white/10 bg-slate-900/60 p-6 sm:p-8'>
          <div className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr]'>
            <div>
              <p className='text-sm uppercase tracking-[0.3em] text-emerald-400'>How it works</p>
              <h2 className='mt-3 text-3xl font-semibold text-white'>Three effortless steps from setup to settlement.</h2>
            </div>
            <div className='grid gap-4 md:grid-cols-3'>
              {steps.map((step, index) => (
                <motion.div key={step.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08 }} className='rounded-[24px] border border-white/10 bg-white/5 p-4'>
                  <p className='text-sm font-semibold text-emerald-300'>Step {index + 1}</p>
                  <h3 className='mt-2 font-semibold text-white'>{step.title}</h3>
                  <p className='mt-2 text-sm leading-7 text-slate-400'>{step.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className='mt-8 rounded-[32px] border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-8 text-center'>
          <h2 className='text-3xl font-semibold text-white'>Make your shared plans feel effortless.</h2>
          <p className='mx-auto mt-3 max-w-2xl text-base leading-8 text-slate-300'>Join SplitMate and give your household, travel crew, or team a faster, calmer way to manage shared expenses.</p>
          <div className='mt-6 flex flex-col justify-center gap-3 sm:flex-row'>
            <Link to='/signup' className='rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400'>Create account</Link>
            <Link to='/login' className='rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10'>Already have an account?</Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

export default LandingPage;

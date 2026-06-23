import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, BrainCircuit, FileCheck2, Mic, ShieldCheck, TrendingUp } from 'lucide-react';

const features = [
  { icon: FileCheck2, title: 'Resume + ATS Analyzer', text: 'Upload PDF/DOCX, extract skills, and get ATS keyword scoring.' },
  { icon: BrainCircuit, title: 'Skill Gap Intelligence', text: 'Compare your profile with roles, companies, and job descriptions.' },
  { icon: Mic, title: 'AI Mock Interviews', text: 'Practice technical, HR, behavioral, and mixed interviews.' },
  { icon: Bot, title: 'Career Chatbot', text: 'Ask for resume help, coding guidance, roadmap advice, and interview prep.' },
  { icon: TrendingUp, title: 'Readiness Dashboard', text: 'Track resume score, ATS score, skill match, streaks, and interview scores.' },
  { icon: ShieldCheck, title: 'Admin Control', text: 'Manage users, skills, question bank, trends, and analytics.' }
];

export default function Landing() {
  return (
    <div className="min-h-screen px-4 py-6 dark:text-slate-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/60 bg-white/70 px-5 py-4 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-600 p-3 text-white">
            <BrainCircuit />
          </div>
          <div>
            <p className="text-lg font-black">Interview AI</p>
            <p className="text-xs text-slate-500">Placement readiness platform</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/admin-login" className="btn-secondary hidden sm:inline-flex">Admin</Link>
          <Link to="/register" className="btn-primary">Start free</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-4 inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-100">
            Built for students, placements, and real interview prep
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-7xl">
            Your full placement prep, in one AI dashboard.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Resume analysis, ATS score, skill gaps, learning roadmap, mock interview, chatbot, and admin control — bundled into one full-stack MERN product.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">
              Create account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary">View dashboard</Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[2rem] p-5">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Placement Readiness</p>
                <p className="text-5xl font-black">86%</p>
              </div>
              <div className="rounded-2xl bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-300">+18 this week</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {['ATS 91', 'Resume 84', 'Skill Match 78', 'Interview 88'].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 p-4">
                  <p className="font-bold">{item}</p>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-4/5 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 pb-12 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="glass rounded-3xl p-6">
            <feature.icon className="text-brand-600" />
            <h3 className="mt-4 text-lg font-black">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

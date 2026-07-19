import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, BrainCircuit, FileCheck2, Mic, ShieldCheck, TrendingUp, Sparkles, Star } from 'lucide-react';

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
    <div className="min-h-screen bg-background dark:bg-[#0B0F19] text-slate-600 dark:text-slate-350 antialiased">
      {/* Top Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-slate-200/80 bg-white/80 dark:bg-slate-900/80 px-6 py-4 backdrop-blur-md dark:border-slate-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary p-2.5 text-white shadow-md shadow-blue-500/20">
            <BrainCircuit size={20} />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white leading-none">Interview AI</p>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Corporate Placement Ready</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary transition px-3 py-2">
            Login
          </Link>
          <Link to="/admin-login" className="text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary transition px-3 py-2 hidden sm:inline-block">
            Admin
          </Link>
          <Link to="/register" className="btn-primary py-2.5 px-5">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 py-20 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-primary dark:bg-blue-900/20 dark:text-blue-300">
            <Sparkles size={12} className="text-blue-600 dark:text-blue-400" />
            <span>Smart Placement Readiness Cockpit</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
            Supercharge your career readiness with AI.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-slate-500 dark:text-slate-400 max-w-xl">
            A comprehensive, premium MERN preparation cockpit. Analyze resumes, discover critical skill gaps, auto-generate roadmap guides, and practice mock interviews in real-time.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/register" className="btn-primary gap-2 px-6 py-3.5 shadow-lg shadow-blue-500/20">
              Create Free Account <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary px-6 py-3.5">
              Access Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 max-w-md">
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">100%</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Placement Guided</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">Instant</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">ATS Scoring Feedback</p>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
          </div>
        </motion.div>

        {/* Visual Mockup Card */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.15 }} className="w-full">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden">
            {/* Header mockup */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs text-slate-400 font-bold dark:text-slate-500 uppercase tracking-widest">Candidate Analytics</span>
            </div>

            {/* Inner Dark Widget */}
            <div className="rounded-xl bg-[#0F172A] p-6 text-white relative">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Overall Placement Readiness</p>
                  <p className="text-4xl font-extrabold mt-1 text-[#F8FAFC]">86%</p>
                </div>
                <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                  +18% this month
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { name: 'ATS Match Score', val: '91%', width: 'w-[91%]', color: 'from-blue-500 to-indigo-500' },
                  { name: 'Resume Strength', val: '84%', width: 'w-[84%]', color: 'from-cyan-500 to-blue-500' },
                  { name: 'Skill Match Ratio', val: '78%', width: 'w-[78%]', color: 'from-blue-500 to-cyan-500' },
                  { name: 'Interview IQ Score', val: '88%', width: 'w-[88%]', color: 'from-indigo-500 to-blue-500' }
                ].map((item) => (
                  <div key={item.name} className="rounded-xl bg-white/5 border border-white/5 p-4 transition hover:bg-white/10">
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <span className="text-slate-300">{item.name}</span>
                      <span className="text-[#F8FAFC]">{item.val}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${item.color} ${item.width}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Designed for professional preparation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Every feature is architected to give you the corporate advantage, matching parameters set by premium HR and development standards.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div 
              key={feature.title} 
              initial={{ opacity: 0, y: 16 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex flex-col group"
            >
              <div className="rounded-xl bg-blue-50 p-3 text-primary dark:bg-blue-900/10 dark:text-blue-400 w-fit group-hover:scale-105 transition-transform duration-300">
                <feature.icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 flex-1">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

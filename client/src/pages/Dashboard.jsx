import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, YAxis } from 'recharts';
import { 
  Clock, Terminal, Sparkles, TrendingUp, ChevronRight, Brain, FileText, 
  Map, MessageSquare, Award, ArrowUpRight, Flame, Target, CheckCircle2 
} from 'lucide-react';
import MetricCard from '../components/MetricCard.jsx';
import { api } from '../services/api.js';

const fallbackRadar = [
  { category: 'Frontend', score: 80 },
  { category: 'Backend', score: 65 },
  { category: 'DBMS', score: 70 },
  { category: 'DSA', score: 45 },
  { category: 'Interview', score: 60 }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard')).data
  });

  const metrics = data?.metrics || {};
  const radarData = data?.latestSkillGap?.radarData?.length ? data.latestSkillGap.radarData : fallbackRadar;

  const barData = [
    { name: 'Resume Score', score: metrics.resumeScore || 0, color: '#2563EB' },
    { name: 'ATS Match', score: metrics.atsScore || 0, color: '#3B82F6' },
    { name: 'Skill Match', score: metrics.skillMatchScore || 0, color: '#06B6D4' },
    { name: 'Interview IQ', score: metrics.interviewScore || 0, color: '#10B981' }
  ];

  const quickActions = [
    { label: 'Start Mock Interview', path: '/app/interview', primary: true },
    { label: 'Upload Resume', path: '/app/resume', primary: false },
    { label: 'Continue Learning', path: '/app/roadmap', primary: false },
    { label: 'View Roadmap', path: '/app/roadmap', primary: false }
  ];

  return (
    <div className="space-y-8 animate-fade-in p-2 md:p-4 max-w-[1600px] mx-auto">
      
      {/* LinkedIn Learning inspired Hero Welcome Section */}
      <div 
        className="relative rounded-2xl overflow-hidden p-8 md:p-12 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-8 border transition duration-300"
        style={{ backgroundColor: '#0D1B2A', borderColor: '#274B68', color: '#F5F7FA' }}
      >
        {/* Decorative Grid Layer */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="space-y-6 max-w-xl z-10">
          <div className="space-y-2">
            <span 
              className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full text-blue-100"
              style={{ backgroundColor: '#1A3554', color: '#66E0FF' }}
            >
              Welcome back
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight" style={{ color: '#F5F7FA' }}>
              Grow your career skill architecture.
            </h1>
            <p className="text-sm font-medium leading-relaxed max-w-md pt-1" style={{ color: '#A8BBCF' }}>
              Elevate your corporate readiness. Review details on missing capabilities, ATS match percentage, and customized roadmap tasks below.
            </p>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {quickActions.map((act) => (
              <button 
                key={act.label}
                onClick={() => navigate(act.path)}
                className="text-xs font-bold px-4 py-2.5 rounded-lg transition-all duration-300 active:scale-95 border"
                style={
                  act.primary 
                    ? { backgroundColor: '#34D1BF', color: '#0D1B2A', borderColor: '#34D1BF' } 
                    : { backgroundColor: '#132A46', color: '#F5F7FA', borderColor: '#274B68' }
                }
              >
                {act.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flat SVG Vector Illustration */}
        <div className="w-full md:w-[320px] shrink-0 z-10 hidden sm:block">
          <svg viewBox="0 0 320 200" className="w-full h-auto drop-shadow-md">
            <rect x="20" y="20" width="280" height="160" rx="12" fill="#132A46" stroke="#274B68" strokeWidth="1.5" />
            {/* Screen mockup */}
            <rect x="40" y="40" width="240" height="120" rx="6" fill="#0D1B2A" />
            <circle cx="50" cy="50" r="3" fill="#EF4444" />
            <circle cx="58" cy="50" r="3" fill="#F59E0B" />
            <circle cx="66" cy="50" r="3" fill="#63E08A" />
            
            {/* Visualizing data nodes */}
            <line x1="80" y1="120" x2="140" y2="70" stroke="#34D1BF" strokeWidth="3" strokeLinecap="round" />
            <line x1="140" y1="70" x2="200" y2="100" stroke="#4EC5D4" strokeWidth="3" strokeLinecap="round" />
            <line x1="200" y1="100" x2="240" y2="60" stroke="#66E0FF" strokeWidth="3" strokeLinecap="round" />
            
            <circle cx="80" cy="120" r="6" fill="#34D1BF" />
            <circle cx="140" cy="70" r="6" fill="#57E3C7" />
            <circle cx="200" cy="100" r="6" fill="#4EC5D4" />
            <circle cx="240" cy="60" r="6" fill="#66E0FF" />
            
            {/* Text lines */}
            <rect x="80" y="145" width="60" height="6" rx="3" fill="#1A3554" />
            <rect x="150" y="145" width="90" height="6" rx="3" fill="#1A3554" />
          </svg>
        </div>

      </div>

      {/* Progress Metric Widgets Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <MetricCard title="Aura Score" value={isLoading ? '--' : metrics.resumeScore || 0} suffix="%" helper="Resume Quality" />
        <MetricCard title="ATS Match" value={isLoading ? '--' : metrics.atsScore || 0} suffix="%" helper="Keyword Extraction" />
        <MetricCard title="Readiness" value={isLoading ? '--' : metrics.placementReadiness || 0} suffix="%" helper="Total Preparedness" />
        <MetricCard title="Vibe Check" value={isLoading ? '--' : metrics.interviewScore || 0} suffix="%" helper="Interview IQ" />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-soft flex items-center gap-4 transition hover:-translate-y-[1px]">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
            <Flame size={20} fill="currentColor" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">Hustle Streak</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{metrics.streak || 0} Days</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Radar Skill Architecture */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              Skill Architecture
            </h2>
            <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">AI Verified</span>
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <Radar dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Performance Breakdown */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Performance Breakdown
            </h2>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/45" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/75" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: 'rgba(37, 99, 235, 0.02)' }}
                  contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Feature Modules Overview Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">
          Platform Capabilities
        </h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          
          {/* Card: Resume Analyzer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-soft space-y-4 flex flex-col justify-between group hover:border-primary/50 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-primary flex items-center justify-center">
                <FileText size={18} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Resume & ATS IQ</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Scan your resume against domains, check required competencies, and identify matches/gaps in keywords.
              </p>
            </div>
            <button 
              onClick={() => navigate('/app/resume')}
              className="btn-secondary w-full py-2.5 !rounded-lg text-xs flex items-center justify-center gap-1.5 font-bold"
            >
              Analyze Resume <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Card: AI Mock Interview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-soft space-y-4 flex flex-col justify-between group hover:border-primary/50 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 flex items-center justify-center">
                <Brain size={18} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">AI Mock Sessions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Interact with custom AI interview cycles. Provide replies, and review instant scoring and feedback tickets.
              </p>
            </div>
            <button 
              onClick={() => navigate('/app/interview')}
              className="btn-secondary w-full py-2.5 !rounded-lg text-xs flex items-center justify-center gap-1.5 font-bold bg-indigo-50/20 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-950/20"
            >
              Start Session <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Card: Roadmaps */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-soft space-y-4 flex flex-col justify-between group hover:border-primary/50 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/10 text-cyan-600 flex items-center justify-center">
                <Map size={18} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Learning Roadmap</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Track stages curated for your career domain. Finish capstone projects to demonstrate matching skills.
              </p>
            </div>
            <button 
              onClick={() => navigate('/app/roadmap')}
              className="btn-secondary w-full py-2.5 !rounded-lg text-xs flex items-center justify-center gap-1.5 font-bold bg-cyan-50/20 text-cyan-650 dark:text-cyan-400 dark:bg-cyan-950/20"
            >
              Check Roadmap <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Card: Career Chatbot */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-soft space-y-4 flex flex-col justify-between group hover:border-primary/50 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 flex items-center justify-center">
                <MessageSquare size={18} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Career Copilot</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Discuss roadmap progress, coding goals, mock failures, or resume fixes directly with AI.
              </p>
            </div>
            <button 
              onClick={() => navigate('/app/chatbot')}
              className="btn-secondary w-full py-2.5 !rounded-lg text-xs flex items-center justify-center gap-1.5 font-bold bg-emerald-50/20 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/20"
            >
              Chat with AI <ArrowUpRight size={14} />
            </button>
          </div>

        </div>
      </div>

      {/* Placement Activities Live Feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            Live Feed Logs
          </h2>
          <span className="text-[10px] font-black uppercase text-slate-400">Activity History</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.activities?.length ? data.activities : [{ title: 'Begin your journey by uploading your resume.', time: new Date() }]).map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-[#F8FAFC]/50 dark:bg-slate-950/20 group hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition">
                <Terminal size={16} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{activity.title}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  {activity.time ? new Date(activity.time).toLocaleDateString() : 'Just now'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

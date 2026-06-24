import { useQuery } from '@tanstack/react-query';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, YAxis } from 'recharts';
import { LayoutDashboard, Zap, Clock, Star, Terminal, Sparkles } from 'lucide-react';
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
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard')).data
  });

  const metrics = data?.metrics || {};
  const radarData = data?.latestSkillGap?.radarData?.length ? data.latestSkillGap.radarData : fallbackRadar;

  const barData = [
    { name: 'Resume', score: metrics.resumeScore || 0, color: '#6366f1' },
    { name: 'ATS', score: metrics.atsScore || 0, color: '#0ea5e9' },
    { name: 'Skill', score: metrics.skillMatchScore || 0, color: '#c084fc' },
    { name: 'Interview', score: metrics.interviewScore || 0, color: '#22c55e' }
  ];

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Candidate Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Precision tracking for your ultimate placement success.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card !p-3 !px-6 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Live Ready</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <MetricCard title="Aura Score" value={isLoading ? '--' : metrics.resumeScore || 0} suffix="%" helper="Resume Quality" />
        <MetricCard title="ATS Match" value={isLoading ? '--' : metrics.atsScore || 0} suffix="%" helper="Keyword Extraction" />
        <MetricCard title="Readiness" value={isLoading ? '--' : metrics.placementReadiness || 0} suffix="%" helper="Total Preparedness" />
        <MetricCard title="Vibe Check" value={isLoading ? '--' : metrics.interviewScore || 0} suffix="%" helper="Interview IQ" />
        <MetricCard title="Hustle Streak" value={metrics.streak || 0} helper="Unstoppable Days" />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Radar Chart */}
        <div className="lg:col-span-12 xl:col-span-5 glass-card !p-8">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-500" />
                Skill Architecture
             </h2>
             <span className="text-[10px] font-black uppercase text-slate-400">AI Verified</span>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-12 xl:col-span-7 glass-card !p-8">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-500" />
                Performance Breakdown
             </h2>
             <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500/20" />
                <div className="w-3 h-3 rounded-full bg-indigo-500/40" />
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
             </div>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                   cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
                   contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                 />
                <Bar dataKey="score" radius={[20, 20, 20, 20]} barSize={45}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activities */}
        <div className="lg:col-span-12 glass-card !p-8">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock size={20} className="text-indigo-500" />
                Live Feed
             </h2>
             <button className="text-[10px] font-black uppercase text-indigo-500 hover:underline">View All History</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(data?.activities?.length ? data.activities : [{ title: 'Begin your journey by uploading your resume.', time: new Date() }]).map((activity, index) => (
              <div key={index} className="group relative flex items-center gap-4 p-5 rounded-[2rem] bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-xl hover:shadow-indigo-500/5">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                   <Terminal size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{activity.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{activity.time ? new Date(activity.time).toLocaleDateString() : 'Just now'}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <ChevronRight size={16} className="text-indigo-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

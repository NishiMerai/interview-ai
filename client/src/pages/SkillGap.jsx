import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { api } from '../services/api.js';
import { Sparkles, Brain, Search, Terminal, AlertCircle, FileText } from 'lucide-react';

export default function SkillGap() {
  const [targetName, setTargetName] = useState('MERN Stack Developer');
  const [jobDescription, setJobDescription] = useState('');

  const { data: resumesData } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => (await api.get('/resumes')).data
  });

  const latestResume = resumesData?.resumes?.[0];

  const analyzeMutation = useMutation({
    mutationFn: async () => (await api.post('/skill-gap/analyze', {
      resumeId: latestResume?._id,
      targetType: 'role',
      targetName,
      jobDescription
    })).data
  });

  const report = analyzeMutation.data?.report;

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Skill Gap Intelligence</h1>
          <p className="text-slate-500 mt-2 font-medium">Uncover the gap between your talent and your dream role.</p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-12 glass-card">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Search size={22} />
             </div>
             <div>
                <h2 className="text-lg font-bold">Target Definition</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Identify your objective</p>
             </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Role or Company</label>
               <input className="input" value={targetName} onChange={(e) => setTargetName(e.target.value)} placeholder="e.g. Google Software Engineer" />
            </div>
            <div className="flex items-end">
               <button 
                disabled={!latestResume || analyzeMutation.isPending} 
                onClick={() => analyzeMutation.mutate()} 
                className="btn-primary w-full"
               >
                 {analyzeMutation.isPending ? 'Cracking the Code...' : (
                   <>
                     <Sparkles size={18} />
                     Analyze Intelligence
                   </>
                 )}
               </button>
            </div>
          </div>

          <div className="mt-6 space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Job Description (Optional)</label>
             <textarea className="input min-h-[160px] italic !rounded-[2rem]" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the specific job description for high-precision matching..." />
          </div>

          {!latestResume && (
            <div className="mt-6 flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20">
               <AlertCircle className="text-amber-500" size={18} />
               <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Resume Missing: Please upload your resume in the analyzer first.</p>
            </div>
          )}
        </div>

        {report && (
          <div className="lg:col-span-12 grid gap-8 md:grid-cols-12 mt-8">
            <div className="md:col-span-5 glass-card flex flex-col justify-between">
               <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Match Affinity</h3>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 content-center text-center dark:bg-emerald-500/10">
                       <FileText size={16} className="mx-auto text-emerald-500" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-black gradient-text">{report.matchScore}</span>
                    <span className="text-2xl font-bold text-slate-300">%</span>
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 block underline underline-offset-4 decoration-rose-300 italic">Immediate Skills Gap</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.missingSkills?.length > 0 ? (
                      report.missingSkills.map((skill) => (
                        <span key={skill} className="badge bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20">
                           {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs italic text-slate-400 font-medium">No gaps detected. You are a titan.</span>
                    )}
                  </div>
               </div>
            </div>

            <div className="md:col-span-7 glass-card">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Skill Geometry</h3>
                  <Brain size={20} className="text-indigo-500" />
               </div>
               <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={report.radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                      <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

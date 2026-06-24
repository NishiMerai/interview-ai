import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { Map, Flag, CheckCircle, ChevronRight, BookOpen, Layers } from 'lucide-react';

export default function LearningRoadmap() {
  const { data: reportsData } = useQuery({
    queryKey: ['skill-gap-reports'],
    queryFn: async () => (await api.get('/skill-gap/reports')).data,
  });

  const latestReport = reportsData?.reports?.[0];

  const domain =
    latestReport?.targetName ||
    latestReport?.targetRole ||
    latestReport?.role ||
    '';

  const { data: roadmapsData } = useQuery({
    queryKey: ['admin-roadmaps', domain],
    enabled: !!domain,
    queryFn: async () => {
      const res = await api.get('/admin-content/roadmaps');
      const allRoadmaps = Array.isArray(res.data) ? res.data : res.data?.roadmaps || [];
      const matchedRoadmap = allRoadmaps.find((r) => {
        const roadmapDomain = r.domain || r.role || '';
        return roadmapDomain.toLowerCase() === domain.toLowerCase();
      });
      return { roadmap: matchedRoadmap };
    },
  });

  const roadmap = roadmapsData?.roadmap;

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Learning Roadmap</h1>
          <p className="text-slate-500 mt-2 font-medium">Your architected path to mastering missing skills.</p>
        </div>
      </div>

      {!latestReport && (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-6">
               <Flag className="text-amber-500" size={30} />
            </div>
            <h3 className="text-xl font-bold italic underline decoration-amber-200">Analysis Required</h3>
            <p className="text-slate-400 mt-2 max-w-xs font-medium">Generate a skill gap report first to unlock your personalized roadmap.</p>
        </div>
      )}

      {latestReport && !roadmap && (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6">
               <Layers className="text-indigo-500" size={30} />
            </div>
            <h3 className="text-xl font-bold italic underline decoration-indigo-200">Roadmap Pending</h3>
            <p className="text-slate-400 mt-2 max-w-xs font-medium">We don't have a specific roadmap for "{domain}" yet. Stay tuned or check with Admin.</p>
        </div>
      )}

      {roadmap && (
        <div className="space-y-8">
           <div className="glass-card relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Map size={120} className="text-indigo-600" />
              </div>
              <div className="flex items-center gap-4 mb-2">
                 <span className="badge bg-indigo-50 text-indigo-600 border border-indigo-100 italic">Curated Path</span>
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Target: {roadmap.domain}</span>
              </div>
              <h2 className="text-3xl font-black italic">{roadmap.title}</h2>
           </div>

           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(roadmap.stages || []).map((stage, index) => (
                <div key={index} className="glass-card group hover:border-indigo-200 transition-all duration-300 flex flex-col">
                   <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 group-hover:bg-indigo-600 dark:bg-white dark:group-hover:bg-indigo-500 flex items-center justify-center text-white dark:text-slate-900 shadow-lg transition-colors">
                         <span className="font-black text-xs italic">{index + 1}</span>
                      </div>
                      <span className="badge text-[10px] font-black uppercase bg-slate-50 border border-slate-100 text-slate-400 dark:bg-white/5 dark:border-white/10">
                        {stage.status || 'not_started'}
                      </span>
                   </div>

                   <h3 className="text-xl font-black italic mb-6 leading-tight">
                      {stage.name || stage.title}
                   </h3>

                   <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-2">
                         <BookOpen size={14} className="text-indigo-500" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Topics</span>
                      </div>
                      <ul className="space-y-2">
                        {(stage.topics || []).map((topic, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                             <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                             {topic}
                          </li>
                        ))}
                      </ul>
                   </div>

                   {stage.projects?.[0] && (
                     <div className="mt-8 p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20">
                        <div className="flex items-center gap-2 mb-2 font-black text-[10px] uppercase tracking-widest text-indigo-600 italic">
                           <Flag size={12} />
                           Capstone Goal
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{stage.projects[0]}</p>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
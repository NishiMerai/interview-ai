import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { Map, Flag, CheckCircle, ChevronRight, BookOpen, Layers, Sparkles, Award, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LearningRoadmap() {
  const navigate = useNavigate();
  const { data: reportsData } = useQuery({
    queryKey: ['skill-gap-reports'],
    queryFn: async () => (await api.get('/skill-gap/reports')).data,
  });

  const { data: resumesData } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => (await api.get('/resumes')).data,
  });

  const latestReport = reportsData?.reports?.[0];
  const latestResume = resumesData?.resumes?.[0];

  const hasProfileAnalyzed = latestReport || latestResume;

  const domain =
    latestReport?.targetName ||
    latestReport?.targetRole ||
    latestReport?.role ||
    latestResume?.domain ||
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
    <div className="space-y-8 animate-fade-in p-2 md:p-4 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Learning Roadmap</h1>
        <p className="text-slate-500 mt-2 font-medium">Your customized roadmap path constructed to bridge detected profile gaps.</p>
      </div>

      {!hasProfileAnalyzed && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center shadow-soft flex flex-col items-center max-w-2xl mx-auto">
          {/* Flat vector SVG showing learning guide */}
          <div className="w-20 h-20 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
            <Flag size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Evaluation Required</h2>
          <p className="text-slate-500 mt-2 font-medium max-w-sm">
            Please upload a resume first to run the AI skill gap analyzer. This automatically unlocks your personalized domain curriculum.
          </p>
          <button 
            onClick={() => navigate('/app/resume')}
            className="btn-primary mt-6 py-2.5 px-6 !rounded-lg text-xs font-bold"
          >
            Upload Resume
          </button>
        </div>
      )}

      {latestReport && !roadmap && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center shadow-soft flex flex-col items-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-500 flex items-center justify-center mb-6">
            <Layers size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Curriculum Pending</h2>
          <p className="text-slate-500 mt-2 font-medium max-w-sm">
            No active learning path is currently registered for the target domain: <span className="font-bold text-slate-850 dark:text-slate-250 italic">"{domain}"</span>.
          </p>
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-350 max-w-md mt-6 leading-relaxed">
            Please ask your system administrator to bootstrap a template roadmap for <span className="font-bold">"{domain}"</span> in the admin panel content manager.
          </div>
        </div>
      )}

      {roadmap && (
        <div className="space-y-8">
          
          {/* Target Domain Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-8 shadow-lg border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase bg-white/20 px-3 py-1 rounded-full text-blue-100 tracking-wider">
                  Target Curriculum
                </span>
                <span className="text-xs text-blue-200 font-semibold">{roadmap.domain}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">{roadmap.title}</h2>
            </div>
            <div className="z-10 shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center text-white backdrop-blur-sm">
                <Map size={24} />
              </div>
            </div>
          </div>

          {/* Curriculum Stages Grid */}
          <div className="space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Roadmap Stages
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(roadmap.stages || []).map((stage, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft hover:border-primary/50 transition duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 group-hover:bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md transition">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <span className={`badge ${
                        stage.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                          : 'bg-slate-50 text-slate-400 border border-slate-100 dark:bg-slate-950/20 dark:text-slate-500 dark:border-slate-800/60'
                      }`}>
                        {stage.status || 'Not Started'}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {stage.name || stage.title}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <BookOpen size={13} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Core Concepts</span>
                      </div>
                      <ul className="space-y-2">
                        {(stage.topics || []).map((topic, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                            <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {stage.projects?.[0] && (
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1.5 mb-1.5 font-black text-[9px] uppercase tracking-wider text-primary">
                        <Award size={12} />
                        Capstone Goal
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {stage.projects[0]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
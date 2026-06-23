import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api.js';

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

      const allRoadmaps = Array.isArray(res.data)
        ? res.data
        : res.data?.roadmaps || [];

     const matchedRoadmap = allRoadmaps.find((r) => {
  const roadmapDomain = r.domain || r.role || '';
  return roadmapDomain.toLowerCase() === domain.toLowerCase();
});

      return { roadmap: matchedRoadmap };
    },
  });

  const roadmap = roadmapsData?.roadmap;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">Learning Roadmap</h1>
        <p className="text-slate-500">
          Roadmap based on your latest skill gap analysis.
        </p>
      </div>

      {!latestReport && (
        <div className="glass rounded-3xl p-5 text-amber-600">
          Create a skill-gap report first.
        </div>
      )}

      {latestReport && !roadmap && (
        <div className="glass rounded-3xl p-5 text-amber-600">
          No roadmap found for {domain}. Please add roadmap from admin panel.
        </div>
      )}

      {roadmap && (
        <div className="glass rounded-3xl p-5">
          <h2 className="text-2xl font-black">{roadmap.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Domain: {roadmap.domain}
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {(roadmap.stages || []).map((stage, index) => (
              <div
                key={index}
                className="rounded-3xl bg-white/70 p-5 dark:bg-white/10"
              >
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                  {stage.status || 'not_started'}
                </span>

                <h3 className="mt-4 text-xl font-black">
                  {stage.name || stage.title}
                </h3>

                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {(stage.topics || []).map((topic, i) => (
                    <li key={i}>• {topic}</li>
                  ))}
                </ul>

                {stage.projects?.[0] && (
                  <p className="mt-4 text-sm font-bold">
                    Project: {stage.projects[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
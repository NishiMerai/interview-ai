import { useQuery } from '@tanstack/react-query';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">Placement Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">All your readiness signals in one clean cockpit.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Resume Score" value={isLoading ? '--' : metrics.resumeScore || 0} suffix="%" helper="Overall resume quality" />
        <MetricCard title="ATS Score" value={isLoading ? '--' : metrics.atsScore || 0} suffix="%" helper="Keyword compatibility" />
        <MetricCard title="Readiness" value={isLoading ? '--' : metrics.placementReadiness || 0} suffix="%" helper="Combined score" />
        <MetricCard title="Interview" value={isLoading ? '--' : metrics.interviewScore || 0} suffix="%" helper="Latest mock score" />
        <MetricCard title="Streak" value={metrics.streak || 0} helper="Daily practice days" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-3xl p-5">
          <h2 className="text-xl font-black">Skill match radar</h2>
          <div className="h-80">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-5">
          <h2 className="text-xl font-black">Score overview</h2>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={[
                { name: 'Resume', score: metrics.resumeScore || 0 },
                { name: 'ATS', score: metrics.atsScore || 0 },
                { name: 'Skill', score: metrics.skillMatchScore || 0 },
                { name: 'Interview', score: metrics.interviewScore || 0 }
              ]}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="score" fill="#4f46e5" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-5">
        <h2 className="text-xl font-black">Recent activities</h2>
        <div className="mt-4 grid gap-3">
          {(data?.activities?.length ? data.activities : [{ title: 'Upload your resume to start', time: new Date() }]).map((activity, index) => (
            <div key={index} className="rounded-2xl bg-white/70 p-4 text-sm dark:bg-white/10">
              <span className="font-bold">{activity.title}</span>
              <span className="ml-2 text-slate-500">{activity.time ? new Date(activity.time).toLocaleString() : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

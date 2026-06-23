import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { api } from '../services/api.js';

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
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">Skill Gap Intelligence</h1>
        <p className="text-slate-500 dark:text-slate-400">Compare your resume with a role/company/JD.</p>
      </div>

      <div className="glass rounded-3xl p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <input className="input" value={targetName} onChange={(e) => setTargetName(e.target.value)} placeholder="Target role or company" />
          <button disabled={!latestResume || analyzeMutation.isPending} onClick={() => analyzeMutation.mutate()} className="btn-primary">
            {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze skill gap'}
          </button>
        </div>
        <textarea className="input mt-4 min-h-32" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste job description here (optional)" />
        {!latestResume && <p className="mt-3 text-sm font-semibold text-amber-600">Upload resume first. No resume, no magic wand.</p>}
      </div>

      {report && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="glass rounded-3xl p-5">
            <p className="text-sm text-slate-500">Match score</p>
            <p className="text-6xl font-black">{report.matchScore}%</p>
            <div className="mt-5">
              <h3 className="font-black">Missing skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {report.missingSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700 dark:bg-red-500/20 dark:text-red-100">{skill}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="glass rounded-3xl p-5">
            <h3 className="font-black">Radar chart</h3>
            <div className="h-80">
              <ResponsiveContainer>
                <RadarChart data={report.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

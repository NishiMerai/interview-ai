import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api.js';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const [selectedDomain, setSelectedDomain] = useState('');
const [skillAnalysis, setSkillAnalysis] = useState(null);

  const { data } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => (await api.get('/resumes')).data
  });

  const { data: domains = [] } = useQuery({
  queryKey: ['admin-domains'],
  queryFn: async () => (await api.get('/admin-content/domains')).data,
});

  const uploadMutation = useMutation({
    mutationFn: async () => {
     const formData = new FormData();
formData.append("resume", file);
formData.append("domain", selectedDomain);

await api.post("/resumes/upload", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
    },
onSuccess: async () => {
  setFile(null);
  queryClient.invalidateQueries({ queryKey: ['resumes'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });

  if (selectedDomain) {
    const analysisRes = await api.post('/skill-gap/analyze', {
      targetName: selectedDomain,
      targetType: 'role',
    });

    setSkillAnalysis(analysisRes.data.report);
  }
}
  });

  const latest = data?.resumes?.[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">Resume Analyzer</h1>
        <p className="text-slate-500 dark:text-slate-400">Upload PDF/DOCX and get parsing, ATS score and keyword gaps.</p>
      </div>

      <div className="glass rounded-3xl p-6">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-10 text-center dark:border-brand-500/30 dark:bg-brand-500/10">
          <UploadCloud className="mb-3 text-brand-600" size={40} />
          <span className="font-black">{file ? file.name : 'Choose resume DOCX'}</span>
          <span className="mt-2 text-sm text-slate-500">Max 5MB. Keep it crisp. Recruiters are allergic to chaos.</span>
          <input hidden type="file" accept=".pdf,.docx" onChange={(event) => setFile(event.target.files?.[0])} />
        </label>
        <select
  className="input mt-4"
  value={selectedDomain}
  onChange={(e) => setSelectedDomain(e.target.value)}
>
  <option value="">Select Domain for Skill Analysis</option>
  {domains.map((d) => (
    <option key={d._id} value={d.name}>
      {d.name}
    </option>
  ))}
</select>
        <button disabled={!file || uploadMutation.isPending} onClick={() => uploadMutation.mutate()} className="btn-primary mt-5">
          {uploadMutation.isPending ? 'Analyzing...' : 'Upload & Analyze'}
        </button>
        {uploadMutation.error && <p className="mt-3 text-sm font-semibold text-red-500">{uploadMutation.error.response?.data?.message || 'Upload failed'}</p>}
      </div>

      {latest && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="glass rounded-3xl p-5">
            <p className="text-sm text-slate-500">Resume Score</p>
            <p className="mt-2 text-5xl font-black">{latest.resumeScore}%</p>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="text-sm text-slate-500">ATS Score</p>
            <p className="mt-2 text-5xl font-black">{latest.atsScore}%</p>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="text-sm text-slate-500">Version</p>
            <p className="mt-2 text-5xl font-black">v{latest.versionNumber}</p>
          </div>
          <div className="glass rounded-3xl p-5 lg:col-span-3">
            <h2 className="text-xl font-black">Extracted Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {latest.parsedData?.skills?.map((skill) => (
                <span key={skill} className="rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-100">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      {skillAnalysis && (
  <div className="glass rounded-3xl p-5 mt-5">
    <h2 className="text-2xl font-black mb-4">Domain Skill Analysis</h2>

    <p className="text-slate-500 mb-4">
      Domain: {selectedDomain}
    </p>
 
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h3 className="font-black text-green-700 mb-2">Matching Skills</h3>
        <div className="flex flex-wrap gap-2">
         {(latest.matchedSkills || []).map((skill, i) => (
  <span key={i} className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
    {skill}
  </span>
))}
        </div>
      </div>

      <div>
        <h3 className="font-black text-red-700 mb-2">Missing Skills</h3>
        <div className="flex flex-wrap gap-2">
         {(latest.missingSkills || []).map((skill, i) => (
  <span key={i} className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
    {skill}
  </span>
))}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

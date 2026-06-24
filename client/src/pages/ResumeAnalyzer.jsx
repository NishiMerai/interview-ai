import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, CheckCircle2, XCircle, Terminal, FileText, Target, Cpu } from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api.js';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();
  const [selectedDomain, setSelectedDomain] = useState('');

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

      return (await api.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })).data;
    },
    onSuccess: () => {
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const latest = data?.resumes?.[0];

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Resume Analyzer</h1>
          <p className="text-slate-500 mt-2 font-medium">Decode your resume with AI precision and ATS insights.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-full">
           <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
           <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest leading-none">Powered by Groq Llama 3</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UploadCloud className="text-indigo-500" size={24} />
              Upload Resume
            </h2>
            
            <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 rounded-3xl bg-white p-4 shadow-xl shadow-indigo-500/10 transition-transform group-hover:scale-110">
                <FileText className="text-indigo-600" size={32} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {file ? file.name : 'Drop PDF or DOCX'}
              </span>
              <span className="mt-2 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Max size 5MB</span>
              <input hidden type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0])} />
            </label>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block italic">Target Domain</label>
                <select
                  className="input"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  <option value="">Select Target Domain</option>
                  {domains.map((d) => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <button 
                disabled={!file || !selectedDomain || uploadMutation.isPending} 
                onClick={() => uploadMutation.mutate()} 
                className="btn-primary w-full"
              >
                {uploadMutation.isPending ? 'Processing AI Magic...' : 'Analyze My Talent'}
              </button>
            </div>
            {uploadMutation.error && (
              <p className="mt-4 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl">
                {uploadMutation.error.response?.data?.message || 'Wait, something went wrong'}
              </p>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-8 space-y-8">
          {!latest && !uploadMutation.isPending && (
             <div className="glass-card flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                   <Target className="text-slate-300" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-400 underline decoration-indigo-200">No Analysis Found</h3>
                <p className="text-slate-400 mt-2 max-w-xs italic text-sm">Upload your resume to see the magic happen with AI extracted insights.</p>
             </div>
          )}

          {latest && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScoreCard title="Resume Score" value={latest.resumeScore} color="indigo" />
                <ScoreCard title="ATS Friendliness" value={latest.atsScore} color="cyan" />
                <ScoreCard title="Resume Version" value={`v${latest.versionNumber}`} color="purple" isText />
              </div>

              <div className="glass-card">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                   <Cpu className="text-indigo-500" />
                   AI Skill Intelligence
                </h2>

                <div className="space-y-8">
                  {/* Matching Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <CheckCircle2 className="text-emerald-500" size={20} />
                       <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Matching Skills</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {latest.matchedSkills?.length > 0 ? (
                        latest.matchedSkills.map((skill, i) => (
                          <span key={i} className="badge bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 uppercase font-black tracking-tight">{skill}</span>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-400 font-medium">No matches found for this domain yet.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <XCircle className="text-rose-500" size={20} />
                       <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Missing Gaps</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {latest.missingSkills?.length > 0 ? (
                         latest.missingSkills.map((skill, i) => (
                           <span key={i} className="badge bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20 uppercase font-black tracking-tight">{skill}</span>
                         ))
                       ) : (
                         <span className="text-xs italic text-slate-400 font-medium">Wait, you are a perfect match! No missing skills.</span>
                       )}
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-white/5" />

                  {/* All Extracted Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Terminal className="text-indigo-500" size={20} />
                       <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 italic underline underline-offset-4 decoration-indigo-300">Total Extracted Talent</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {latest.parsedData?.skills?.length > 0 ? (
                        latest.parsedData.skills.map((skill, i) => (
                          <span key={i} className="badge bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 shadow-lg shadow-slate-200 dark:shadow-none italic">{skill}</span>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-400 font-medium">We couldn't extract any skills. Try a different format.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TEMPORARY DEBUG PANEL */}
      {latest && (
        <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-cyan-400 font-mono text-xs overflow-auto border-4 border-indigo-500/30">
          <h2 className="text-xl font-black text-white mb-4 italic tracking-tighter">RAW DEBUG CONSOLE v1.0</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p><span className="text-slate-500 uppercase tracking-widest font-black mr-2">Domain:</span> {selectedDomain}</p>
              <p><span className="text-slate-500 uppercase tracking-widest font-black mr-2">Resume Score:</span> {latest.resumeScore}%</p>
              <p><span className="text-slate-500 uppercase tracking-widest font-black mr-2">ATS Score:</span> {latest.atsScore}%</p>
              <div>
                <p className="text-slate-500 uppercase tracking-widest font-black mb-1">Required Admin Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {latest.requiredSkills?.map((s, i) => <span key={i} className="bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">{s}</span>)}
                </div>
              </div>
            </div>
            <div className="space-y-4">
               <div>
                  <p className="text-slate-500 uppercase tracking-widest font-black mb-1">Extracted from PDF:</p>
                  <div className="flex flex-wrap gap-1">
                    {latest.parsedData?.skills?.map((s, i) => <span key={i} className="bg-white/5 px-2 py-0.5 rounded-md text-white">{s}</span>)}
                  </div>
               </div>
               <div>
                  <p className="text-slate-500 uppercase tracking-widest font-black mb-1">Intersection (Matched):</p>
                  <div className="flex flex-wrap gap-1">
                    {latest.matchedSkills?.map((s, i) => <span key={i} className="bg-emerald-500/20 px-2 py-0.5 rounded-md text-emerald-400 border border-emerald-500/30 font-bold">{s}</span>)}
                  </div>
               </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-widest font-black mb-1">Delta (Missing):</p>
                  <div className="flex flex-wrap gap-1">
                    {latest.missingSkills?.map((s, i) => <span key={i} className="bg-rose-500/20 px-2 py-0.5 rounded-md text-rose-400 border border-rose-500/30 font-bold">{s}</span>)}
                  </div>
               </div>
            </div>
          </div>
          <div className="mt-8 border-t border-white/5 pt-4">
             <p className="text-[10px] text-slate-500 italic opacity-50 font-sans">System Diagnostics: {new Date().toISOString()} | Trace ID: {Math.random().toString(36).substring(7)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, value, color, isText }) {
  const colors = {
    indigo: 'from-indigo-600 to-indigo-400 text-indigo-600',
    cyan: 'from-cyan-600 to-cyan-400 text-cyan-600',
    purple: 'from-purple-600 to-purple-400 text-purple-600'
  };

  return (
    <div className="glass-card relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]} opacity-5 transition-transform group-hover:scale-150`} />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-5xl font-black ${colors[color].split(' ')[2]}`}>{value}</span>
        {!isText && <span className="text-xl font-bold text-slate-300">%</span>}
      </div>
    </div>
  );
}

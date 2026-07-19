import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, CheckCircle2, XCircle, Terminal, FileText, Target, Cpu, Award, BookOpen, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../services/api.js";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => (await api.get("/resumes")).data,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select resume file first");

      const formData = new FormData();
      formData.append("resume", file);

      return (await api.post("/resumes/upload", formData)).data;
    },

    onSuccess: () => {
      setFile(null);
      setSelectedIdx(0); // Reset selection to show the newly uploaded resume
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  // Automatically scroll to history section if hash is present
  useEffect(() => {
    if (window.location.hash === "#history") {
      const el = document.getElementById("history-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  const resumes = data?.resumes || [];
  const latest = resumes[selectedIdx] || resumes[0];

  const extractedSkills =
    latest?.parsedData?.skills ||
    latest?.extractedSkills ||
    [];

  const matchedSkills =
    latest?.matchedSkills ||
    latest?.keywordAnalysis?.matchedKeywords ||
    [];

  const missingSkills =
    latest?.missingSkills ||
    latest?.keywordAnalysis?.missingKeywords ||
    [];

  const requiredSkills =
    latest?.requiredSkills ||
    [];

  return (
    <div className="space-y-8 animate-fade-in p-2 md:p-4 max-w-[1600px] mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Resume Analyzer
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Upload your resume in PDF/DOCX format to run instant keyword extraction and ATS compatibility tests.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Upload Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Upload Resume
            </h2>
            
            <label className="group relative flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-[#F8FAFC]/50 dark:bg-slate-950/40 p-8 text-center cursor-pointer transition hover:bg-white dark:hover:bg-slate-900 hover:border-primary/50">
              {/* Modern Corporate SVG Icon */}
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <UploadCloud size={22} />
              </div>

              <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">
                {file ? file.name : "Select File"}
              </span>

              <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 uppercase tracking-wider">
                PDF / DOCX (Max 5MB)
              </span>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <button
              disabled={!file || uploadMutation.isPending}
              onClick={() => uploadMutation.mutate()}
              className="btn-primary w-full py-3"
            >
              {uploadMutation.isPending ? "Analyzing Profile..." : "Upload & Analyze"}
            </button>

            {uploadMutation.error && (
              <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 p-3 rounded-lg">
                {uploadMutation.error?.response?.data?.message ||
                  uploadMutation.error.message ||
                  "Something went wrong"}
              </p>
            )}
          </div>

          {/* Historical Uploads Widget */}
          <div id="history-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Layers size={14} className="text-primary" />
              Upload History
            </h2>
            
            {resumes.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-semibold">No historical uploads detected.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto modern-scrollbar pr-1">
                {resumes.map((resItem, idx) => (
                  <button
                    key={resItem._id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`
                      w-full text-left p-3 rounded-lg border text-xs font-semibold flex items-center justify-between gap-3 transition
                      ${idx === selectedIdx 
                        ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/15 dark:border-blue-800 text-primary" 
                        : "bg-transparent border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }
                    `}
                  >
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate leading-none mb-1">
                        {resItem.originalFileName}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate uppercase tracking-wide">
                        {resItem.domain || "No domain matched"} • V{resItem.versionNumber || 1}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {resItem.resumeScore || 0}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Analysis */}
        <div className="lg:col-span-8 space-y-6">
          {latest ? (
            <>
              {/* Score Display Cards */}
              <div className="grid sm:grid-cols-2 gap-6">
                <ScoreCard
                  title="Global Resume IQ"
                  value={latest.resumeScore || 0}
                  color="primary"
                  helper="Resume formatting & competency density score"
                />
                <ScoreCard
                  title="ATS Match Ratio"
                  value={latest.atsScore || 0}
                  color="accent"
                  helper="Evaluation score matching keyword requirements"
                />
              </div>

              {/* Extracted Skills */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-primary" size={18} />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    Extracted Capabilities
                  </h2>
                </div>

                <SkillList
                  skills={extractedSkills}
                  emptyText="No capabilities detected in resume."
                  color="slate"
                />
              </div>

              {/* Domain Skill Comparison */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-6">
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    Domain Competency Analysis
                  </h2>
                  <p className="text-slate-500 text-xs font-semibold mt-1">
                    Job Role Category: <span className="font-black text-slate-800 dark:text-white italic">{latest.domain || "No domain matched"}</span>
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Matching Skills */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-500" size={16} />
                      <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Matching Capabilities
                      </h3>
                    </div>

                    <SkillList
                      skills={matchedSkills}
                      emptyText="No matching capabilities for this category."
                      color="emerald"
                    />
                  </div>

                  {/* Missing Skills */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <XCircle className="text-red-500" size={16} />
                      <h3 className="text-xs font-black uppercase tracking-wider text-red-650 dark:text-red-400">
                        Missing Requirements
                      </h3>
                    </div>

                    <SkillList
                      skills={missingSkills}
                      emptyText="Complete compliance. No critical missing skills!"
                      color="rose"
                    />
                  </div>
                </div>
              </div>

              {/* Raw Debug Console */}
              <div className="rounded-xl bg-[#0F172A] text-slate-300 p-6 border border-slate-850 shadow-lg space-y-4 font-mono">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-[#F8FAFC] tracking-wider flex items-center gap-2">
                    <Terminal size={14} className="text-cyan-400" />
                    COMPILATION DEBUG CONSOLE v1.0
                  </h2>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">SYSTEM READY</span>
                </div>

                <div className="grid gap-2 text-xs">
                  <DebugRow label="Category Domain" value={latest.domain || "None"} />
                  <DebugRow label="Aura Score Rating" value={`${latest.resumeScore || 0}%`} />
                  <DebugRow label="ATS Compatibility" value={`${latest.atsScore || 0}%`} />
                </div>

                <hr className="border-slate-800 my-4" />

                <div className="space-y-4">
                  <DebugChips title="Required Admin Core" items={requiredSkills} />
                  <DebugChips title="Parsed Resume Data" items={extractedSkills} />
                  <DebugChips title="Matched Intersection" items={matchedSkills} />
                  <DebugChips title="Delta Capabilities" items={missingSkills} danger />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center shadow-soft flex flex-col items-center">
              <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-primary flex items-center justify-center mb-6">
                <FileText size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Resume Uploaded</h2>
              <p className="text-slate-500 mt-2 font-medium max-w-sm">
                Upload your resume file above to generate an automated profile scorecard and skill gap report.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

function ScoreCard({ title, value, color, helper }) {
  const borderColors = {
    primary: "border-t-primary shadow-blue-500/5",
    accent: "border-t-accent shadow-cyan-500/5",
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-4 rounded-xl p-5 shadow-soft ${borderColors[color]}`}>
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{title}</span>
      <span className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3 block">
        {value}%
      </span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block font-medium">
        {helper}
      </span>
    </div>
  );
}

function SkillList({ skills = [], emptyText, color }) {
  const colorMap = {
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950",
    rose: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-100 dark:border-rose-950",
    slate: "bg-slate-50 dark:bg-slate-500/10 text-slate-650 dark:text-slate-350 border-slate-100 dark:border-slate-800",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {skills.length > 0 ? (
        skills.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${colorMap[color]}`}
          >
            {typeof skill === "string" ? skill : skill?.name}
          </span>
        ))
      ) : (
        <p className="text-xs text-slate-400 italic font-semibold">{emptyText}</p>
      )}
    </div>
  );
}

function DebugRow({ label, value }) {
  return (
    <p className="flex items-center gap-2">
      <span className="text-slate-500 uppercase tracking-widest text-[9px] font-black mr-2 select-none w-36">
        {label}:
      </span>
      <span className="text-cyan-400 font-bold">{value || "N/A"}</span>
    </p>
  );
}

function DebugChips({ title, items = [], danger = false }) {
  return (
    <div className="space-y-1.5">
      <p className="text-slate-500 uppercase tracking-widest text-[9px] font-black select-none">
        {title}:
      </p>

      <div className="flex flex-wrap gap-1.5">
        {items.length > 0 ? (
          items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${danger
                  ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  : "bg-slate-800 text-cyan-300 border-slate-700"
                }`}
            >
              {typeof item === "string" ? item : item?.name}
            </span>
          ))
        ) : (
          <span className="text-slate-600 text-[10px] italic">Empty</span>
        )}
      </div>
    </div>
  );
}
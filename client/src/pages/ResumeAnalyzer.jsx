import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, CheckCircle2, XCircle, Terminal, FileText, Target, Cpu } from "lucide-react";
import { useState } from "react";
import { api } from "../services/api.js";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
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
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const latest = data?.resumes?.[0];

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
    <div className="space-y-8 animate-fade-in p-4">
      <div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
          Resume Analyzer
        </h1>
        <p className="text-slate-500 mt-2">
          Upload PDF/DOCX and get admin-skill based resume analysis.
        </p>
      </div>

      <div className="glass-card rounded-[2rem] p-6 space-y-6">
        <label className="group relative flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 text-center cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50/30">
          <UploadCloud className="text-indigo-500 mb-4" size={46} />

          <h2 className="font-black text-xl text-slate-900">
            {file ? file.name : "Upload Resume"}
          </h2>

          <p className="text-slate-500 mt-2">
            PDF/DOCX only. Max 5MB.
          </p>

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
          className="btn-primary"
        >
          {uploadMutation.isPending ? "Analyzing..." : "Upload & Analyze"}
        </button>

        {uploadMutation.error && (
          <p className="text-red-500 font-bold">
            {uploadMutation.error?.response?.data?.message ||
              uploadMutation.error.message ||
              "Something went wrong"}
          </p>
        )}
      </div>

      {latest ? (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <ScoreCard
              title="Resume Score"
              value={latest.resumeScore || 0}
              color="indigo"
            />
            <ScoreCard
              title="ATS Score"
              value={latest.atsScore || 0}
              color="cyan"
            />
          </div>

          <div className="glass-card rounded-[2rem] p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Terminal className="text-indigo-500" size={22} />
              <h2 className="text-2xl font-black">Extracted Skills</h2>
            </div>

            <SkillList
              skills={extractedSkills}
              emptyText="No extracted skills found."
              color="slate"
            />
          </div>

          <div className="glass-card rounded-[2rem] p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-black">Domain Skill Analysis</h2>
              <p className="text-slate-500 mt-2">
                Domain: {latest.domain || "No matching domain detected."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="text-emerald-500" size={22} />
                  <h3 className="text-xl font-black text-emerald-700">
                    Matching Skills
                  </h3>
                </div>

                <SkillList
                  skills={matchedSkills}
                  emptyText="No matching skills found for this domain yet."
                  color="emerald"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="text-rose-500" size={22} />
                  <h3 className="text-xl font-black text-rose-700">
                    Missing Skills
                  </h3>
                </div>

                <SkillList
                  skills={missingSkills}
                  emptyText="Perfect match! No missing skills."
                  color="rose"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 text-cyan-300 p-8 border-4 border-indigo-500/30 space-y-6">
            <h2 className="text-2xl font-black text-white italic">
              RAW DEBUG CONSOLE v1.0
            </h2>

            <DebugRow label="Domain" value={latest.domain || "None"} />
            <DebugRow label="Resume Score" value={`${latest.resumeScore || 0}%`} />
            <DebugRow label="ATS Score" value={`${latest.atsScore || 0}%`} />

            <DebugChips title="Required Admin Skills" items={requiredSkills} />
            <DebugChips title="Extracted From Resume" items={extractedSkills} />
            <DebugChips title="Intersection / Matched" items={matchedSkills} />
            <DebugChips title="Delta / Missing" items={missingSkills} danger />
          </div>
        </>
      ) : (
        <div className="glass-card rounded-[2rem] p-10 text-center">
          <FileText className="mx-auto text-indigo-500 mb-4" size={42} />
          <h2 className="text-2xl font-black">No Analysis Found</h2>
          <p className="text-slate-500 mt-2">
            Upload your resume to see admin-skill based analysis.
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, value, color, isText = false }) {
  const colors = {
    indigo: "from-indigo-500 to-indigo-700",
    cyan: "from-cyan-500 to-cyan-700",
    purple: "from-purple-500 to-purple-700",
  };

  return (
    <div className="glass-card relative overflow-hidden rounded-[2rem] p-6">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors[color]}`} />
      <p className="text-slate-500 font-bold">{title}</p>
      <h2 className="text-5xl font-black mt-4">
        {isText ? value : `${value}%`}
      </h2>
    </div>
  );
}

function SkillList({ skills = [], emptyText, color }) {
  const colorMap = {
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="flex flex-wrap gap-3">
      {skills.length > 0 ? (
        skills.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className={`px-4 py-2 rounded-full border font-black ${colorMap[color]}`}
          >
            {typeof skill === "string" ? skill : skill?.name}
          </span>
        ))
      ) : (
        <p className="text-slate-400 italic font-medium">{emptyText}</p>
      )}
    </div>
  );
}

function DebugRow({ label, value }) {
  return (
    <p>
      <span className="text-slate-400 uppercase tracking-widest font-black mr-3">
        {label}:
      </span>
      <span className="text-cyan-300">{value || "N/A"}</span>
    </p>
  );
}

function DebugChips({ title, items = [], danger = false }) {
  return (
    <div>
      <p className="text-slate-400 uppercase tracking-widest font-black mb-2">
        {title}:
      </p>

      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`px-3 py-1 rounded-md border font-bold ${danger
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  : "bg-indigo-500/20 text-cyan-300 border-indigo-500/30"
                }`}
            >
              {typeof item === "string" ? item : item?.name}
            </span>
          ))
        ) : (
          <span className="text-slate-500 italic">Empty</span>
        )}
      </div>
    </div>
  );
}
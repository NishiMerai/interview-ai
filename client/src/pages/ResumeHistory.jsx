import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Trash2, ArrowLeft, FileText } from "lucide-react";
import { api } from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function ResumeHistory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => (await api.get("/resumes")).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return (await api.delete(`/resumes/${id}`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const resumes = data?.resumes || [];

  return (
    <div className="space-y-8 animate-fade-in p-2 md:p-4 max-w-[1600px] mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <History className="text-primary" size={28} />
            Resume History
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Review, load, and manage all your historical resume evaluation reports.
          </p>
        </div>
        
        <button
          onClick={() => navigate('/app/resume')}
          className="btn-primary flex items-center justify-center gap-2 self-start py-2.5 px-4"
        >
          <ArrowLeft size={16} />
          Go to Analyzer
        </button>
      </div>

      {/* Upload History List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-4">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <FileText size={14} className="text-primary" />
          Parsed Evaluation History
        </h2>
        
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 font-semibold italic">Loading history...</div>
        ) : resumes.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-primary flex items-center justify-center mb-4">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No resumes analyzed yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Upload your resume in the analyzer section to generate your first scorecard and skill metrics.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {resumes.map((resItem) => (
              <div
                key={resItem._id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/40 text-xs font-semibold flex flex-col justify-between gap-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/20 hover:shadow-sm group relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">
                      {resItem.originalFileName}
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate uppercase tracking-wider mt-1">
                      {resItem.domain || "No domain matched"} • V{resItem.versionNumber || 1}
                    </p>
                  </div>
                  
                  <span className="shrink-0 font-extrabold text-[10px] text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    Score: {resItem.resumeScore || 0}%
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                  <button
                    onClick={() => navigate(`/app/resume?id=${resItem._id}`)}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Load Report
                  </button>

                  <button
                    onClick={() => deleteMutation.mutate(resItem._id)}
                    disabled={deleteMutation.isPending}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

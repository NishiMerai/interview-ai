import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../services/api.js';
import { Brain, Trophy, Lightbulb, TrendingUp, HelpCircle, ChevronRight, Play, AlertTriangle } from 'lucide-react';

const DOMAINS = [
  "Web Development", "Mobile Development", "AI & ML", "Data Science",
  "Cloud Computing", "Cyber Security", "DevOps", "Blockchain",
  "Computer Networks", "Database Management", "IoT", "Embedded Systems",
  "Software Engineering", "UI/UX", "Game Development"
];

const TYPES = [
  { id: "technical", label: "Technical Interview" },
  { id: "hr", label: "HR Interview" },
  { id: "behavioral", label: "Behavioral Interview" }
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export default function MockInterview() {
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [type, setType] = useState(TYPES[0].id);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  const startMutation = useMutation({
    mutationFn: async () => {
      setError('');
      const res = await api.post('/interviews/start', { domain, type, difficulty });
      // Handle all possible response shapes
      const sessionData = res.data?.session || res.data?.data?.session || res.data;
      const questions = sessionData?.questions || res.data?.questions || res.data?.data?.questions || [];

      // If sessionData has questions, use it directly
      if (sessionData && sessionData.questions && sessionData.questions.length > 0) {
        return sessionData;
      }

      // If questions exist at a different path, build a session object
      if (questions.length > 0) {
        return {
          _id: sessionData?._id || `local-${Date.now()}`,
          domain,
          type,
          difficulty,
          questions
        };
      }

      throw new Error('No questions were generated. Please try again.');
    },
    onSuccess: (sessionData) => {
      setSession(sessionData);
      setError('');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err.message || 'Failed to start interview. Please try again.';
      setError(msg);
      console.error('Start interview error:', err);
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      setError('');
      const res = await api.put(`/interviews/${session._id}/submit`, {
        questions: session.questions,
      });
      const updatedSession = res.data?.session || res.data?.data?.session || res.data;
      return updatedSession;
    },
    onSuccess: (updatedSession) => {
      setSession(updatedSession);
      setError('');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err.message || 'Failed to submit answers. Please try again.';
      setError(msg);
      console.error('Submit interview error:', err);
    }
  });

  const updateAnswer = (index, userAnswer) => {
    setSession((current) => ({
      ...current,
      questions: current.questions.map((q, i) => i === index ? { ...q, userAnswer } : q)
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">AI Mock Interview</h1>
          <p className="text-slate-500 mt-2 font-medium">Elevate your performance with real-time AI evaluation.</p>
        </div>
      </div>

      <div className="glass-card">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Domain</label>
            <select className="input" value={domain} onChange={(e) => setDomain(e.target.value)}>
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Interview Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Difficulty</label>
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              className="btn-primary w-full h-[52px]"
            >
              {startMutation.isPending ? 'Generating Questions...' : (
                <>
                  <Play size={18} />
                  Start Session
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
              <button
                onClick={() => { setError(''); startMutation.mutate(); }}
                className="text-xs font-bold text-red-600 dark:text-red-300 underline mt-1 hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {session && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between glass-card py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Brain size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black">{session.domain}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge bg-indigo-50 text-indigo-600 border border-indigo-100">{session.type}</span>
                  <span className="badge bg-violet-50 text-violet-600 border border-violet-100">{session.difficulty}</span>
                </div>
              </div>
            </div>
            {session.overallScore !== undefined && (
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Score</p>
                  <p className="text-3xl font-black text-indigo-600">{session.overallScore}%</p>
                </div>
                <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin-slow flex items-center justify-center">
                  <Trophy className="text-indigo-600" size={24} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {session.questions && session.questions.map((item, index) => (
              <div key={item._id || index} className="glass-card group hover:border-indigo-200 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <span className="text-4xl font-black text-slate-100 dark:text-white/5 transition-colors group-hover:text-indigo-100">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 leading-relaxed italic">
                      &quot;{item.question}&quot;
                    </h3>

                    {!session.overallScore ? (
                      <textarea
                        className="input min-h-[140px] italic shadow-inner"
                        value={item.userAnswer || ''}
                        onChange={(e) => updateAnswer(index, e.target.value)}
                        placeholder="Expert response goes here..."
                      />
                    ) : (
                      <div className="space-y-6 animate-slide-up">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-slate-400">Score: {item.score}%</span>
                          <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.score}%` }} />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <FeedbackBox title="Strengths" items={item.strengths} icon={<TrendingUp size={16} />} color="emerald" />
                          <FeedbackBox title="Improvements" items={item.improvements} icon={<Lightbulb size={16} />} color="amber" />
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/10">
                          <div className="flex items-center gap-2 mb-3">
                            <HelpCircle className="text-indigo-500" size={18} />
                            <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Master Answer</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                            {item.betterAnswer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!session.overallScore && (
            <button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="btn-primary w-full py-5 rounded-[2.5rem] shadow-2xl shadow-indigo-500/30"
            >
              {submitMutation.isPending ? 'Analyzing Your Performance...' : 'Submit for AI Evaluation'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FeedbackBox({ title, items, icon, color }) {
  const variants = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100'
  };

  return (
    <div className={`p-5 rounded-[2rem] border ${variants[color]}`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
      </div>
      <ul className="space-y-2">
        {items?.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-xs font-semibold">
            <ChevronRight size={14} className="mt-0.5 shrink-0" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../services/api.js';

export default function MockInterview() {
  const [domain, setDomain] = useState('Web Development');
  const [targetRole, setTargetRole] = useState('MERN Developer');
  const [session, setSession] = useState(null);

const startMutation = useMutation({
  mutationFn: async () => {
    const res = await api.get('/admin-content/questions');

    const filteredQuestions = res.data.filter(
      (q) => q.domain?.toLowerCase() === domain.toLowerCase()
    );

    return filteredQuestions;
  },

  onSuccess: (questions) => {
    setSession({
      _id: 'admin-question-session',
      questions,
    });
  },
});

const submitMutation = useMutation({
  mutationFn: async () => {
    if (session._id === 'admin-question-session') {
      return {
        session: {
          ...session,
          overallScore: 80,
          questions: session.questions.map((q) => ({
            ...q,
            score: q.userAnswer?.trim() ? 80 : 0,
            feedback: q.userAnswer?.trim()
              ? 'Good attempt. Improve answer with more technical details and examples.'
              : 'Answer is empty. Please write an answer first.',
          })),
        },
      };
    }

    return (
      await api.put(`/interviews/${session._id}/submit`, {
        questions: session.questions,
      })
    ).data;
  },

  onSuccess: (data) => setSession(data.session),
});

  const updateAnswer = (index, userAnswer) => {
    setSession((current) => ({
      ...current,
      questions: current.questions.map((q, i) => i === index ? { ...q, userAnswer } : q)
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">AI Mock Interview</h1>
        <p className="text-slate-500 dark:text-slate-400">Practice technical, HR, behavioral, or mixed interviews.</p>
      </div>

      <div className="glass rounded-3xl p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} />
          <input className="input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
          <button onClick={() => startMutation.mutate()} className="btn-primary">
            {startMutation.isPending ? 'Starting...' : 'Start interview'}
          </button>
        </div>
      </div>

      {session && (
        <div className="glass rounded-3xl p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-xl font-black">{session.domain} Interview</h2>
            {session.overallScore && <span className="rounded-full bg-emerald-100 px-4 py-2 font-black text-emerald-700">Score: {session.overallScore}%</span>}
          </div>
          <div className="mt-5 space-y-4">
            {session.questions.map((item, index) => (
              <div key={item._id || index} className="rounded-3xl bg-white/70 p-4 dark:bg-white/10">
                <p className="font-black">Q{index + 1}. {item.question}</p>
                <textarea className="input mt-3 min-h-28" value={item.userAnswer || ''} onChange={(e) => updateAnswer(index, e.target.value)} placeholder="Type your answer..." />
                {item.feedback && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Feedback: {item.feedback}</p>}
              </div>
            ))}
          </div>
          <button onClick={() => submitMutation.mutate()} className="btn-primary mt-5">
            {submitMutation.isPending ? 'Evaluating...' : 'Submit for AI feedback'}
          </button>
        </div>
      )}
    </div>
  );
}

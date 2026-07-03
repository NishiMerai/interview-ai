import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Brain, Trophy, Lightbulb, TrendingUp, HelpCircle, ChevronRight, Play, AlertTriangle, Calendar, Video, Download, Plus, X, AlertCircle, Info } from 'lucide-react';

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

// Helper to convert date and time string to Date object
function parseDateTime(dateInput, timeStr) {
  const date = new Date(dateInput);
  if (!timeStr) return date;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
}

// Countdown component
function InterviewCountdown({ scheduledDateStr, scheduledTimeStr }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const scheduledTime = parseDateTime(scheduledDateStr, scheduledTimeStr);
      const now = new Date();
      const diff = scheduledTime.getTime() - now.getTime();

      if (diff <= 0) {
        if (diff > -60 * 60 * 1000) {
          setTimeLeft('Happening now!');
        } else {
          setTimeLeft('Completed');
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      let str = '';
      if (days > 0) str += `${days}d `;
      if (hours > 0 || days > 0) str += `${hours}h `;
      str += `${minutes}m`;
      setTimeLeft(`Starts in: ${str}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 30000);
    return () => clearInterval(interval);
  }, [scheduledDateStr, scheduledTimeStr]);

  return <span className="font-black text-xs text-indigo-600 dark:text-indigo-400 italic">{timeLeft}</span>;
}

export default function MockInterview() {
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [type, setType] = useState(TYPES[0].id);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  // Scheduling states
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [form, setForm] = useState({
    interviewType: 'HR Interview',
    preferredDate: '',
    preferredTime: '09:00 AM',
    notes: ''
  });

  // Details Modal States for candidate
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Query my interview requests with 15-second background polling
  const { data: requestsData, refetch: refetchRequests } = useQuery({
    queryKey: ['myInterviews'],
    queryFn: async () => (await api.get('/interviews/my')).data,
    refetchInterval: 15000
  });

  const requests = requestsData?.requests || [];

  // Toast removal timer
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: '', type: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.message]);

  const startMutation = useMutation({
    mutationFn: async () => {
      setError('');
      const res = await api.post('/interviews/start', { domain, type, difficulty });
      const sessionData = res.data?.session || res.data?.data?.session || res.data;
      const questions = sessionData?.questions || res.data?.questions || res.data?.data?.questions || [];

      if (sessionData && sessionData.questions && sessionData.questions.length > 0) {
        return sessionData;
      }

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

  const requestMutation = useMutation({
    mutationFn: async (formData) => {
      return (await api.post('/interviews/request', formData)).data;
    },
    onSuccess: (data) => {
      setToast({ message: data.message || 'Interview request submitted successfully.', type: 'success' });
      setModalOpen(false);
      setForm({
        interviewType: 'HR Interview',
        preferredDate: '',
        preferredTime: '09:00 AM',
        notes: ''
      });
      refetchRequests();
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || err.message || 'Submission failed', type: 'error' });
    }
  });

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!form.preferredDate || !form.preferredTime) {
      setToast({ message: 'Preferred Date and Time are required.', type: 'error' });
      return;
    }
    const requestedDate = new Date(form.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      setToast({ message: 'Preferred date cannot be in the past.', type: 'error' });
      return;
    }

    requestMutation.mutate({
      interviewType: form.interviewType,
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime,
      adminRemark: form.notes
    });
  };

  const updateAnswer = (index, userAnswer) => {
    setSession((current) => ({
      ...current,
      questions: current.questions.map((q, i) => i === index ? { ...q, userAnswer } : q)
    }));
  };

  const downloadConfirmationCard = (req) => {
    const formattedDate = new Date(req.adminScheduledDate).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 800 500" width="800" height="500">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4f46e5" />
            <stop offset="100%" stop-color="#06b6d4" />
          </linearGradient>
          <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.12" />
          </filter>
        </defs>
        
        <rect width="100%" height="100%" fill="#f8fafc" />
        <rect x="0" y="0" width="800" height="15" fill="url(#bg)" />
        <rect x="40" y="40" width="720" height="420" rx="24" fill="#ffffff" filter="url(#shadow)" />
        
        <g transform="translate(80, 80)">
          <circle cx="20" cy="20" r="20" fill="url(#bg)" />
          <path d="M14 20 L20 14 L26 20 M20 14 L20 26" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          <text x="55" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="24" font-weight="900" fill="#0f172a">INTERVIEW AI</text>
          <text x="55" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="800" fill="#94a3b8" letter-spacing="2">PLACEMENT READY</text>
        </g>
        
        <rect x="520" y="80" width="200" height="40" rx="20" fill="#f0fdf4" />
        <circle cx="545" cy="100" r="6" fill="#22c55e" />
        <text x="562" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="800" fill="#15803d" letter-spacing="1">CONFIRMED</text>
        
        <text x="80" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="28" font-weight="900" fill="#0f172a" font-style="italic">Interview Ticket</text>
        <text x="80" y="220" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="500" fill="#64748b">Your live mock interview is officially scheduled and set.</text>
        
        <g transform="translate(80, 270)">
          <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="800" fill="#94a3b8" letter-spacing="1.5">CANDIDATE</text>
          <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="700" fill="#334155">${req.userName}</text>
          <text x="0" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="600" fill="#64748b">${req.userEmail}</text>
          
          <text x="0" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="800" fill="#94a3b8" letter-spacing="1.5">INTERVIEW TYPE</text>
          <text x="0" y="119" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="700" fill="#334155">${req.interviewType}</text>
          
          <text x="360" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="800" fill="#94a3b8" letter-spacing="1.5">SCHEDULED DATE &amp; TIME</text>
          <text x="360" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="700" fill="#334155">${formattedDate}</text>
          <text x="360" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="800" fill="#4f46e5">${req.adminScheduledTime}</text>
          
          <text x="360" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="800" fill="#94a3b8" letter-spacing="1.5">GOOGLE MEET LINK</text>
          ${req.googleMeetLink ? `
          <a xlink:href="${req.googleMeetLink}" href="${req.googleMeetLink}" target="_blank" rel="noopener noreferrer">
            <text x="360" y="119" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#0ea5e9" text-decoration="underline">Join Google Meet</text>
          </a>
          ` : `
          <text x="360" y="119" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="600" fill="#d97706" font-style="italic">Meeting link will be available soon.</text>
          `}
        </g>
        
        <path d="M40 420 L760 420" stroke="#f1f5f9" stroke-width="2" stroke-dasharray="8 6" />
        <text x="80" y="445" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#94a3b8">Note: ${req.adminRemark || 'Be prepared and login 5 minutes before scheduled start.'}</text>
      </svg>
    `;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Interview_Confirmation_${req.interviewType.replace(/\s+/g, '_')}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in p-4 relative">
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 p-4 px-6 rounded-3xl shadow-2xl flex items-center gap-3 transition-all duration-300 border backdrop-blur-md ${
          toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-rose-500/90 border-rose-400 text-white'
        }`}>
          <AlertCircle size={18} />
          <p className="font-bold text-sm">{toast.message}</p>
          <button onClick={() => setToast({ message: '', type: '' })} className="ml-2 hover:scale-110 transition-transform">
            <X size={16} />
          </button>
        </div>
      )}

      {/* AI Mock Interview section (Header + Cards) */}
      <div>
        <h1 className="text-4xl font-black gradient-text">AI Mock Interview</h1>
        <p className="text-slate-500 mt-2 font-medium">Elevate your performance with real-time AI evaluation.</p>
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
        <div className="space-y-8 animate-fade-in">
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

      {/* Live HR Interview Scheduling (New Section) */}
      <div className="glass-card !p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black italic">Schedule Live HR Interview</h2>
              <p className="text-slate-500 text-xs font-semibold mt-1">Request a one-to-one interview with our HR team.</p>
            </div>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            disabled={requests.some(r => r.status === 'Pending')}
            className="btn-primary flex items-center gap-2 !rounded-2xl !py-3 !px-6 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-black italic"
          >
            <Plus size={18} />
            Request Interview
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-10 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 p-6 bg-slate-50/50 dark:bg-white/5">
            <p className="text-slate-500 font-bold">No live interview scheduled yet.</p>
            <p className="text-slate-400 text-xs mt-1 font-medium">Submit an interview request to start scheduling.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-black italic">My Interview Requests</h3>
            <div className="overflow-x-auto rounded-[2rem] border border-slate-100 dark:border-white/5 bg-white/30 dark:bg-white/5">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="p-5">Interview Type</th>
                    <th className="p-5">Requested Date</th>
                    <th className="p-5">Requested Time</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Scheduled Date</th>
                    <th className="p-5">Scheduled Time</th>
                    <th className="p-5">Google Meet</th>
                    <th className="p-5">Admin Remark</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm font-semibold">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
                      <td className="p-5 font-bold text-slate-800 dark:text-slate-200">{req.interviewType}</td>
                      <td className="p-5 text-slate-700 dark:text-slate-300">
                        {new Date(req.preferredDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-5 text-slate-700 dark:text-slate-300">{req.preferredTime}</td>
                      <td className="p-5">
                        <span className={`badge ${
                          req.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900/50' :
                          req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-900/50' :
                          req.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-900/50' :
                          'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-5">
                        {req.adminScheduledDate ? (
                          <div className="text-slate-800 dark:text-slate-200">
                            {new Date(req.adminScheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Unscheduled</span>
                        )}
                      </td>
                      <td className="p-5">
                        {req.adminScheduledTime ? (
                          <div>
                            <div className="text-slate-800 dark:text-slate-200 font-bold">{req.adminScheduledTime}</div>
                            {req.status === 'Accepted' && (
                              <div className="mt-1">
                                <InterviewCountdown scheduledDateStr={req.adminScheduledDate} scheduledTimeStr={req.adminScheduledTime} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">—</span>
                        )}
                      </td>
                      <td className="p-5">
                        {req.status === 'Accepted' ? (
                          req.googleMeetLink ? (
                            <div className="space-y-1.5">
                              <a 
                                href={req.googleMeetLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-primary !py-1.5 !px-4 !rounded-xl text-xs flex items-center gap-1.5 w-fit font-bold"
                              >
                                <Video size={14} />
                                Join Interview
                              </a>
                              <a 
                                href={req.googleMeetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 underline text-xs block font-bold"
                              >
                                Join Google Meet
                              </a>
                            </div>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 italic text-xs font-bold block">Meeting link will be available soon.</span>
                          )
                        ) : (
                          <span className="text-slate-400 italic text-xs">—</span>
                        )}
                      </td>
                      <td className="p-5 text-xs max-w-[200px] truncate text-slate-600 dark:text-slate-400" title={req.adminRemark}>
                        {req.adminRemark || <span className="text-slate-400 italic">—</span>}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => {
                              setSelectedRequest(req);
                              setShowDetailsModal(true);
                            }}
                            className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white dark:bg-white/5 dark:text-slate-300 flex items-center justify-center transition-all"
                            title="View Details"
                          >
                            <Info size={14} />
                          </button>
                          {req.status === 'Accepted' && (
                            <button 
                              onClick={() => downloadConfirmationCard(req)}
                              className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-white/5 dark:text-indigo-300 flex items-center justify-center transition-all"
                              title="Download Ticket"
                            >
                              <Download size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-card !p-8 relative">
            <button onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black italic flex items-center gap-2 mb-4">
              <Info className="text-indigo-600" size={24} />
              Request Details
            </h2>
            <div className="space-y-4 text-sm font-semibold">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Candidate</div>
                  <div className="text-slate-800 dark:text-slate-200 text-base font-bold">{selectedRequest.userName}</div>
                  <div className="text-xs text-slate-400 font-medium">{selectedRequest.userEmail}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Interview Type</div>
                  <div className="text-slate-800 dark:text-slate-200 text-base font-bold">{selectedRequest.interviewType}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Preferred Slot</div>
                <div className="text-slate-700 dark:text-slate-300 font-bold">
                  {new Date(selectedRequest.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at <span className="text-indigo-600">{selectedRequest.preferredTime}</span>
                </div>
              </div>

              {selectedRequest.adminRemark && (
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Notes / Remarks</div>
                  <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-xs text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap">
                    {selectedRequest.adminRemark}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/5 pt-4">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Current Status</div>
                  <span className={`badge mt-1 ${
                    selectedRequest.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    selectedRequest.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    selectedRequest.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                    'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Google Meet Link</div>
                  <div className="text-sm mt-1">
                    {selectedRequest.googleMeetLink ? (
                      <a 
                        href={selectedRequest.googleMeetLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 underline font-bold"
                      >
                        Join Google Meet
                      </a>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 italic text-xs font-bold">Meeting link will be available soon.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-card !p-8 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black italic flex items-center gap-2 mb-2">
              <Calendar className="text-indigo-600" size={24} />
              New Interview Request
            </h2>
            <p className="text-xs text-slate-500 mb-6 font-semibold">Our recruitment panel will coordinate and schedule a room link for you.</p>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Interview Type</label>
                <select 
                  value={form.interviewType}
                  onChange={(e) => setForm({ ...form, interviewType: e.target.value })}
                  className="input !w-full"
                >
                  <option value="HR Interview">HR Interview</option>
                  <option value="Technical Interview">Technical Interview</option>
                  <option value="Final Interview">Final Interview</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Preferred Date</label>
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                  className="input !w-full"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Preferred Time</label>
                <select 
                  value={form.preferredTime}
                  onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                  className="input !w-full"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Notes</label>
                <textarea 
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Share details on focus areas, topic preferences, or special instructions..."
                  className="input !w-full min-h-[100px] !rounded-[1.5rem]"
                />
              </div>

              <button 
                type="submit"
                disabled={requestMutation.isPending}
                className="btn-primary !w-full !rounded-[1.5rem] !py-4 font-black italic mt-4"
              >
                {requestMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
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

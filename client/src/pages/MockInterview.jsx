import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { 
  Brain, Trophy, Lightbulb, TrendingUp, HelpCircle, ChevronRight, Play, 
  AlertTriangle, Calendar, Video, Download, Plus, X, AlertCircle, Info, Star, Award
} from 'lucide-react';

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

  return <span className="font-bold text-xs text-primary dark:text-blue-400">{timeLeft}</span>;
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

  // Scroll logic for anchor
  useEffect(() => {
    if (window.location.hash === "#hr-interview") {
      const el = document.getElementById("hr-interview-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

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
            <stop offset="0%" stop-color="#2563EB" />
            <stop offset="100%" stop-color="#06B6D4" />
          </linearGradient>
          <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.06" />
          </filter>
        </defs>
        
        <rect width="100%" height="100%" fill="#F8FAFC" />
        <rect x="0" y="0" width="800" height="15" fill="url(#bg)" />
        <rect x="40" y="40" width="720" height="420" rx="16" fill="#ffffff" filter="url(#shadow)" stroke="#e2e8f0" stroke-width="1" />
        
        <g transform="translate(80, 80)">
          <circle cx="20" cy="20" r="18" fill="url(#bg)" />
          <path d="M14 20 L20 14 L26 20 M20 14 L20 26" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          <text x="55" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="900" fill="#111827">INTERVIEW AI</text>
          <text x="55" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="9" font-weight="800" fill="#64748b" letter-spacing="2">PLACEMENT READY</text>
        </g>
        
        <rect x="540" y="75" width="140" height="36" rx="8" fill="#ecfdf5" />
        <circle cx="560" cy="93" r="5" fill="#10b981" />
        <text x="575" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="800" fill="#047857" letter-spacing="1">CONFIRMED</text>
        
        <text x="80" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="26" font-weight="800" fill="#111827">HR Live Interview Ticket</text>
        <text x="80" y="220" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="500" fill="#475569">Your mock preparation session has been verified and confirmed.</text>
        
        <g transform="translate(80, 270)">
          <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="800" fill="#94a3b8" letter-spacing="1.5">CANDIDATE</text>
          <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#1e293b">${req.userName}</text>
          <text x="0" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="600" fill="#64748b">${req.userEmail}</text>
          
          <text x="0" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="800" fill="#94a3b8" letter-spacing="1.5">SESSION TYPE</text>
          <text x="0" y="119" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#1e293b">${req.interviewType}</text>
          
          <text x="360" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="800" fill="#94a3b8" letter-spacing="1.5">SCHEDULED SLOT</text>
          <text x="360" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#1e293b">${formattedDate}</text>
          <text x="360" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="800" fill="#2563eb">${req.adminScheduledTime}</text>
          
          <text x="360" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="800" fill="#94a3b8" letter-spacing="1.5">GOOGLE MEET LINK</text>
          ${req.googleMeetLink ? `
          <a xlink:href="${req.googleMeetLink}" href="${req.googleMeetLink}" target="_blank" rel="noopener noreferrer">
            <text x="360" y="119" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="700" fill="#2563eb" text-decoration="underline">Join Google Meet</text>
          </a>
          ` : `
          <text x="360" y="119" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="600" fill="#d97706" font-style="italic">Meeting link will be available soon.</text>
          `}
        </g>
        
        <path d="M40 420 L760 420" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="6 4" />
        <text x="80" y="445" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="700" fill="#94a3b8">Remark: ${req.adminRemark || 'Join the session link 5 minutes prior.'}</text>
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
    <div className="space-y-8 animate-fade-in p-2 md:p-4 max-w-[1600px] mx-auto relative">
      
      {/* Toast Alert */}
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 p-4 px-6 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 border ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <AlertCircle size={18} />
          <p className="font-semibold text-xs">{toast.message}</p>
          <button onClick={() => setToast({ message: '', type: '' })} className="ml-2 hover:opacity-80 transition">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">AI Mock Interview</h1>
        <p className="text-slate-500 mt-2 font-medium">Practice domain-focused technical and behavioral interview sessions powered by dynamic AI query feedback.</p>
      </div>

      {/* Configuration Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Domain category</label>
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Difficulty level</label>
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              className="btn-primary w-full h-[46px] text-xs font-bold"
            >
              {startMutation.isPending ? 'Generating Session...' : (
                <>
                  <Play size={14} />
                  Start AI Interview
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-lg flex items-start gap-3">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-750 dark:text-red-400">{error}</p>
              <button
                onClick={() => { setError(''); startMutation.mutate(); }}
                className="text-[10px] font-bold text-red-600 dark:text-red-300 underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Session Display */}
      {session && (
        <div className="space-y-6 animate-slide-up">
          
          {/* Active Session Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-primary flex items-center justify-center">
                <Brain size={22} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200 leading-tight">{session.domain}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="badge bg-blue-50 border border-blue-100 text-primary dark:bg-blue-900/20 dark:text-blue-300 font-bold">{session.type}</span>
                  <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold">{session.difficulty}</span>
                </div>
              </div>
            </div>
            {session.overallScore !== undefined && (
              <div className="flex items-center gap-4 border-l border-slate-100 dark:border-slate-800 pl-6">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Overall Score</p>
                  <p className="text-3xl font-extrabold text-primary dark:text-blue-400 mt-1">{session.overallScore}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600">
                  <Trophy size={20} />
                </div>
              </div>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {session.questions && session.questions.map((item, index) => (
              <div key={item._id || index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-xl font-extrabold text-slate-300 dark:text-slate-700 select-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 leading-relaxed italic">
                      &quot;{item.question}&quot;
                    </h3>

                    {!session.overallScore ? (
                      <textarea
                        className="input min-h-[120px] font-medium"
                        value={item.userAnswer || ''}
                        onChange={(e) => updateAnswer(index, e.target.value)}
                        placeholder="Type your response here..."
                      />
                    ) : (
                      <div className="space-y-6 pt-2">
                        {/* Rating bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                            <span>AI Performance Score</span>
                            <span className="text-primary font-black">{item.score}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${item.score}%` }} />
                          </div>
                        </div>

                        {/* Strengths & Improvements */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <FeedbackBox title="Strengths & Match Points" items={item.strengths} icon={<TrendingUp size={14} />} color="emerald" />
                          <FeedbackBox title="Opportunities to Improve" items={item.improvements} icon={<Lightbulb size={14} />} color="amber" />
                        </div>

                        {/* Expert suggestion answers */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="text-primary" size={14} />
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Suggested Professional Response</span>
                          </div>
                          <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">
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

          {/* Submission button */}
          {!session.overallScore && (
            <button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="btn-primary w-full py-4 text-sm font-extrabold shadow-md shadow-blue-500/10 rounded-xl"
            >
              {submitMutation.isPending ? 'Analyzing responses...' : 'Submit Session for AI Review'}
            </button>
          )}
        </div>
      )}

      {/* Live HR Interview Scheduling Section */}
      <div id="hr-interview-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-primary flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-none">Schedule Live HR Interview</h2>
              <p className="text-slate-500 text-xs mt-1.5 font-medium">Request a one-to-one mock session with our recruitment advisors.</p>
            </div>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            disabled={requests.some(r => r.status === 'Pending')}
            className="btn-primary flex items-center gap-2 text-xs font-bold py-2.5 px-4 disabled:opacity-50"
          >
            <Plus size={14} />
            Request Advisor Slot
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-950/20">
            <p className="text-slate-500 font-bold text-sm">No live mock sessions requested yet.</p>
            <p className="text-slate-400 text-xs mt-1 font-medium">Submit a request to schedule a slot on Google Meet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Your Scheduled Requests</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse min-w-[900px] text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC]/50 dark:bg-slate-950/40 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="p-4">Session Role</th>
                    <th className="p-4">Preferred Date</th>
                    <th className="p-4">Preferred Slot</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Scheduled Date</th>
                    <th className="p-4">Scheduled Time</th>
                    <th className="p-4">Google Meet Link</th>
                    <th className="p-4">Advisor Notes</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-semibold text-slate-650 dark:text-slate-300 bg-white dark:bg-slate-900">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{req.interviewType}</td>
                      <td className="p-4">{new Date(req.preferredDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="p-4 text-primary dark:text-blue-400">{req.preferredTime}</td>
                      <td className="p-4">
                        <span className={`badge ${
                          req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/20' :
                          req.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20' :
                          req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/10 dark:text-rose-450 dark:border-rose-900/20' :
                          'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {req.adminScheduledDate ? (
                          <span className="text-slate-800 dark:text-slate-200">
                            {new Date(req.adminScheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-medium">Unscheduled</span>
                        )}
                      </td>
                      <td className="p-4">
                        {req.adminScheduledTime ? (
                          <div>
                            <span className="text-slate-800 dark:text-slate-200 font-bold">{req.adminScheduledTime}</span>
                            {req.status === 'Accepted' && (
                              <div className="mt-1">
                                <InterviewCountdown scheduledDateStr={req.adminScheduledDate} scheduledTimeStr={req.adminScheduledTime} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic font-medium">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {req.status === 'Accepted' && req.googleMeetLink ? (
                          <a 
                            href={req.googleMeetLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-bold flex items-center gap-1"
                          >
                            <Video size={12} />
                            Google Meet
                          </a>
                        ) : (
                          <span className="text-slate-400 italic font-medium">—</span>
                        )}
                      </td>
                      <td className="p-4 max-w-[150px] truncate text-slate-500 dark:text-slate-400" title={req.adminRemark}>
                        {req.adminRemark || <span className="text-slate-400 italic">—</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button 
                            onClick={() => {
                              setSelectedRequest(req);
                              setShowDetailsModal(true);
                            }}
                            className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition"
                            title="View Info"
                          >
                            <Info size={12} />
                          </button>
                          {req.status === 'Accepted' && (
                            <button 
                              onClick={() => downloadConfirmationCard(req)}
                              className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 hover:bg-primary hover:text-white dark:bg-blue-900/20 dark:border-blue-800 text-primary flex items-center justify-center transition"
                              title="Download SVG Ticket"
                            >
                              <Download size={12} />
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
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-6 relative">
            <button onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Award className="text-primary" size={20} />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Scheduled Details</h3>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="space-y-3 text-xs font-semibold text-slate-650 dark:text-slate-350">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-0.5">Candidate</span>
                    <span className="text-slate-850 dark:text-slate-200 font-bold truncate block">{selectedRequest.userName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-0.5">Session Type</span>
                    <span className="text-slate-850 dark:text-slate-200 font-bold block">{selectedRequest.interviewType}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-0.5">Preferred Date/Time Slot</span>
                  <span className="text-slate-800 dark:text-slate-150 font-bold block">
                    {new Date(selectedRequest.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedRequest.preferredTime}
                  </span>
                </div>

                {selectedRequest.adminRemark && (
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-0.5">Advisor Notes / Instructions</span>
                    <p className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg text-slate-600 dark:text-slate-450 italic leading-relaxed border border-slate-100 dark:border-slate-800/80">
                      {selectedRequest.adminRemark}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-1">State Status</span>
                    <span className={`badge ${
                      selectedRequest.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      selectedRequest.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-1">Meet Workspace</span>
                    {selectedRequest.googleMeetLink ? (
                      <a 
                        href={selectedRequest.googleMeetLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline font-bold flex items-center gap-1 mt-1"
                      >
                        <Video size={12} />
                        Join Meet Link
                      </a>
                    ) : (
                      <span className="text-slate-400 italic text-[10px] block mt-1">Pending approval</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Scheduling Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-6 relative">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="text-primary" size={20} />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Request Advisor Slot</h3>
              </div>
              <p className="text-slate-500 text-xs font-medium">Select a date slot and type. An advisor will coordinate the invite.</p>
              
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Interview Type</label>
                  <select 
                    value={form.interviewType}
                    onChange={(e) => setForm({ ...form, interviewType: e.target.value })}
                    className="input"
                  >
                    <option value="HR Interview">HR Interview</option>
                    <option value="Technical Interview">Technical Interview</option>
                    <option value="Final Interview">Final Interview</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Preferred Date</label>
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.preferredDate}
                    onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Preferred Time Slot</label>
                  <select 
                    value={form.preferredTime}
                    onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                    className="input"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Topic focus / Notes</label>
                  <textarea 
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Focus domains, languages, or special notes..."
                    className="input min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary py-2.5 px-4 text-xs !rounded-lg">Cancel</button>
                  <button type="submit" disabled={requestMutation.isPending} className="btn-primary py-2.5 px-5 text-xs !rounded-lg">
                    {requestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackBox({ title, items, icon, color }) {
  const colorMap = {
    emerald: 'text-emerald-700 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/30',
    amber: 'text-amber-700 bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:text-amber-450 dark:border-amber-900/30'
  };

  return (
    <div className={`p-4 rounded-xl border ${colorMap[color]} space-y-3 flex-1`}>
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-wider">{title}</span>
      </div>
      <ul className="space-y-2">
        {items?.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-xs font-medium leading-relaxed">
            <ChevronRight size={13} className="mt-0.5 shrink-0 text-slate-400" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, YAxis } from 'recharts';
import { Clock, Terminal, Sparkles, TrendingUp, ChevronRight, Calendar, Video, AlertCircle, Download, Plus, X } from 'lucide-react';
import MetricCard from '../components/MetricCard.jsx';
import { api } from '../services/api.js';

const fallbackRadar = [
  { category: 'Frontend', score: 80 },
  { category: 'Backend', score: 65 },
  { category: 'DBMS', score: 70 },
  { category: 'DSA', score: 45 },
  { category: 'Interview', score: 60 }
];

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
        // If it started less than 60 mins ago
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
    const interval = setInterval(calculateTime, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [scheduledDateStr, scheduledTimeStr]);

  return <span className="font-black text-xs text-indigo-600 dark:text-indigo-400 italic">{timeLeft}</span>;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard')).data
  });

  const metrics = data?.metrics || {};
  const radarData = data?.latestSkillGap?.radarData?.length ? data.latestSkillGap.radarData : fallbackRadar;

  const barData = [
    { name: 'Resume', score: metrics.resumeScore || 0, color: '#6366f1' },
    { name: 'ATS', score: metrics.atsScore || 0, color: '#0ea5e9' },
    { name: 'Skill', score: metrics.skillMatchScore || 0, color: '#c084fc' },
    { name: 'Interview', score: metrics.interviewScore || 0, color: '#22c55e' }
  ];

  // Scheduling states
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [form, setForm] = useState({
    interviewType: 'HR Interview',
    preferredDate: '',
    preferredTime: '09:00 AM',
    notes: ''
  });

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

  const isJoinable = (req) => {
    if (req.status !== 'Accepted' || !req.adminScheduledDate || !req.adminScheduledTime || !req.googleMeetLink) return false;
    const scheduledTime = parseDateTime(req.adminScheduledDate, req.adminScheduledTime);
    const now = new Date();
    const startTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000); // 15 mins before
    const endTime = new Date(scheduledTime.getTime() + 60 * 60 * 1000); // 60 mins after
    return now >= startTime && now <= endTime;
  };

  const downloadConfirmationCard = (req) => {
    const formattedDate = new Date(req.adminScheduledDate).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
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
          <text x="360" y="119" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#0ea5e9">${req.googleMeetLink}</text>
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Candidate Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Precision tracking for your ultimate placement success.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card !p-3 !px-6 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Live Ready</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <MetricCard title="Aura Score" value={isLoading ? '--' : metrics.resumeScore || 0} suffix="%" helper="Resume Quality" />
        <MetricCard title="ATS Match" value={isLoading ? '--' : metrics.atsScore || 0} suffix="%" helper="Keyword Extraction" />
        <MetricCard title="Readiness" value={isLoading ? '--' : metrics.placementReadiness || 0} suffix="%" helper="Total Preparedness" />
        <MetricCard title="Vibe Check" value={isLoading ? '--' : metrics.interviewScore || 0} suffix="%" helper="Interview IQ" />
        <MetricCard title="Hustle Streak" value={metrics.streak || 0} helper="Unstoppable Days" />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Radar Chart */}
        <div className="lg:col-span-12 xl:col-span-5 glass-card !p-8">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-500" />
                Skill Architecture
             </h2>
             <span className="text-[10px] font-black uppercase text-slate-400">AI Verified</span>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-12 xl:col-span-7 glass-card !p-8">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-500" />
                Performance Breakdown
             </h2>
             <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500/20" />
                <div className="w-3 h-3 rounded-full bg-indigo-500/40" />
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
             </div>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                   cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
                   contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                 />
                <Bar dataKey="score" radius={[20, 20, 20, 20]} barSize={45}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activities */}
        <div className="lg:col-span-12 glass-card !p-8">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock size={20} className="text-indigo-500" />
                Live Feed
             </h2>
             <button className="text-[10px] font-black uppercase text-indigo-500 hover:underline">View All History</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(data?.activities?.length ? data.activities : [{ title: 'Begin your journey by uploading your resume.', time: new Date() }]).map((activity, index) => (
              <div key={index} className="group relative flex items-center gap-4 p-5 rounded-[2rem] bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-xl hover:shadow-indigo-500/5">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                   <Terminal size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{activity.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{activity.time ? new Date(activity.time).toLocaleDateString() : 'Just now'}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <ChevronRight size={16} className="text-indigo-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Scheduling */}
        <div className="lg:col-span-12 glass-card !p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black italic">Interview Scheduling</h2>
                <p className="text-slate-500 text-xs font-semibold mt-1">Schedule a live HR mock, technical, or final placement round with our panel.</p>
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
              <p className="text-slate-400 text-xs mt-1">Submit an interview request to kickstart your real-time recruitment vetting.</p>
            </div>
          ) : (
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
                        {isJoinable(req) ? (
                          <a 
                            href={req.googleMeetLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-primary !py-1.5 !px-4 !rounded-xl text-xs flex items-center gap-1.5 w-fit"
                          >
                            <Video size={14} />
                            Join Interview
                          </a>
                        ) : req.status === 'Accepted' ? (
                          <span className="text-xs text-slate-400 italic">Open 15m before</span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">—</span>
                        )}
                      </td>
                      <td className="p-5 text-xs max-w-[200px] truncate text-slate-600 dark:text-slate-400" title={req.adminRemark}>
                        {req.adminRemark || <span className="text-slate-400 italic">—</span>}
                      </td>
                      <td className="p-5 text-right">
                        {req.status === 'Accepted' && (
                          <button 
                            onClick={() => downloadConfirmationCard(req)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ml-auto bg-indigo-50 dark:bg-white/5 p-2 px-3 rounded-xl transition-all"
                          >
                            <Download size={14} />
                            Ticket
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Additional Notes</label>
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

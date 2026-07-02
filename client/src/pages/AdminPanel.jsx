import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { LayoutDashboard, Database, BookOpen, HelpCircle, Bot, Plus, Trash2, Edit3, Sparkles, ChevronRight, BarChart3, Calendar, Search, Check, X, Info } from 'lucide-react';

async function apiRequest(url, options = {}) {
  try {
    const response = await api({
      url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      ...options
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Request failed");
  }
}

export default function AdminPanel() {
  const [tab, setTab] = useState('dashboard');
  const [message, setMessage] = useState('');

  const [stats, setStats] = useState({});
  const [domains, setDomains] = useState([]);
  const [skills, setSkills] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Interview Requests Admin States
  const [interviews, setInterviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [acceptForm, setAcceptForm] = useState({ id: '', date: '', time: '09:00 AM', meetLink: '', remark: '' });
  const [rejectForm, setRejectForm] = useState({ id: '', remark: '' });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [domainForm, setDomainForm] = useState({ name: '', description: '' });
  const [skillForm, setSkillForm] = useState({ domain: '', name: '', level: 'beginner' });
  const [roadmapForm, setRoadmapForm] = useState({
    domain: '',
    title: '',
    stagesText: '',
  });
  const [questionForm, setQuestionForm] = useState({
    domain: '',
    type: 'technical',
    difficulty: 'easy',
    question: '',
    expectedAnswer: '',
  });
  const [botQuestion, setBotQuestion] = useState('');
  const [botAnswer, setBotAnswer] = useState('');

  async function loadData() {
    try {
      const [s, d, sk, r, q] = await Promise.all([
        apiRequest('/admin-content/stats'),
        apiRequest('/admin-content/domains'),
        apiRequest('/admin-content/skills'),
        apiRequest('/admin-content/roadmaps'),
        apiRequest('/admin-content/questions'),
      ]);

      setStats(s);
      setDomains(d);
      setSkills(sk);
      setRoadmaps(r);
      setQuestions(q);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadInterviews() {
    try {
      let url = `/admin/interviews?q=${encodeURIComponent(searchQuery)}&status=${statusFilter}&interviewType=${typeFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      const data = await apiRequest(url);
      setInterviews(data.requests || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Polling / fetching for interviews
  useEffect(() => {
    if (tab === 'interviews') {
      loadInterviews();
      const interval = setInterval(loadInterviews, 15000);
      return () => clearInterval(interval);
    }
  }, [tab, searchQuery, statusFilter, typeFilter, sortBy, sortOrder]);

  async function handleAccept(e) {
    e.preventDefault();
    if (!acceptForm.date || !acceptForm.time || !acceptForm.meetLink) {
      setMessage('Scheduled date, time, and Google Meet URL are required.');
      return;
    }
    if (!acceptForm.meetLink.startsWith('https://meet.google.com/')) {
      setMessage('Google Meet link must start with https://meet.google.com/');
      return;
    }
    try {
      await apiRequest(`/admin/interviews/accept/${acceptForm.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          adminScheduledDate: acceptForm.date,
          adminScheduledTime: acceptForm.time,
          googleMeetLink: acceptForm.meetLink,
          adminRemark: acceptForm.remark
        })
      });
      setMessage('Interview scheduled and confirmation updated successfully.');
      setShowAcceptModal(false);
      loadInterviews();
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleReject(e) {
    e.preventDefault();
    if (!rejectForm.remark) {
      setMessage('Rejection remark is required.');
      return;
    }
    try {
      await apiRequest(`/admin/interviews/reject/${rejectForm.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          adminRemark: rejectForm.remark
        })
      });
      setMessage('Interview request rejected successfully.');
      setShowRejectModal(false);
      loadInterviews();
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteRequest(id) {
    if (!window.confirm('Are you sure you want to delete this interview request?')) return;
    try {
      await apiRequest(`/admin/interviews/${id}`, { method: 'DELETE' });
      setMessage('Request deleted successfully');
      loadInterviews();
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addDomain(e) {
    e.preventDefault();
    try {
      await apiRequest('/admin-content/domains', {
        method: 'POST',
        body: JSON.stringify(domainForm),
      });
      setDomainForm({ name: '', description: '' });
      setMessage('Domain added successfully');
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addSkill(e) {
    e.preventDefault();
    try {
      const isEdit = Boolean(skillForm.id);
      if (isEdit) {
        await apiRequest(`/admin-content/skills/${skillForm.id}`, {
          method: "PUT",
          body: JSON.stringify(skillForm),
        });
        setMessage("Skill updated successfully");
      } else {
        const skillsArray = skillForm.name.split(",").map(skill => skill.trim()).filter(skill => skill !== "");
        for (const skillRaw of skillsArray) {
          let name = skillRaw;
          let aliases = [];
          const match = skillRaw.match(/^([^(]+)\s*\(([^)]+)\)$/);
          if (match) {
            name = match[1].trim();
            aliases = match[2].split(",").map(a => a.trim());
          }

          await apiRequest("/admin-content/skills", {
            method: "POST",
            body: JSON.stringify({
              ...skillForm,
              name: name,
              aliases: aliases
            }),
          });
        }
        setMessage("Skills integrated successfully with aliases");
      }
      setSkillForm({ domain: "", name: "", level: "beginner" });
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteSkill(id) {
    try {
      await apiRequest(`/admin-content/skills/${id}`, { method: "DELETE" });
      setMessage("Skill deleted successfully");
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function editSkill(skill) {
    setSkillForm({
      id: skill._id,
      domain: skill.domain || skill.category || "",
      name: skill.name,
      level: skill.level,
    });
    setMessage("Editing skill...");
  }

  async function addRoadmap(e) {
    e.preventDefault();
    try {
      const isEdit = Boolean(roadmapForm.id);
      const selectedDomain = roadmapForm.domain || roadmapForm.role || roadmapForm.title?.trim();
      const roadmapPayload = { ...roadmapForm, domain: selectedDomain, role: selectedDomain };
      await apiRequest(isEdit ? `/admin-content/roadmaps/${roadmapForm.id}` : '/admin-content/roadmaps', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(roadmapPayload),
      });
      setForm({ id: '', domain: '', title: '', stagesText: '' });
      setMessage(isEdit ? 'Roadmap updated successfully' : 'Roadmap added successfully');
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addQuestion(e) {
    e.preventDefault();
    try {
      const isEdit = Boolean(questionForm.id);
      await apiRequest(isEdit ? `/admin-content/questions/${questionForm.id}` : '/admin-content/questions', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(questionForm),
      });
      setQuestionForm({ id: '', domain: '', type: 'technical', difficulty: 'easy', question: '', expectedAnswer: '' });
      setMessage(isEdit ? 'Question updated successfully' : 'Question added successfully');
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteItem(type, id) {
    try {
      await apiRequest(`/admin-content/${type}/${id}`, { method: 'DELETE' });
      setMessage('Deleted successfully');
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function generateBotAnswer(e) {
    e.preventDefault();
    try {
      const data = await apiRequest('/admin-content/chatbot-answer', {
        method: 'POST',
        body: JSON.stringify({ question: botQuestion }),
      });
      setBotAnswer(data.answer);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="animate-fade-in p-4 space-y-8 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Command Center</h1>
          <p className="text-slate-500 mt-2 font-medium">Control the core intelligence of Interview AI.</p>
        </div>
      </div>

      {message && (
        <div className="glass-card !bg-indigo-600/5 !border-indigo-600/10 p-4 px-6 flex items-center justify-between">
          <p className="text-indigo-600 font-bold italic tracking-tight">{message}</p>
          <button onClick={() => setMessage('')} className="text-indigo-400 hover:text-indigo-600 font-black">CLOSE</button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 glass-card !p-2 !bg-white/40 dark:!bg-white/5 backdrop-blur-3xl rounded-[2.5rem]">
        <Tab active={tab === 'dashboard'} icon={<LayoutDashboard size={18} />} onClick={() => setTab('dashboard')}>Overview</Tab>
        <Tab active={tab === 'interviews'} icon={<Calendar size={18} />} onClick={() => setTab('interviews')}>Interview Requests</Tab>
        <Tab active={tab === 'domains'} icon={<ChevronRight size={18} />} onClick={() => setTab('domains')}>Domains</Tab>
        <Tab active={tab === 'skills'} icon={<Database size={18} />} onClick={() => setTab('skills')}>Skills</Tab>
        <Tab active={tab === 'roadmaps'} icon={<BookOpen size={18} />} onClick={() => setTab('roadmaps')}>Roadmaps</Tab>
        <Tab active={tab === 'questions'} icon={<HelpCircle size={18} />} onClick={() => setTab('questions')}>Questions</Tab>
        <Tab active={tab === 'chatbot'} icon={<Bot size={18} />} onClick={() => setTab('chatbot')}>Bot Logic</Tab>
      </div>

      {tab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard title="Total Resumes" value={stats.totalResumes || 0} icon={<BarChart3 className="text-indigo-500" />} />
          <StatCard title="Interview Requests" value={stats.totalInterviews || 0} icon={<Calendar className="text-violet-500" />} />
          <StatCard title="Active Domains" value={stats.totalDomains || 0} icon={<ChevronRight className="text-emerald-500" />} />
          <StatCard title="Target Skills" value={stats.totalSkills || 0} icon={<Database className="text-amber-500" />} />
          <StatCard title="Roadmaps" value={stats.totalRoadmaps || 0} icon={<BookOpen className="text-indigo-600" />} />
          <StatCard title="Question Bank" value={stats.totalQuestions || 0} icon={<HelpCircle className="text-rose-500" />} />
        </div>
      )}

      {tab === 'interviews' && (
        <Section title="Interview Scheduling Pipeline">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-6">
            <div className="relative lg:col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input lg:col-span-2"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>

            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input lg:col-span-2"
            >
              <option value="">All Types</option>
              <option value="HR Interview">HR Interview</option>
              <option value="Technical Interview">Technical Interview</option>
              <option value="Final Interview">Final Interview</option>
            </select>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input lg:col-span-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="Date">Scheduled Date</option>
              <option value="Status">Status</option>
              <option value="User Name">User Name</option>
            </select>

            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input lg:col-span-2"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {interviews.length === 0 ? (
            <div className="text-center py-10 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 p-6 bg-slate-50/50 dark:bg-white/5">
              <p className="text-slate-500 font-bold">No scheduling requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[2rem] border border-slate-100 dark:border-white/5 bg-white/30 dark:bg-white/5">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="p-5">User</th>
                    <th className="p-5">Email</th>
                    <th className="p-5">Type</th>
                    <th className="p-5">Preferred Date</th>
                    <th className="p-5">Preferred Time</th>
                    <th className="p-5">Scheduled Slot</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Created On</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm font-semibold">
                  {interviews.map((req) => (
                    <tr key={req._id} className="hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
                      <td className="p-5 text-slate-800 dark:text-slate-200 font-bold">{req.userName}</td>
                      <td className="p-5 text-slate-600 dark:text-slate-400">{req.userEmail}</td>
                      <td className="p-5 text-slate-800 dark:text-slate-200">{req.interviewType}</td>
                      <td className="p-5 text-slate-700 dark:text-slate-300">
                        {new Date(req.preferredDate).toLocaleDateString()}
                      </td>
                      <td className="p-5 text-slate-700 dark:text-slate-300">{req.preferredTime}</td>
                      <td className="p-5">
                        {req.adminScheduledDate ? (
                          <div>
                            <div className="text-slate-800 dark:text-slate-200 font-bold">{new Date(req.adminScheduledDate).toLocaleDateString()}</div>
                            <div className="text-xs text-indigo-600 dark:text-indigo-400">{req.adminScheduledTime}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Unscheduled</span>
                        )}
                      </td>
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
                      <td className="p-5 text-xs text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-5">
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
                          {req.status !== 'Accepted' && req.status !== 'Completed' && (
                            <button 
                              onClick={() => {
                                setAcceptForm({ id: req._id, date: req.preferredDate ? req.preferredDate.split('T')[0] : '', time: req.preferredTime || '09:00 AM', meetLink: 'https://meet.google.com/', remark: '' });
                                setShowAcceptModal(true);
                              }}
                              className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center justify-center transition-all"
                              title="Accept & Schedule"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {req.status !== 'Rejected' && req.status !== 'Completed' && (
                            <button 
                              onClick={() => {
                                setRejectForm({ id: req._id, remark: '' });
                                setShowRejectModal(true);
                              }}
                              className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-900/20 dark:text-rose-400 flex items-center justify-center transition-all"
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteRequest(req._id)}
                            className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-600 hover:text-white dark:bg-white/5 flex items-center justify-center transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {tab === 'domains' && (
        <Section title="Domain Infrastructure">
          <form onSubmit={addDomain} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
            <input className="input md:col-span-4" placeholder="Domain Title (e.g. MERN Developer)" value={domainForm.name} onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })} />
            <input className="input md:col-span-6" placeholder="Purpose & Context" value={domainForm.description} onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })} />
            <button type="submit" className="btn-primary md:col-span-2 !rounded-2xl">
              <Plus size={18} />
              Register
            </button>
          </form>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {domains.map((d) => (
              <ListItem key={d._id} title={d.name} subtitle={d.description} onDelete={() => deleteItem('domains', d._id)} />
            ))}
          </div>
        </Section>
      )}

      {tab === 'skills' && (
        <Section title="Expert Skill Engine">
          <form onSubmit={addSkill} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-start">
            <select className="input md:col-span-3" value={skillForm.domain} onChange={(e) => setSkillForm({ ...skillForm, domain: e.target.value })}>
              <option value="">Select Domain Baseline</option>
              {domains.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
            </select>
            <textarea className="input md:col-span-5 min-h-[120px] !rounded-[2rem]" placeholder={'Comma-separated mass upload\nHTML, CSS, React...'} value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} />
            <select className="input md:col-span-2" value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}>
              <option value="beginner">Junior</option>
              <option value="intermediate">Mid-Level</option>
              <option value="advanced">Senior</option>
            </select>
            <button type="submit" className="btn-primary md:col-span-2 !rounded-2xl h-[52px]">Integrate</button>
          </form>

          <div className="space-y-6">
            {domains.map((d) => {
              const domainSkills = skills.filter(s => s.domain === d.name || s.category === d.name);
              if (domainSkills.length === 0) return null;
              return (
                <div key={d._id} className="glass-card !bg-slate-50/50 dark:!bg-white/5 border-none">
                  <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4 italic">{d.name} Baseline</h2>
                  <div className="flex flex-wrap gap-2">
                    {domainSkills.map((s) => (
                      <div key={s._id} className="group relative flex items-center gap-2 badge bg-indigo-50/80 border-indigo-100 dark:bg-white/5 dark:border-white/10 dark:text-slate-300">
                        <span className="font-bold">{s.name}</span>
                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => editSkill(s)} className="p-1 hover:text-indigo-600"><Edit3 size={12} /></button>
                          <button onClick={() => deleteSkill(s._id)} className="p-1 hover:text-rose-600"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {tab === 'roadmaps' && (
        <Section title="Path Architecture">
          <form onSubmit={addRoadmap} className="space-y-4 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <select className="input" value={roadmapForm.domain || ''} onChange={(e) => setRoadmapForm({ ...roadmapForm, domain: e.target.value, role: e.target.value })}>
                <option value="">Link to Domain</option>
                {domains.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
              </select>
              <input className="input" placeholder="Roadmap Identity (e.g. Master MERN in 3 Months)" value={roadmapForm.title} onChange={(e) => setForm({ ...roadmapForm, title: e.target.value })} />
            </div>
            <textarea className="input min-h-[200px] !rounded-[2rem]" placeholder={'Blueprint Stages (line by line):\nStage 1: Foundational HTML\nStage 2: CSS Mastery...'} value={roadmapForm.stagesText} onChange={(e) => setRoadmapForm({ ...roadmapForm, stagesText: e.target.value })} />
            <button type="submit" className="btn-primary !w-full !rounded-[2rem]">Architect Path</button>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            {roadmaps.map((r) => (
              <AdminListItem key={r._id} title={r.title} subtitle={r.domain || r.role} onEdit={() => setRoadmapForm({ id: r._id, domain: r.domain || '', title: r.title || '', stagesText: r.stagesText || (r.stages || []).map(s => s.name || s.title || '').join('\n') })} onDelete={() => deleteItem('roadmaps', r._id)} />
            ))}
          </div>
        </Section>
      )}

      {tab === 'questions' && (
        <Section title="Intelligence Repository">
          <form onSubmit={addQuestion} className="space-y-4 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <select className="input" value={questionForm.domain} onChange={(e) => setQuestionForm({ ...questionForm, domain: e.target.value })}>
                <option value="">Target Domain</option>
                {domains.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
              </select>
              <select className="input" value={questionForm.type} onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}>
                <option value="technical">Technical Rigor</option>
                <option value="hr">HR Culture</option>
                <option value="behavioral">Behavioral Soft-skills</option>
              </select>
              <select className="input" value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}>
                <option value="easy">Elementary</option>
                <option value="medium">Intermediate</option>
                <option value="hard">Veteran</option>
              </select>
            </div>
            <textarea className="input !rounded-[2rem] min-h-[100px]" placeholder="Question Stem" value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} />
            <textarea className="input !rounded-[2rem] min-h-[100px]" placeholder="Gold Standard Answer (For AI Comparison)" value={questionForm.expectedAnswer} onChange={(e) => setQuestionForm({ ...questionForm, expectedAnswer: e.target.value })} />
            <button type="submit" className="btn-primary !w-full !rounded-[2rem]">Commit to Bank</button>
          </form>

          <div className="grid gap-4">
            {questions.map((q) => (
              <AdminListItem key={q._id} title={q.question} subtitle={`${q.domain} • ${q.type} • ${q.difficulty}`} onEdit={() => setQuestionForm({ id: q._id, domain: q.domain || '', type: q.type || 'technical', difficulty: q.difficulty || 'easy', question: q.question || '', expectedAnswer: q.expectedAnswer || '' })} onDelete={() => deleteItem('questions', q._id)} />
            ))}
          </div>
        </Section>
      )}

      {tab === 'chatbot' && (
        <Section title="AI Seed Knowledge">
          <div className="flex items-center gap-3 mb-8 p-6 bg-indigo-600/5 rounded-[2rem] border border-indigo-600/10 italic">
            <Sparkles className="text-indigo-600 shrink-0" size={30} />
            <p className="text-sm font-bold text-indigo-700">Test and refine the AI's persona and factual knowledge here. This simulates the Career Coach's internal logic.</p>
          </div>
          <form onSubmit={generateBotAnswer} className="space-y-4">
            <textarea className="input !rounded-[2rem] min-h-[140px]" placeholder="Simulate a candidate inquiry..." value={botQuestion} onChange={(e) => setBotQuestion(e.target.value)} />
            <button type="submit" className="btn-primary !rounded-[2rem] !py-4 italic font-black">UNLEASH AI</button>
          </form>
          {botAnswer && (
            <div className="mt-8 p-8 glass-card !bg-white/90 dark:!bg-slate-900 border-none relative">
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Bot size={20} />
              </div>
              <p className="text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap">
                {botAnswer}
              </p>
            </div>
          )}
        </Section>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card !p-8 relative">
            <button onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
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
                <div className="text-slate-700 dark:text-slate-300">
                  {new Date(selectedRequest.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at <span className="font-bold text-indigo-600">{selectedRequest.preferredTime}</span>
                </div>
              </div>

              {selectedRequest.adminRemark && (
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Additional Candidate Notes / Remarks</div>
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
                {selectedRequest.adminScheduledDate && (
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Scheduled Date/Time</div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                      {new Date(selectedRequest.adminScheduledDate).toLocaleDateString()} at {selectedRequest.adminScheduledTime}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card !p-8 relative">
            <button onClick={() => setShowAcceptModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black italic flex items-center gap-2 mb-4">
              <Check className="text-emerald-600" size={24} />
              Accept &amp; Schedule
            </h2>

            <form onSubmit={handleAccept} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled Date</label>
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={acceptForm.date}
                  onChange={(e) => setAcceptForm({ ...acceptForm, date: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled Time</label>
                <select 
                  value={acceptForm.time}
                  onChange={(e) => setAcceptForm({ ...acceptForm, time: e.target.value })}
                  className="input w-full"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Meet Link</label>
                <input 
                  type="url"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={acceptForm.meetLink}
                  onChange={(e) => setAcceptForm({ ...acceptForm, meetLink: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Remark / Message</label>
                <textarea 
                  value={acceptForm.remark}
                  onChange={(e) => setAcceptForm({ ...acceptForm, remark: e.target.value })}
                  placeholder="Additional instructions or notes for the candidate..."
                  className="input w-full min-h-[100px] !rounded-[1.5rem]"
                />
              </div>

              <button type="submit" className="btn-primary w-full !rounded-[1.5rem] !py-4 font-black italic mt-4">
                Schedule &amp; Confirm
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card !p-8 relative">
            <button onClick={() => setShowRejectModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black italic flex items-center gap-2 mb-4">
              <X className="text-rose-600" size={24} />
              Reject Request
            </h2>

            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reason / Remark</label>
                <textarea 
                  value={rejectForm.remark}
                  onChange={(e) => setRejectForm({ ...rejectForm, remark: e.target.value })}
                  placeholder="State the reason for rejecting this interview request (e.g. incomplete profile, conflict in schedules)..."
                  className="input w-full min-h-[120px] !rounded-[1.5rem]"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full !rounded-[1.5rem] !py-4 font-black italic mt-4">
                Confirm Rejection
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="glass-card relative overflow-hidden group hover:border-indigo-200 transition-all duration-300">
      <div className="absolute -right-4 -bottom-4 w-16 h-16 opacity-5 group-hover:scale-150 transition-transform">
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 leading-none">{title}</p>
      </div>
      <h2 className="text-3xl font-black italic tracking-tighter text-slate-800 dark:text-white">{value}</h2>
    </div>
  );
}

function Tab({ children, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-[2.5rem] text-sm font-black transition-all duration-300 ${active
          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xl scale-105 z-10'
          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
        }`}
    >
      {icon}
      <span className="italic">{children}</span>
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-black italic mb-6 flex items-center gap-3">
        <div className="w-2 h-8 bg-indigo-600 rounded-full" />
        {title}
      </h2>
      <div className="glass-card !p-8">
        {children}
      </div>
    </div>
  );
}

function AdminListItem({ title, subtitle, onEdit, onDelete }) {
  return (
    <div className="group rounded-[2rem] border border-slate-100 bg-white/50 p-6 flex items-center justify-between gap-4 dark:bg-white/5 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all duration-300">
      <div className="overflow-hidden">
        <h3 className="font-black text-slate-900 dark:text-white truncate italic">{title}</h3>
        <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><Edit3 size={16} /></button>
        <button onClick={onDelete} className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16} /></button>
      </div>
    </div>
  );
}

function ListItem({ title, subtitle, onDelete }) {
  return (
    <div className="group rounded-3xl border border-slate-100 bg-white/50 p-6 flex items-center justify-between gap-4 dark:bg-white/5 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all duration-300">
      <div>
        <h3 className="font-black text-slate-900 dark:text-white italic">{title}</h3>
        <p className="text-xs font-bold text-slate-400 mt-1">{subtitle}</p>
      </div>
      <button onClick={onDelete} className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16} /></button>
    </div>
  );
}
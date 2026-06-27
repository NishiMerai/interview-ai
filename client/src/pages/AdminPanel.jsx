import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { LayoutDashboard, Database, BookOpen, HelpCircle, Bot, Plus, Trash2, Edit3, Sparkles, ChevronRight, BarChart3 } from 'lucide-react';

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

  useEffect(() => {
    loadData();
  }, []);

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
      setRoadmapForm({ id: '', domain: '', title: '', stagesText: '' });
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
    <div className="animate-fade-in p-4 space-y-8 pb-20">
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
        <Tab active={tab === 'domains'} icon={<ChevronRight size={18} />} onClick={() => setTab('domains')}>Domains</Tab>
        <Tab active={tab === 'skills'} icon={<Database size={18} />} onClick={() => setTab('skills')}>Skills</Tab>
        <Tab active={tab === 'roadmaps'} icon={<BookOpen size={18} />} onClick={() => setTab('roadmaps')}>Roadmaps</Tab>
        <Tab active={tab === 'questions'} icon={<HelpCircle size={18} />} onClick={() => setTab('questions')}>Questions</Tab>
        <Tab active={tab === 'chatbot'} icon={<Bot size={18} />} onClick={() => setTab('chatbot')}>Bot Logic</Tab>
      </div>

      {tab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Total Resumes" value={stats.totalResumes || 0} icon={<BarChart3 className="text-indigo-500" />} />
          <StatCard title="Active Domains" value={stats.totalDomains || 0} icon={<ChevronRight className="text-emerald-500" />} />
          <StatCard title="Target Skills" value={stats.totalSkills || 0} icon={<Database className="text-amber-500" />} />
          <StatCard title="Roadmaps" value={stats.totalRoadmaps || 0} icon={<BookOpen className="text-indigo-600" />} />
          <StatCard title="Question Bank" value={stats.totalQuestions || 0} icon={<HelpCircle className="text-rose-500" />} />
        </div>
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
              <input className="input" placeholder="Roadmap Identity (e.g. Master MERN in 3 Months)" value={roadmapForm.title} onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })} />
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
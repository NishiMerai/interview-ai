import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { LayoutDashboard, Database, BookOpen, HelpCircle, Bot, Plus, Trash2, Edit3, Sparkles, ChevronRight, BarChart3, Calendar, Layers, Shield } from 'lucide-react';

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
    <div className="animate-fade-in p-2 md:p-4 space-y-8 max-w-[1600px] mx-auto pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Admin Command Center</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage domains, baseline skill lists, roadmaps, question seeds, and test bot replies.</p>
      </div>

      {message && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/80 p-4 px-6 rounded-xl flex items-center justify-between">
          <p className="text-primary dark:text-blue-400 font-bold text-xs">{message}</p>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl shadow-soft">
        <Tab active={tab === 'dashboard'} icon={<LayoutDashboard size={14} />} onClick={() => setTab('dashboard')}>Overview</Tab>
        <Tab active={tab === 'domains'} icon={<ChevronRight size={14} />} onClick={() => setTab('domains')}>Domains</Tab>
        <Tab active={tab === 'skills'} icon={<Database size={14} />} onClick={() => setTab('skills')}>Skills</Tab>
        <Tab active={tab === 'roadmaps'} icon={<BookOpen size={14} />} onClick={() => setTab('roadmaps')}>Roadmaps</Tab>
        <Tab active={tab === 'questions'} icon={<HelpCircle size={14} />} onClick={() => setTab('questions')}>Questions</Tab>
        <Tab active={tab === 'chatbot'} icon={<Bot size={14} />} onClick={() => setTab('chatbot')}>Bot Logic</Tab>
      </div>

      {/* Overview Statistics */}
      {tab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard title="Total Resumes" value={stats.totalResumes || 0} icon={<BarChart3 className="text-blue-500" />} />
          <StatCard title="Interview Requests" value={stats.totalInterviews || 0} icon={<Calendar className="text-indigo-500" />} />
          <StatCard title="Active Domains" value={stats.totalDomains || 0} icon={<ChevronRight className="text-emerald-500" />} />
          <StatCard title="Target Skills" value={stats.totalSkills || 0} icon={<Database className="text-amber-500" />} />
          <StatCard title="Roadmaps" value={stats.totalRoadmaps || 0} icon={<BookOpen className="text-primary" />} />
          <StatCard title="Question Bank" value={stats.totalQuestions || 0} icon={<HelpCircle className="text-rose-500" />} />
        </div>
      )}

      {/* Domains Tab */}
      {tab === 'domains' && (
        <Section title="Domain Infrastructure">
          <form onSubmit={addDomain} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
            <input className="input md:col-span-4 text-xs" placeholder="Domain Title (e.g. MERN Developer)" value={domainForm.name} onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })} />
            <input className="input md:col-span-6 text-xs" placeholder="Purpose & Context description" value={domainForm.description} onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })} />
            <button type="submit" className="btn-primary md:col-span-2 !rounded-xl text-xs py-3.5">
              <Plus size={14} />
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

      {/* Skills Tab */}
      {tab === 'skills' && (
        <Section title="Expert Skill Engine">
          <form onSubmit={addSkill} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-start">
            <select className="input md:col-span-3 text-xs" value={skillForm.domain} onChange={(e) => setSkillForm({ ...skillForm, domain: e.target.value })}>
              <option value="">Select Domain Baseline</option>
              {domains.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
            </select>
            <textarea className="input md:col-span-5 min-h-[120px] text-xs" placeholder={'Comma-separated mass upload\nHTML, CSS, React...'} value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} />
            <select className="input md:col-span-2 text-xs" value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}>
              <option value="beginner">Junior</option>
              <option value="intermediate">Mid-Level</option>
              <option value="advanced">Senior</option>
            </select>
            <button type="submit" className="btn-primary md:col-span-2 !rounded-xl py-3.5 text-xs">Integrate</button>
          </form>

          <div className="space-y-6">
            {domains.map((d) => {
              const domainSkills = skills.filter(s => s.domain === d.name || s.category === d.name);
              if (domainSkills.length === 0) return null;
              return (
                <div key={d._id} className="bg-slate-50 dark:bg-slate-950/20 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 italic">{d.name} Baseline</h3>
                  <div className="flex flex-wrap gap-2">
                    {domainSkills.map((s) => (
                      <div key={s._id} className="group relative flex items-center gap-2 badge bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350">
                        <span className="font-bold">{s.name}</span>
                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => editSkill(s)} className="p-1 hover:text-primary"><Edit3 size={11} /></button>
                          <button onClick={() => deleteSkill(s._id)} className="p-1 hover:text-rose-600"><Trash2 size={11} /></button>
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

      {/* Roadmaps Tab */}
      {tab === 'roadmaps' && (
        <Section title="Path Architecture">
          <form onSubmit={addRoadmap} className="space-y-4 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <select className="input text-xs" value={roadmapForm.domain || ''} onChange={(e) => setRoadmapForm({ ...roadmapForm, domain: e.target.value, role: e.target.value })}>
                <option value="">Link to Domain</option>
                {domains.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
              </select>
              <input className="input text-xs" placeholder="Roadmap Identity (e.g. Master MERN in 3 Months)" value={roadmapForm.title} onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })} />
            </div>
            <textarea className="input min-h-[160px] text-xs" placeholder={'Blueprint Stages (line by line):\nStage 1: Foundational HTML\nStage 2: CSS Mastery...'} value={roadmapForm.stagesText} onChange={(e) => setRoadmapForm({ ...roadmapForm, stagesText: e.target.value })} />
            <button type="submit" className="btn-primary !w-full py-3.5 text-xs">Architect Path</button>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            {roadmaps.map((r) => (
              <AdminListItem key={r._id} title={r.title} subtitle={r.domain || r.role} onEdit={() => setRoadmapForm({ id: r._id, domain: r.domain || '', title: r.title || '', stagesText: r.stagesText || (r.stages || []).map(s => s.name || s.title || '').join('\n') })} onDelete={() => deleteItem('roadmaps', r._id)} />
            ))}
          </div>
        </Section>
      )}

      {/* Questions Tab */}
      {tab === 'questions' && (
        <Section title="Intelligence Repository">
          <form onSubmit={addQuestion} className="space-y-4 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <select className="input text-xs" value={questionForm.domain} onChange={(e) => setQuestionForm({ ...questionForm, domain: e.target.value })}>
                <option value="">Target Domain</option>
                {domains.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
              </select>
              <select className="input text-xs" value={questionForm.type} onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}>
                <option value="technical">Technical Rigor</option>
                <option value="hr">HR Culture</option>
                <option value="behavioral">Behavioral Soft-skills</option>
              </select>
              <select className="input text-xs" value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}>
                <option value="easy">Elementary</option>
                <option value="medium">Intermediate</option>
                <option value="hard">Veteran</option>
              </select>
            </div>
            <textarea className="input text-xs min-h-[80px]" placeholder="Question Stem" value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} />
            <textarea className="input text-xs min-h-[80px]" placeholder="Gold Standard Answer (For AI Comparison)" value={questionForm.expectedAnswer} onChange={(e) => setQuestionForm({ ...questionForm, expectedAnswer: e.target.value })} />
            <button type="submit" className="btn-primary !w-full py-3.5 text-xs">Commit to Bank</button>
          </form>

          <div className="grid gap-4">
            {questions.map((q) => (
              <AdminListItem key={q._id} title={q.question} subtitle={`${q.domain} • ${q.type} • ${q.difficulty}`} onEdit={() => setQuestionForm({ id: q._id, domain: q.domain || '', type: q.type || 'technical', difficulty: q.difficulty || 'easy', question: q.question || '', expectedAnswer: q.expectedAnswer || '' })} onDelete={() => deleteItem('questions', q._id)} />
            ))}
          </div>
        </Section>
      )}

      {/* Bot Logic Tab */}
      {tab === 'chatbot' && (
        <Section title="AI Seed Knowledge">
          <div className="flex items-center gap-3 mb-8 p-5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800/80">
            <Sparkles className="text-primary shrink-0" size={24} />
            <p className="text-xs font-semibold text-slate-650 dark:text-blue-300">Test and refine the AI's persona and factual knowledge here. This simulates the Career Coach's internal logic.</p>
          </div>
          <form onSubmit={generateBotAnswer} className="space-y-4">
            <textarea className="input min-h-[120px] text-xs" placeholder="Simulate a candidate inquiry..." value={botQuestion} onChange={(e) => setBotQuestion(e.target.value)} />
            <button type="submit" className="btn-primary py-3.5 text-xs">Simulate AI Answer</button>
          </form>
          {botAnswer && (
            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl relative">
              <div className="absolute -top-3 left-6 w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md">
                <Bot size={16} />
              </div>
              <p className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-350 whitespace-pre-wrap pt-2">
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-soft flex items-center gap-4 transition hover:-translate-y-[1px] duration-300">
      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-sm shrink-0">
        {icon}
      </div>
      <div>
        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest leading-none">{title}</span>
        <span className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 block leading-none">{value}</span>
      </div>
    </div>
  );
}

function Tab({ children, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition duration-300
        ${active
          ? 'bg-primary text-white shadow-md shadow-blue-500/10'
          : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
        }
      `}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-6">
      <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
        <Shield className="text-primary" size={16} />
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{title}</h2>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}

function AdminListItem({ title, subtitle, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between gap-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition duration-300">
      <div className="overflow-hidden space-y-1">
        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-250 truncate">{title}</h4>
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{subtitle}</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onEdit} className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition"><Edit3 size={12} /></button>
        <button onClick={onDelete} className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

function ListItem({ title, subtitle, onDelete }) {
  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between gap-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition duration-300">
      <div className="space-y-1">
        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-250">{title}</h4>
        <p className="text-[10px] font-semibold text-slate-400 leading-relaxed">{subtitle}</p>
      </div>
      <button onClick={onDelete} className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition shrink-0"><Trash2 size={12} /></button>
    </div>
  );
}
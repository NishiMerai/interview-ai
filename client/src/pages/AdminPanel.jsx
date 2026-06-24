import { useEffect, useState } from 'react';

import { api } from '../services/api.js';

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
      const skillsArray = skillForm.name
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "");

      for (const skill of skillsArray) {
        await apiRequest("/admin-content/skills", {
          method: "POST",
          body: JSON.stringify({
            ...skillForm,
            name: skill,
          }),
        });
      }

      setMessage("Skills added successfully");
    }

    setSkillForm({
      domain: "",
      name: "",
      level: "beginner",
    });

    loadData();
  } catch (error) {
    setMessage(error.message);
  }
}

async function deleteSkill(id) {
  try {
    if (!id) {
      setMessage("Skill ID not found");
      return;
    }

    await apiRequest(`/admin-content/skills/${id}`, {
      method: "DELETE",
    });

    setMessage("Skill deleted successfully");
    loadData();
  } catch (error) {
    setMessage(error.message);
  }
}

async function editSkill(skill) {
  try {
    if (!skill) {
      setMessage("Skill not found");
      return;
    }

    setSkillForm({
      id: skill._id,
      domain: skill.domain || skill.category || "",
      name: skill.name,
      level: skill.level,
    });

    setMessage("Editing skill...");
  } catch (error) {
    setMessage(error.message);
  }
}

  async function addRoadmap(e) {
  e.preventDefault();

  try {
    const isEdit = Boolean(roadmapForm.id);

   const selectedDomain =
  roadmapForm.domain ||
  roadmapForm.role ||
  roadmapForm.title?.trim();

const roadmapPayload = {
  ...roadmapForm,
  domain: selectedDomain,
  role: selectedDomain,
};
    await apiRequest(
      isEdit
        ? `/admin-content/roadmaps/${roadmapForm.id}`
        : '/admin-content/roadmaps',
      {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(roadmapPayload),
      }
    );

    setRoadmapForm({
      id: '',
      domain: '',
      title: '',
      stagesText: '',
    });

    setMessage(
      isEdit
        ? 'Roadmap updated successfully'
        : 'Roadmap added successfully'
    );

    loadData();
  } catch (error) {
    setMessage(error.message);
  }
}

 async function addQuestion(e) {
  e.preventDefault();

  try {
    const isEdit = Boolean(questionForm.id);

    await apiRequest(
      isEdit
        ? `/admin-content/questions/${questionForm.id}`
        : '/admin-content/questions',
      {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(questionForm),
      }
    );

    setQuestionForm({
      id: '',
      domain: '',
      type: 'technical',
      difficulty: 'easy',
      question: '',
      expectedAnswer: '',
    });

    setMessage(
      isEdit
        ? 'Question updated successfully'
        : 'Question added successfully'
    );

    loadData();
  } catch (error) {
    setMessage(error.message);
  }
}

  async function deleteItem(type, id) {
    try {
      await apiRequest(`/admin-content/${type}/${id}`, {
        method: 'DELETE',
      });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Admin Panel</h1>
          <p className="text-slate-600">Manage domains, skills, roadmaps, questions and chatbot answers.</p>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-indigo-100 text-indigo-800 font-bold">
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Tab active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>Dashboard</Tab>
          <Tab active={tab === 'domains'} onClick={() => setTab('domains')}>Domains</Tab>
          <Tab active={tab === 'skills'} onClick={() => setTab('skills')}>Skills</Tab>
          <Tab active={tab === 'roadmaps'} onClick={() => setTab('roadmaps')}>Roadmaps</Tab>
          <Tab active={tab === 'questions'} onClick={() => setTab('questions')}>Interview Questions</Tab>
          <Tab active={tab === 'chatbot'} onClick={() => setTab('chatbot')}>Chatbot</Tab>
        </div>

        {tab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card title="Total Resume Uploaded" value={stats.totalResumes || 0} />
            <Card title="Total Domain Added" value={stats.totalDomains || 0} />
            <Card title="Required Skill Added" value={stats.totalSkills || 0} />
            <Card title="Roadmaps Added" value={stats.totalRoadmaps || 0} />
            <Card title="Interview Questions Added" value={stats.totalQuestions || 0} />
          </div>
        )}

        {tab === 'domains' && (
          <Section title="Add / Delete Domain">
            <form onSubmit={addDomain} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="input" placeholder="Domain name e.g. MERN Developer" value={domainForm.name} onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })} />
              <input className="input" placeholder="Description" value={domainForm.description} onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })} />
              <button type="submit" className="btn">Add Domain</button>
            </form>

            <List>
              {domains.map((d) => (
                <ListItem key={d._id} title={d.name} subtitle={d.description} onDelete={() => deleteItem('domains', d._id)} />
              ))}
            </List>
          </Section>
        )}

        {tab === 'skills' && (
          <Section title="Add / Delete Skills For Domain">
           <form onSubmit={addSkill} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="input" value={skillForm.domain} onChange={(e) => setSkillForm({ ...skillForm, domain: e.target.value })}>
                <option value="">Select Domain</option>
                {domains.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
              </select>
              <textarea
  className="input"
  rows={3}
  placeholder="Enter skills separated by comma

Example:
HTML, CSS, JavaScript, React, Node.js, Express.js, MongoDB"
  value={skillForm.name}
  onChange={(e) =>
    setSkillForm({ ...skillForm, name: e.target.value })
  }
/>
              <select className="input" value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button type="submit" className="btn">Add Skill</button>
            </form>

            <List>
  {domains.map((d) => {
    const domainSkills = skills.filter(
      (s) => s.domain === d.name || s.category === d.name
    );

    if (domainSkills.length === 0) return null;

    return (
      <div key={d._id} className="p-5 rounded-2xl bg-white border space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          {d.name}
        </h2>

        <div className="flex flex-wrap gap-2">
          {domainSkills.map((s) => (
            <div
              key={s._id || s.id}
              className="px-4 py-2 rounded-full bg-indigo-50 border text-slate-800 flex items-center gap-3"
            >
              <span>{s.name}</span>
              <button
            type="button"
            onClick={() => editSkill(s)}
            className="text-indigo-600 font-semibold"
          >
            Edit
          </button>

              <button
                type="button"
                onClick={() => deleteSkill(s._id || s.id)}
                className="text-red-500 font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  })}
</List>
          </Section>
        )}

        {tab === 'roadmaps' && (
          <Section title="Add / Delete Roadmap For Domain">
            <form onSubmit={addRoadmap} className="space-y-3">
             <select
  className="input"
  value={roadmapForm.domain || ''}
  onChange={(e) => {
    setRoadmapForm({
      ...roadmapForm,
      domain: e.target.value,
      role: e.target.value,
    });
  }}
>
  <option value="">Select Domain</option>

  {domains.map((d) => (
    <option key={d._id} value={d.name}>
      {d.name}
    </option>
  ))}
</select>
              <input
  type="text"
  placeholder="Roadmap title"
  value={roadmapForm.title}
  onChange={(e) =>
    setRoadmapForm({
      ...roadmapForm,
      title: e.target.value,
    })
  }
  className="input"
/>
              <textarea className="input min-h-40" placeholder={'Enter roadmap stages line by line\nHTML\nCSS\nJavaScript\nReact\nNode.js'} value={roadmapForm.stagesText} onChange={(e) => setRoadmapForm({ ...roadmapForm, stagesText: e.target.value })} />
              <button type="submit" className="btn">Add Roadmap</button>
            </form>

            <List>
  {roadmaps.map((r) => (
    <ListItem
      key={r._id}
      title={r.title}
      subtitle={`Domain: ${r.domain || r.role || '-'}`}

      onEdit={() => {
        setRoadmapForm({
          id: r._id,
          domain: r.domain || '',
          title: r.title || '',
          stagesText:
            r.stagesText ||
            (r.stages || [])
              .map((stage) => stage.name || stage.title || '')
              .join('\n'),
        });
      }}

      onDelete={() => deleteItem('roadmaps', r._id)}
    />
  ))}
</List>
          </Section>
        )}

        {tab === 'questions' && (
          <Section title="Add / Delete Interview Questions For Domain">
            <form onSubmit={addQuestion} className="space-y-3">
              <select className="input" value={questionForm.domain} onChange={(e) => setQuestionForm({ ...questionForm, domain: e.target.value })}>
                <option value="">Select Domain</option>
                {domains.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
              </select>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select className="input" value={questionForm.type} onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}>
                  <option value="technical">Technical</option>
                  <option value="hr">HR</option>
                  <option value="behavioral">Behavioral</option>
                </select>

                <select className="input" value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <textarea className="input min-h-28" placeholder="Question" value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} />
              <textarea className="input min-h-28" placeholder="Expected answer" value={questionForm.expectedAnswer} onChange={(e) => setQuestionForm({ ...questionForm, expectedAnswer: e.target.value })} />
              <button type="submit" className="btn">Add Question</button>
            </form>

           <List>
  {questions.map((q) => (
    <ListItem
      key={q._id}
      title={q.question}
      subtitle={`Domain: ${q.domain} | ${q.type} | ${q.difficulty}`}

      onEdit={() => {
        setQuestionForm({
          id: q._id,
          domain: q.domain || '',
          type: q.type || 'technical',
          difficulty: q.difficulty || 'easy',
          question: q.question || '',
          expectedAnswer: q.expectedAnswer || '',
        });
      }}

      onDelete={() => deleteItem('questions', q._id)}
    />
  ))}
</List>
          </Section>
        )}

        {tab === 'chatbot' && (
          <Section title="Chatbot Answer Generator">
            <form onSubmit={generateBotAnswer} className="space-y-3">
              <textarea className="input min-h-32" placeholder="Enter any question" value={botQuestion} onChange={(e) => setBotQuestion(e.target.value)} />
              <button type="submit" className="btn">Generate Answer</button>
            </form>

            {botAnswer && (
              <div className="mt-5 p-5 rounded-2xl bg-white border border-slate-200 whitespace-pre-wrap">
                {botAnswer}
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="glass-card">
      <p className="text-slate-500 text-sm">{title}</p>
      <h2 className="text-4xl font-black text-indigo-700">{value}</h2>
    </div>
  );
}

function Tab({ active, children, onClick }) {
  return (
    <button onClick={onClick} className={`px-5 py-3 rounded-2xl font-bold ${active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border'}`}>
      {children}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="glass-card">
      <h2 className="text-2xl font-black mb-5">{title}</h2>
      {children}
    </div>
  );
}

function List({ children }) {
  return <div className="mt-6 space-y-3">{children}</div>;
}

function ListItem({ title, subtitle, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 flex items-center justify-between gap-4">
      <div>
        <h3 className="font-black text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="flex gap-4">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="font-bold text-indigo-600"
          >
            Edit
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="font-bold text-red-500"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
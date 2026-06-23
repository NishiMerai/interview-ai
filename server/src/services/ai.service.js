import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

async function callGroq(messages, maxTokens = 900) {
  const completion = await groq.chat.completions.create({
    model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.2,
    max_tokens: maxTokens,
  });

  return completion.choices?.[0]?.message?.content || '';
}

function parseJSON(text, fallback) {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return fallback;
  }
}

export async function extractResumeSkillsWithAI(resumeText = '') {
  const response = await callGroq([
    {
      role: 'system',
      content: 'Extract resume skills. Return ONLY valid JSON.',
    },
    {
      role: 'user',
      content: `
Return only JSON:
{
  "skills": []
}

Extract all technical skills, tools, frameworks, languages, databases, platforms, and concepts.

Resume:
${resumeText}
`,
    },
  ]);

  const parsed = parseJSON(response, { skills: [] });
  return [...new Set(parsed.skills || [])];
}

export async function analyzeResumeText(resumeText = '') {
  const skills = await extractResumeSkillsWithAI(resumeText);

  return {
    resumeScore: 78,
    atsScore: 75,
    parsedData: { skills },
    keywordAnalysis: {
      matchedKeywords: skills,
      missingKeywords: [],
      keywordDensity: [],
    },
  };
}

export async function chatWithCareerCoach(messages = []) {
  return callGroq([
    {
      role: 'system',
      content:
        'You are Interview AI, a helpful placement preparation assistant. Answer clearly in easy words.',
    },
    ...messages,
  ]);
}

export async function generateAIAnswer(question) {
  return chatWithCareerCoach([{ role: 'user', content: question }]);
}

export async function generateSkillGap({
  resumeText = '',
  targetName = 'Software Developer',
  requiredSkills = [],
}) {
  const normalize = (text = '') =>
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9+#]/g, '');

  const normalizedResumeText = normalize(resumeText);

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of requiredSkills) {
    const skillName = typeof skill === 'string' ? skill : skill.name;

    const aliases =
      typeof skill === 'string'
        ? [skill]
        : [skill.name, ...(skill.aliases || [])];

    const isMatched = aliases.some((alias) =>
      normalizedResumeText.includes(normalize(alias))
    );

    if (isMatched) {
      matchedSkills.push(skillName);
    } else {
      missingSkills.push(skillName);
    }
  }

  const matchScore = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    strengthAreas: matchedSkills,
    weakAreas: missingSkills,
    radarData: [
      { category: 'Resume Match', score: matchScore },
      { category: 'Technical Skills', score: matchScore },
      { category: 'Projects', score: 70 },
      { category: 'Interview Prep', score: 60 },
      { category: 'ATS', score: 65 },
    ],
    suggestions: `Matched: ${matchedSkills.join(', ') || 'None'}. Missing: ${missingSkills.join(', ') || 'None'}.`,
    rawAnalysis: `Skill gap analyzed for ${targetName}.`,
  };
}

export async function generateRoadmap(missingSkills = [], targetRole = 'Software Developer') {
  return {
    title: `${targetRole} Roadmap`,
    stages: missingSkills.map((skill) => ({
      name: `Learn ${skill}`,
      topics: [`${skill} basics`, `${skill} projects`, `${skill} interview questions`],
      resources: [],
      projects: [`Build a project using ${skill}`],
      status: 'not_started',
    })),
  };
}

export async function createInterviewQuestions(domain = 'Software Development', type = 'technical', count = 5) {
  const answer = await callGroq([
    { role: 'system', content: 'Generate interview questions with short answers.' },
    { role: 'user', content: `Create ${count} ${type} interview questions for ${domain}.` },
  ]);

  return {
    domain,
    type,
    questionsText: answer,
    questions: answer.split('\n').filter(Boolean).slice(0, count),
  };
}

export async function gradeInterviewAnswer(question = '', userAnswer = '', expectedAnswer = '') {
  const feedback = await callGroq([
    { role: 'system', content: 'Grade interview answers simply and clearly.' },
    {
      role: 'user',
      content: `Question: ${question}\nUser Answer: ${userAnswer}\nExpected Answer: ${expectedAnswer}`,
    },
  ]);

  return { score: 7, feedback };
}
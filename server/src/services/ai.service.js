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

export async function generateAIResponse(prompt) {
  return await callGroq([
    {
      role: "system",
      content:
        "You are an AI career advisor and skill gap analyst. Always return valid JSON only.",
    },
    {
      role: "user",
      content: prompt,
    },
  ]);
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

export async function createInterviewQuestions({ domain = 'Web Development', type = 'technical', difficulty = 'Beginner', count = 5 }) {
  const response = await callGroq([
    { role: 'system', content: 'You are an expert technical recruiter. Return ONLY valid JSON.' },
    { role: 'user', content: `Generate ${count} ${difficulty} level ${type} interview questions for ${domain}. 
    
    Return JSON format:
    {
      "questions": [
        {
          "question": "The question text",
          "expectedAnswer": "Brief ideal answer keywords/concepts"
        }
      ]
    }` },
  ]);

  const parsed = parseJSON(response, { questions: [] });
  return {
    domain,
    type,
    difficulty,
    questions: (parsed.questions || []).map((q, i) => ({
      _id: `ai-gen-${Date.now()}-${i}`,
      ...q
    }))
  };
}

export async function gradeInterviewAnswer({ questions = [] }) {
  const result = await callGroq([
    { role: 'system', content: 'You are an AI Interview Evaluator. Grade the responses strictly. Return ONLY valid JSON.' },
    { role: 'user', content: `Evaluate these interview responses:
    ${JSON.stringify(questions.map(q => ({ q: q.question, a: q.userAnswer || 'No answer provided', expected: q.expectedAnswer })))}
    
    Return JSON format:
    {
      "overallScore": 0-100,
      "questions": [
        {
          "score": 0-100,
          "strengths": ["bullet 1"],
          "improvements": ["bullet 1"],
          "betterAnswer": "Enhanced ideal answer"
        }
      ]
    }` },
  ], 2000);

  const graded = parseJSON(result, { overallScore: 0, questions: [] });
  
  return {
    overallScore: graded.overallScore || 0,
    questions: questions.map((q, i) => ({
      ...q,
      ...(graded.questions?.[i] || { score: 0, strengths: [], improvements: [], betterAnswer: 'N/A' })
    }))
  };
}
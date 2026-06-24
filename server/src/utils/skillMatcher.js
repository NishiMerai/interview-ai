const SKILL_ALIASES = {
  HTML: ['html', 'html5'],
  CSS: ['css', 'css3', 'tailwind', 'bootstrap'],
  JavaScript: ['javascript', 'js', 'ecmascript'],
  React: ['react', 'reactjs', 'react.js'],
  'Node.js': ['node', 'nodejs', 'node.js'],
  'Express.js': ['express', 'expressjs', 'express.js'],
  MongoDB: ['mongodb', 'mongo db', 'mongo'],
  MySQL: ['mysql'],
  SQL: ['sql'],
  DBMS: ['dbms', 'database management system'],
  JWT: ['jwt', 'json web token'],
  'REST API': ['rest api', 'restful api', 'api'],
  Git: ['git'],
  GitHub: ['github'],
  Java: ['java'],
  Python: ['python'],
  C: ['c language'],
  'C++': ['c++', 'cpp'],
  PHP: ['php'],
  Laravel: ['laravel'],
  'Machine Learning': ['machine learning', 'ml'],
  'Data Science': ['data science'],
  Pandas: ['pandas'],
  NumPy: ['numpy'],
  TensorFlow: ['tensorflow'],
  'Scikit-learn': ['scikit learn', 'scikit-learn', 'sklearn'],
  DSA: ['dsa', 'data structures', 'algorithms'],
  OOP: ['oop', 'object oriented programming'],
  OS: ['operating system', 'os'],
  CN: ['computer network', 'computer networks', 'cn'],
};

function normalizeText(text = '') {
  return text
    .toLowerCase()
    .replace(/[(){}\[\],.;:|/\\_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractSkillsFromText(text = '', customSkills = []) {
  const normalized = normalizeText(text);
  const found = [];

  // Combine hardcoded aliases with custom skills from DB
  const allSkills = { ...SKILL_ALIASES };
  customSkills.forEach(skill => {
    if (skill.name && !allSkills[skill.name]) {
      allSkills[skill.name] = [skill.name, ...(skill.aliases || [])];
    }
  });

  for (const [skill, aliases] of Object.entries(allSkills)) {
    const isFound = aliases.some((alias) => {
      // Escape special characters for regex (like C++)
      const safeAlias = alias.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\s)${safeAlias}(\\s|$)`, 'i');
      return regex.test(normalized);
    });

    if (isFound) found.push(skill);
  }

  return [...new Set(found)];
}

export function compareSkills(resumeText = '', requiredSkills = []) {
  // Pass requiredSkills to extraction to ensure we detect them if they are in the resume
  const resumeSkills = extractSkillsFromText(resumeText, requiredSkills);

  const normalizedResumeSkills = resumeSkills.map((s) => s.toLowerCase());

  const matchedSkills = requiredSkills.filter((skill) => {
    const skillName = (skill.name || skill).toLowerCase();
    const aliases = (skill.aliases || []).map(a => a.toLowerCase());
    
    // Check if skill name or any of its aliases are in the extracted resume skills
    return normalizedResumeSkills.includes(skillName) || 
           aliases.some(alias => normalizedResumeSkills.includes(alias));
  });

  const missingSkills = requiredSkills.filter(
    (skill) => !matchedSkills.find(m => (m.name || m) === (skill.name || skill))
  );

  const matchScore = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  return {
    resumeSkills,
    matchedSkills,
    missingSkills,
    matchScore,
  };
}
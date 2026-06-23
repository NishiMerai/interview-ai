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

export function extractSkillsFromText(text = '') {
  const normalized = normalizeText(text);
  const found = [];

  for (const [skill, aliases] of Object.entries(SKILL_ALIASES)) {
    const isFound = aliases.some((alias) => {
      const safeAlias = alias.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\s)${safeAlias}(\\s|$)`, 'i');
      return regex.test(normalized);
    });

    if (isFound) found.push(skill);
  }

  return [...new Set(found)];
}

export function compareSkills(resumeText = '', requiredSkills = []) {
  const resumeSkills = extractSkillsFromText(resumeText);

  const normalizedResumeSkills = resumeSkills.map((s) => s.toLowerCase());

  const matchedSkills = requiredSkills.filter((skill) => {
    const skillLower = String(skill.name || skill).toLowerCase();
    return normalizedResumeSkills.includes(skillLower);
  });

  const missingSkills = requiredSkills.filter(
    (skill) => !matchedSkills.includes(skill)
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
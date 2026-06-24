const SKILL_ALIASES = {
  'HTML': ['html', 'html5'],
  'CSS': ['css', 'css3', 'tailwind', 'bootstrap', 'sass', 'scss'],
  'JavaScript': ['javascript', 'js', 'ecmascript'],
  'React': ['react', 'reactjs', 'react.js'],
  'Node.js': ['node', 'nodejs', 'node.js'],
  'Express.js': ['express', 'expressjs', 'express.js'],
  'MongoDB': ['mongodb', 'mongo db', 'mongo'],
  'MySQL': ['mysql'],
  'PostgreSQL': ['postgresql', 'postgres'],
  'SQL': ['sql'],
  'DBMS': ['dbms', 'database management system'],
  'JWT': ['jwt', 'json web token'],
  'REST API': ['rest api', 'restful api', 'api'],
  'Git': ['git'],
  'GitHub': ['github'],
  'Java': ['java'],
  'Python': ['python'],
  'C': ['c'],
  'C++': ['c++', 'cpp'],
  'CSharp': ['c#', 'csharp'],
  'PHP': ['php'],
  'Laravel': ['laravel'],
  'Machine Learning': ['machine learning', 'ml'],
  'Data Science': ['data science'],
  'Pandas': ['pandas'],
  'NumPy': ['numpy'],
  'TensorFlow': ['tensorflow'],
  'Pytorch': ['pytorch'],
  'Scikit-learn': ['scikit learn', 'scikit-learn', 'sklearn'],
  'DSA': ['dsa', 'data structures', 'algorithms'],
  'OOP': ['oop', 'object oriented programming'],
  'OS': ['operating system', 'os'],
  'CN': ['computer network', 'computer networks', 'cn'],
  'Architecture': ['architecture', 'system design'],
};

function normalizeText(text = '') {
  return text
    .toLowerCase()
    .replace(/[(){}\[\]\n\r,.;:|/\\_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts skills from text using a broad dictionary of aliases.
 */
export function extractSkillsFromText(text = '', customSkills = []) {
  const normalized = normalizeText(text);
  const found = [];

  // 1. Build a map of all known skills (Baseline + Admin Custom Skills)
  const allSkillsMap = { ...SKILL_ALIASES };
  
  // Merge admin skills into the extraction dictionary
  customSkills.forEach(s => {
    const name = s.name || s;
    if (name && !allSkillsMap[name]) {
      allSkillsMap[name] = [name.toLowerCase(), ...(s.aliases || []).map(a => a.toLowerCase())];
    } else if (name && s.aliases) {
      // Add any new aliases for existing skills
      allSkillsMap[name] = [...new Set([...allSkillsMap[name], ...s.aliases.map(a => a.toLowerCase())])];
    }
  });

  // 2. Scan text for each skill's aliases
  for (const [skillName, aliases] of Object.entries(allSkillsMap)) {
    const isFound = aliases.some(alias => {
      const safeAlias = alias.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Look for whole words/acronyms. Handles things like "C" or "JS" correctly.
      const regex = new RegExp(`(^|\\b)${safeAlias}(\\b|$)`, 'i');
      return regex.test(normalized);
    });

    if (isFound) found.push(skillName);
  }

  return [...new Set(found)];
}

/**
 * Compares resume text against a specific set of required (Admin) skills.
 */
export function compareSkills(resumeText = '', requiredSkills = []) {
  // 1. Extract ALL skills present in the resume to show "Extracted Skills"
  const extractedSkills = extractSkillsFromText(resumeText, requiredSkills);
  
  // 2. Strictly filter matching against the Admin skills for this domain
  const matchedSkills = requiredSkills.filter(adminSkill => {
    const name = adminSkill.name.toLowerCase();
    const aliases = (adminSkill.aliases || []).map(a => a.toLowerCase());
    
    // Check if the resume text contains the name or any alias of this SPECIFIC admin skill
    const normalized = normalizeText(resumeText);
    return [name, ...aliases].some(term => {
      const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\b)${safeTerm}(\\b|$)`, 'i');
      return regex.test(normalized);
    });
  });

  const missingSkills = requiredSkills.filter(adminSkill => 
    !matchedSkills.some(m => m.name === adminSkill.name)
  );

  const matchScore = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  return {
    extractedSkills,
    matchedSkills,
    missingSkills,
    matchScore,
  };
}
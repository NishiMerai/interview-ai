function escapeRegex(text = "") {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/c\+\+/g, "cplusplus")
    .replace(/c#/g, "csharp")
    .replace(/node\.js/g, "nodejs")
    .replace(/express\.js/g, "expressjs")
    .replace(/vue\.js/g, "vuejs")
    .replace(/next\.js/g, "nextjs")
    .replace(/react\.js/g, "reactjs")
    .replace(/github/g, "git hub")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function skillExistsInText(resumeText, skillName, aliases = []) {
  const normalizedResume = normalizeText(resumeText);

  const wordsToCheck = [
    skillName,
    ...(Array.isArray(aliases) ? aliases : []),
  ].filter(Boolean);

  return wordsToCheck.some((word) => {
    const normalizedSkill = normalizeText(word);
    if (!normalizedSkill) return false;

    const pattern = new RegExp(`(^|\\s)${escapeRegex(normalizedSkill)}(\\s|$)`, "i");
    return pattern.test(normalizedResume);
  });
}

export function compareSkillsWithAdmin(resumeText = "", adminSkills = []) {
  const requiredSkills = adminSkills.map((skill) => ({
    name: skill.name,
    aliases: skill.aliases || [],
  }));

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of requiredSkills) {
    const found = skillExistsInText(resumeText, skill.name, skill.aliases);

    if (found) {
      matchedSkills.push(skill.name);
    } else {
      missingSkills.push(skill.name);
    }
  }

  const resumeScore = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  const atsScore = Math.min(100, resumeScore + 10);

  const extractedSkills = matchedSkills;

  return {
    extractedSkills,
    requiredSkills: requiredSkills.map((s) => s.name),
    matchedSkills,
    missingSkills,
    resumeScore,
    atsScore,
  };
}
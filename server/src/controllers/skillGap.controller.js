import Resume from '../models/Resume.js';
import SkillGapReport from '../models/SkillGapReport.js';
import { generateSkillGap } from '../services/ai.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AdminSkill from '../models/AdminSkill.js';
import { compareSkills } from '../utils/skillMatcher.js';

export const analyzeSkillGap = asyncHandler(async (req, res) => {
  const { targetType = 'role', targetName = 'MERN Stack Developer', jobDescription = '' } = req.body;

  const resume = await Resume.findOne({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

 const resumeText = `
${resume?.extractedText || ''}
${resume?.originalFileName || ''}
${resume?.fileName || ''}
${(resume?.parsedData?.skills || []).join(' ')}
${(resume?.parsedData?.projects || []).join(' ')}
${(resume?.parsedData?.experience || []).join(' ')}
`.toLowerCase();

console.log("RESUME TEXT FOR MATCHING:", resumeText);

console.log("======= RESUME TEXT START =======");
console.log(resumeText);
console.log("======= RESUME TEXT END =======");


const adminSkills = await AdminSkill.find({
  $or: [
    { domain: { $regex: new RegExp(`^${targetName}$`, 'i') } },
    { category: { $regex: new RegExp(`^${targetName}$`, 'i') } },
    { relatedRoles: { $regex: new RegExp(targetName, 'i') } },
  ],
});

const requiredSkills = adminSkills.map(skill => ({
  name: skill.name,
  aliases: skill.aliases || [],
}));

console.log("REQUIRED SKILLS:", requiredSkills.map((s) => s.name));

const analysis = await generateSkillGap({
  resumeText,
  targetName,
  requiredSkills,
});

console.log("Resume Skills:", resume?.parsedData?.skills);
console.log("Required Skills:", requiredSkills);

const {
  matchedSkills,
  missingSkills,
  matchScore,
} = compareSkills(resumeText, requiredSkills);

  

  const report = await SkillGapReport.create({
    userId: req.user._id,
    resumeId: resume?._id || null,
    targetType,
    targetName,
  requiredSkills: requiredSkills.map((s) =>
  typeof s === 'string' ? s : s.name
),

matchedSkills: (analysis.matchedSkills || []).map((s) =>
  typeof s === 'string' ? s : s.name
),

missingSkills: (analysis.missingSkills || []).map((s) =>
  typeof s === 'string' ? s : s.name
),

strengthAreas: (analysis.strengthAreas || []).map((s) =>
  typeof s === 'string' ? s : s.name
),

weakAreas: (analysis.weakAreas || []).map((s) =>
  typeof s === 'string' ? s : s.name
),
    matchScore,
    radarData: [
      { category: 'Resume Match', score: matchScore },
      { category: 'Frontend', score: matchedSkills.includes('React') ? 80 : 40 },
      { category: 'Backend', score: matchedSkills.includes('Node.js') ? 80 : 40 },
      { category: 'Database', score: matchedSkills.includes('MongoDB') ? 80 : 40 },
      { category: 'Interview Prep', score: 55 },
    ],
    suggestions:
      `For ${targetName}, focus on missing skills: ${missingSkills.join(', ') || 'No major missing skills'}. Build projects and practice interview questions.`,
    rawAnalysis:
      `Skill gap analysis generated successfully for ${targetName}.`,
  });

  return res.status(201).json({ report });
});
export const listSkillGapReports = asyncHandler(async (req, res) => {
  const reports = await SkillGapReport.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ reports });
});

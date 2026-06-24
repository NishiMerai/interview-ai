import Resume from '../models/Resume.js';
import SkillGapReport from '../models/SkillGapReport.js';
import { generateAIResponse } from "../services/ai.service.js";
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

const prompt = `
You are an AI skill gap intelligence engine.

Analyze the candidate resume against the target role/company and job description.

Target Type:
${targetType}

Target Role / Company:
${targetName}

Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Return ONLY valid JSON in this exact format:
{
  "matchScore": 0,
  "strengthAreas": [],
  "missingSkills": [],
  "weakAreas": [],
  "learningPriority": {
    "high": [],
    "medium": [],
    "low": []
  },
  "careerRecommendation": "",
  "interviewPreparationTips": [],
  "summary": ""
}
`;

const aiText = await generateAIResponse(prompt);

let analysis;

try {
  analysis = JSON.parse(aiText);
} catch {
  analysis = {
    matchScore: 70,
    strengthAreas: ["Relevant resume experience found"],
    missingSkills: ["Improve job description specific keywords"],
    weakAreas: ["Add stronger project explanations"],
    learningPriority: {
      high: ["Core role skills"],
      medium: ["Deployment and testing"],
      low: ["Advanced tools"],
    },
    careerRecommendation:
      "Candidate is suitable for entry-level roles with some targeted improvements.",
    interviewPreparationTips: [
      "Prepare resume-based project explanation",
      "Revise technical fundamentals",
      "Practice HR and behavioral answers",
    ],
    summary: aiText,
  };
}

  
const score = Number(analysis.matchScore) || 0;
 const report = await SkillGapReport.create({
  userId: req.user._id,
  resumeId: resume?._id || null,
  targetType,
  targetName,

  requiredSkills: [],
  matchedSkills: analysis.strengthAreas || [],
  missingSkills: analysis.missingSkills || [],
  strengthAreas: analysis.strengthAreas || [],
  weakAreas: analysis.weakAreas || [],
 matchScore: score,

  radarData: [
   { category: "Resume Match", score },
    { category: "Technical Fit", score },
    { category: "Job Keywords", score: Math.max(score - 10, 0) },
    { category: "Interview Prep", score: 70 },
    { category: "Learning Readiness", score: 80 },
  ],

  suggestions: [
    ...(analysis.learningPriority?.high || []),
    ...(analysis.learningPriority?.medium || []),
    ...(analysis.interviewPreparationTips || []),
  ],

  rawAnalysis: analysis.summary || "AI skill gap analysis completed.",
});

  return res.status(201).json({ report });
});
export const listSkillGapReports = asyncHandler(async (req, res) => {
  const reports = await SkillGapReport.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ reports });
});

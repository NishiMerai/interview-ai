import Resume from '../models/Resume.js';
import SkillGapReport from '../models/SkillGapReport.js';
import { generateAIResponse } from "../services/ai.service.js";
import { asyncHandler } from '../utils/asyncHandler.js';

export const analyzeSkillGap = asyncHandler(async (req, res) => {
  const { targetType = 'role', targetName = 'MERN Stack Developer', jobDescription = '' } = req.body;

  const resume = await Resume.findOne({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  const resumeText = `
${resume?.extractedText || ''}
${(resume?.parsedData?.skills || []).join(', ')}
`.toLowerCase();

  const prompt = `
You are an AI skill gap intelligence engine.

Analyze the candidate resume against the target role/company and job description.

Target Type: ${targetType}
Target Role / Company: ${targetName}
Job Description: ${jobDescription}

Candidate Resume:
${resumeText}

Return ONLY valid JSON in this exact format:
{
  "matchScore": 0,
  "strengths": ["list of areas where vendor exceeds or matches requirements"],
  "weaknesses": ["areas for improvement"],
  "missingSkills": ["specific technical skills found in JD but not in resume"],
  "learningPriority": {
    "high": ["top priority skills to learn"],
    "medium": ["secondary skills"],
    "low": ["nice to have skills"]
  },
  "interviewPreparationTips": ["specific tips based on gaps"],
  "summary": "overall career recommendation and summary",
  "radarData": [
    {"category": "Resume Match", "score": 0},
    {"category": "Technical Fit", "score": 0},
    {"category": "Job Keywords", "score": 0},
    {"category": "Interview Prep", "score": 0},
    {"category": "Learning Readiness", "score": 0}
  ]
}
`;

  const aiText = await generateAIResponse(prompt);
  
  let analysis;
  try {
    // Robustly extract JSON from AI response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    analysis = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
  } catch (error) {
    console.error("AI Skill Gap Parsing Error:", error, aiText);
    throw new Error("Failed to parse AI skill gap analysis.");
  }

  const report = await SkillGapReport.create({
    userId: req.user._id,
    resumeId: resume?._id || null,
    targetType,
    targetName,
    requiredSkills: analysis.missingSkills || [],
    matchedSkills: analysis.strengths || [],
    missingSkills: analysis.missingSkills || [],
    strengthAreas: analysis.strengths || [],
    weakAreas: analysis.weaknesses || [],
    matchScore: Number(analysis.matchScore) || 0,
    radarData: analysis.radarData || [],
    suggestions: [
      ...(analysis.learningPriority?.high || []),
      ...(analysis.interviewPreparationTips || []),
    ],
    rawAnalysis: analysis.summary || "Skill gap analysis completed.",
  });

  return res.status(201).json({ report });
});

export const listSkillGapReports = asyncHandler(async (req, res) => {
  const reports = await SkillGapReport.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ reports });
});

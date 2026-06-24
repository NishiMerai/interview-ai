import path from 'path';
import Resume from '../models/Resume.js';
import { analyzeResumeText } from '../services/ai.service.js';
import { extractTextFromResume } from '../services/resumeParser.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { extractSkillsFromText } from '../utils/skillMatcher.js';
import AdminSkill from "../models/AdminSkill.js";

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Resume file is required');
  }

  const extractedText = await extractTextFromResume(req.file);

const extractedSkills = extractSkillsFromText(extractedText);

const selectedDomain = req.body.domain || req.body.targetDomain || "Web Development";

const adminSkills = await AdminSkill.find({
  domain: selectedDomain,
});

const requiredSkills = adminSkills.map((skill) => skill.name);

const matchedSkills = requiredSkills.filter((skill) =>
  extractedSkills.some(
    (resumeSkill) =>
      resumeSkill.toLowerCase() === skill.toLowerCase()
  )
);

const missingSkills = requiredSkills.filter(
  (skill) => !matchedSkills.includes(skill)
);

const resumeScore = requiredSkills.length
  ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
  : 0;

const atsScore = Math.min(resumeScore + 10, 100);

const analysis = {
  resumeScore,
  atsScore,
  parsedData: {
    skills: extractedSkills,
  },
  keywordAnalysis: {
    matchedKeywords: matchedSkills,
    missingKeywords: missingSkills,
    keywordDensity: [],
  },
};

// If AI doesn't return parsedData, create it
if (!analysis.parsedData) {
  analysis.parsedData = {};
}

// If AI doesn't return skills, extract them manually
if (
  !analysis.parsedData.skills ||
  analysis.parsedData.skills.length === 0
) {
  analysis.parsedData.skills = extractSkillsFromText(extractedText);
}

console.log("Detected Skills:", analysis.parsedData.skills);

console.log("Detected Skills:", analysis.parsedData.skills);
  const versionNumber = await Resume.countDocuments({ userId: req.user._id }) + 1;
  const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();

const resume = await Resume.create({
 
  userId: req.user._id,
  fileUrl: `/uploads/${req.file.filename}`,
  originalFileName: req.file.originalname,
  fileType: ext,
  extractedText,
  versionNumber,
  parsedData: analysis.parsedData,
  keywordAnalysis: analysis.keywordAnalysis,
  resumeScore: analysis.resumeScore,
  atsScore: analysis.atsScore,

});

 res.status(201).json({
  resume,
matchedSkills,
missingSkills,
requiredSkills,
});
});

export const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ resumes });
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }
  res.json({ resume });
});

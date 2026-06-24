import path from 'path';
import Resume from '../models/Resume.js';
import { extractTextFromResume } from '../services/resumeParser.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { extractSkillsFromText, compareSkills } from '../utils/skillMatcher.js';
import AdminSkill from "../models/AdminSkill.js";

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Resume file is required');
  }

  const extractedText = await extractTextFromResume(req.file);
  const selectedDomain = req.body.domain || "Web Development";

  // Fix: Query by the newly added 'domain' field (case-insensitive)
  const adminSkills = await AdminSkill.find({
    domain: { $regex: new RegExp(`^${selectedDomain}$`, "i") }
  });

  const requiredSkills = adminSkills.map(skill => ({
    name: skill.name,
    aliases: skill.aliases || [],
  }));

  // Match resume text against the specific required skills for this domain
  const {
    matchedSkills,
    missingSkills,
    resumeSkills,
    matchScore: calculatedMatchScore
  } = compareSkills(extractedText, requiredSkills);

  // Requirement: Resume Score = (Matching Skills Count / Total Admin Skills Count) × 100
  const resumeScore = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  const atsScore = Math.min(resumeScore + 10, 100);

  const analysis = {
    resumeScore,
    atsScore,
    parsedData: {
      skills: resumeSkills,
    },
    keywordAnalysis: {
      matchedKeywords: matchedSkills.map(s => s.name || s),
      missingKeywords: missingSkills.map(s => s.name || s),
      keywordDensity: [],
    },
  };

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
    matchedSkills: matchedSkills.map(s => s.name || s),
    missingSkills: missingSkills.map(s => s.name || s),
    requiredSkills: requiredSkills.map(s => s.name || s),
  });

  res.status(201).json({
    resume,
    matchedSkills: analysis.keywordAnalysis.matchedKeywords,
    missingSkills: analysis.keywordAnalysis.missingKeywords,
    requiredSkills: resume.requiredSkills,
    extractedSkills: resumeSkills // Adding this for the UI
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

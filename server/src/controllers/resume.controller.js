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

  console.log("--- DEBUG START ---");
  console.log("BODY:", req.body);
  console.log("DOMAIN:", selectedDomain);

  // 1. Fetch ONLY admin-added skills for the selected domain
  const adminSkills = await AdminSkill.find({
    domain: { $regex: new RegExp(`^${selectedDomain}$`, "i") }
  });

  console.log("ADMIN SKILLS COUNT:", adminSkills.length);
  console.log("ADMIN SKILLS:", adminSkills.map(s => ({ name: s.name, domain: s.domain, aliases: s.aliases })));

  const requiredSkills = adminSkills.map(skill => ({
    name: skill.name,
    aliases: skill.aliases || [],
  }));

  // 2. Perform strictly filtered comparison
  const {
    matchedSkills,
    missingSkills,
    extractedSkills,
    matchScore: calculatedMatchScore
  } = compareSkills(extractedText, requiredSkills);

  console.log("EXTRACTED TEXT (FIRST 500 CHARS):", extractedText.substring(0, 500));
  console.log("EXTRACTED SKILLS:", extractedSkills);
  console.log("MATCHED:", matchedSkills.map(s => s.name));
  console.log("MISSING:", missingSkills.map(s => s.name));
  console.log("--- DEBUG END ---");

  // Requirement: Resume Score calculation
  const resumeScore = calculatedMatchScore;
  const atsScore = Math.min(resumeScore + 5, 100);

  const analysis = {
    resumeScore,
    atsScore,
    parsedData: {
      skills: extractedSkills,
    },
    keywordAnalysis: {
      matchedKeywords: matchedSkills.map(s => s.name),
      missingKeywords: missingSkills.map(s => s.name),
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
    matchedSkills: matchedSkills.map(s => s.name),
    missingSkills: missingSkills.map(s => s.name),
    requiredSkills: requiredSkills.map(s => s.name),
  });

  res.status(201).json({
    resume,
    matchedSkills: analysis.keywordAnalysis.matchedKeywords,
    missingSkills: analysis.keywordAnalysis.missingKeywords,
    requiredSkills: resume.requiredSkills,
    extractedSkills: extractedSkills
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

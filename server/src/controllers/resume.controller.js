import path from "path";
import Resume from "../models/Resume.js";
import AdminSkill from "../models/AdminSkill.js";
import { extractTextFromResume } from "../services/resumeParser.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { compareSkillsWithAdmin } from "../utils/skillMatcher.js";

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Resume file is required");
  }

  const extractedText = await extractTextFromResume(req.file);
  const selectedDomain = req.body.domain || "Web Development";

  const adminSkills = await AdminSkill.find({
    domain: { $regex: new RegExp(`^${selectedDomain}$`, "i") },
  });

  const skillAnalysis = compareSkillsWithAdmin(extractedText, adminSkills);

  const versionNumber =
    (await Resume.countDocuments({ userId: req.user._id })) + 1;

  const ext = path
    .extname(req.file.originalname)
    .replace(".", "")
    .toLowerCase();

  const resume = await Resume.create({
    userId: req.user._id,
    fileUrl: `/uploads/${req.file.filename}`,
    originalFileName: req.file.originalname,
    fileType: ext,
    extractedText,
    versionNumber,

    parsedData: {
      skills: skillAnalysis.extractedSkills,
    },

    keywordAnalysis: {
      matchedKeywords: skillAnalysis.matchedSkills,
      missingKeywords: skillAnalysis.missingSkills,
      keywordDensity: [],
    },

    resumeScore: skillAnalysis.resumeScore,
    atsScore: skillAnalysis.atsScore,

    matchedSkills: skillAnalysis.matchedSkills,
    missingSkills: skillAnalysis.missingSkills,
    requiredSkills: skillAnalysis.requiredSkills,
  });

  console.log("===== RESUME SKILL ANALYSIS =====");
  console.log("DOMAIN:", selectedDomain);
  console.log("ADMIN SKILLS:", skillAnalysis.requiredSkills);
  console.log("EXTRACTED SKILLS:", skillAnalysis.extractedSkills);
  console.log("MATCHED:", skillAnalysis.matchedSkills);
  console.log("MISSING:", skillAnalysis.missingSkills);
  console.log("SCORE:", skillAnalysis.resumeScore);
  console.log("================================");

  res.status(201).json({
    resume,
    extractedSkills: skillAnalysis.extractedSkills,
    matchedSkills: skillAnalysis.matchedSkills,
    missingSkills: skillAnalysis.missingSkills,
    requiredSkills: skillAnalysis.requiredSkills,
  });
});

export const debugSkills = asyncHandler(async (req, res) => {
  const domain = req.query.domain || "Web Development";

  const adminSkills = await AdminSkill.find({
    domain: { $regex: new RegExp(`^${domain}$`, "i") },
  });

  const latestResume = await Resume.findOne({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  const comparison = latestResume
    ? compareSkillsWithAdmin(latestResume.extractedText || "", adminSkills)
    : {
      extractedSkills: [],
      requiredSkills: adminSkills.map((s) => s.name),
      matchedSkills: [],
      missingSkills: adminSkills.map((s) => s.name),
      resumeScore: 0,
      atsScore: 0,
    };

  res.json({
    domain,
    adminSkillsCount: adminSkills.length,
    adminSkills: adminSkills.map((s) => ({
      name: s.name,
      domain: s.domain,
      category: s.category,
      aliases: s.aliases,
    })),
    latestResumeTextPreview: latestResume?.extractedText?.substring(0, 500) || "",
    extractedSkills: comparison.extractedSkills,
    matchedSkills: comparison.matchedSkills,
    missingSkills: comparison.missingSkills,
    resumeScore: comparison.resumeScore,
    atsScore: comparison.atsScore,
  });
});

export const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({
    userId: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ resumes });
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!resume) {
    res.status(404);
    throw new Error("Resume not found");
  }

  res.json({ resume });
});

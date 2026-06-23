import Roadmap from '../models/Roadmap.js';
import SkillGapReport from '../models/SkillGapReport.js';
import { generateRoadmap } from '../services/ai.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createRoadmap = asyncHandler(async (req, res) => {
  const report = await SkillGapReport.findOne({ _id: req.body.skillGapReportId, userId: req.user._id });

  if (!report) {
    res.status(404);
    throw new Error('Skill gap report not found');
  }

  const roadmapData = await generateRoadmap(report);
  const roadmap = await Roadmap.create({
    userId: req.user._id,
    skillGapReportId: report._id,
    ...roadmapData
  });

  res.status(201).json({ roadmap });
});

export const listRoadmaps = asyncHandler(async (req, res) => {
  const roadmaps = await Roadmap.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10);
  res.json({ roadmaps });
});

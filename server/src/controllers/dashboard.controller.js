import Resume from '../models/Resume.js';
import SkillGapReport from '../models/SkillGapReport.js';
import InterviewSession from '../models/InterviewSession.js';
import Roadmap from '../models/Roadmap.js';
import { isDatabaseReady } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  if (!isDatabaseReady() && process.env.NODE_ENV !== 'production') {
    return res.json({
      metrics: {
        resumeScore: 78,
        atsScore: 82,
        placementReadiness: 74,
        interviewScore: 68,
        skillMatchScore: 72,
        streak: 7,
        roadmaps: 1
      },
      latestResume: null,
      latestSkillGap: {
        radarData: [
          { category: 'Frontend', score: 80 },
          { category: 'Backend', score: 65 },
          { category: 'DBMS', score: 70 },
          { category: 'DSA', score: 45 },
          { category: 'Interview', score: 68 }
        ]
      },
      latestInterview: null,
      activities: [
        { title: 'Demo mode active because MongoDB is not connected', time: new Date() }
      ]
    });
  }

  const [resume, gap, interview, roadmapCount] = await Promise.all([
    Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 }),
    SkillGapReport.findOne({ userId: req.user._id }).sort({ createdAt: -1 }),
    InterviewSession.findOne({ userId: req.user._id }).sort({ createdAt: -1 }),
    Roadmap.countDocuments({ userId: req.user._id })
  ]);

  res.json({
    metrics: {
      resumeScore: resume?.resumeScore || 0,
      atsScore: resume?.atsScore || 0,
      placementReadiness: Math.round(((resume?.atsScore || 0) + (gap?.matchScore || 0) + (interview?.overallScore || 0)) / 3) || 0,
      interviewScore: interview?.overallScore || 0,
      skillMatchScore: gap?.matchScore || 0,
      streak: 7,
      roadmaps: roadmapCount
    },
    latestResume: resume,
    latestSkillGap: gap,
    latestInterview: interview,
    activities: [
      { title: 'Resume analyzed', time: resume?.createdAt },
      { title: 'Skill gap generated', time: gap?.createdAt },
      { title: 'Mock interview completed', time: interview?.createdAt }
    ].filter((item) => item.time)
  });
});

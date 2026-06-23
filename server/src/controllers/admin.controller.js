import User from '../models/User.js';
import AdminSkill from '../models/AdminSkill.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import Resume from '../models/Resume.js';
import SkillGapReport from '../models/SkillGapReport.js';
import { isDatabaseReady } from '../config/db.js';
import { listMemoryUsers } from '../services/devStore.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminStats = asyncHandler(async (_req, res) => {
  if (!isDatabaseReady() && process.env.NODE_ENV !== 'production') {
    const users = listMemoryUsers();
    return res.json({
      users: users.length,
      resumes: 0,
      reports: 0,
      suspendedUsers: users.filter((user) => user.isSuspended).length,
      readinessDistribution: [
        { range: '0-40', count: 2 },
        { range: '41-70', count: 5 },
        { range: '71-100', count: 3 }
      ],
      mode: 'in-memory-demo'
    });
  }

  const [users, resumes, reports, suspendedUsers] = await Promise.all([
    User.countDocuments(),
    Resume.countDocuments(),
    SkillGapReport.countDocuments(),
    User.countDocuments({ isSuspended: true })
  ]);

  res.json({
    users,
    resumes,
    reports,
    suspendedUsers,
    readinessDistribution: [
      { range: '0-40', count: 12 },
      { range: '41-70', count: 34 },
      { range: '71-100', count: 21 }
    ]
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  if (!isDatabaseReady() && process.env.NODE_ENV !== 'production') {
    const q = (req.query.q || '').toLowerCase();
    const users = listMemoryUsers().filter((user) =>
      !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
    );
    return res.json({ users, mode: 'in-memory-demo' });
  }

  const q = req.query.q || '';
  const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {};
  const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).limit(100);
  res.json({ users });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isSuspended: Boolean(req.body.isSuspended) },
    { new: true }
  ).select('-passwordHash');
  res.json({ user });
});

export const createSkill = asyncHandler(async (req, res) => {
  const skill = await AdminSkill.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ skill });
});

export const listSkills = asyncHandler(async (_req, res) => {
  const skills = await AdminSkill.find().sort({ category: 1, name: 1 }).limit(200);
  res.json({ skills });
});

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await InterviewQuestion.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ question });
});

export const listQuestions = asyncHandler(async (_req, res) => {
  const questions = await InterviewQuestion.find().sort({ createdAt: -1 }).limit(200);
  res.json({ questions });
});

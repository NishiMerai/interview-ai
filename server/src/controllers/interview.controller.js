import InterviewSession from '../models/InterviewSession.js';
import { createInterviewQuestions, gradeInterviewAnswer } from '../services/ai.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const startInterview = asyncHandler(async (req, res) => {
  const { type = 'technical', mode = 'text', domain = 'Web Development', targetRole = 'MERN Developer' } = req.body;
  const generated = await createInterviewQuestions({ type, domain, targetRole });

  const session = await InterviewSession.create({
    userId: req.user._id,
    type,
    mode,
    domain,
    targetRole,
    questions: generated.questions
  });

  res.status(201).json({ session });
});

export const submitInterview = asyncHandler(async (req, res) => {
  const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });

  if (!session) {
    res.status(404);
    throw new Error('Interview session not found');
  }

  const graded = await gradeInterviewAnswer({ questions: req.body.questions || [] });
  Object.assign(session, graded);
  await session.save();

  res.json({ session });
});

export const listInterviews = asyncHandler(async (req, res) => {
  const sessions = await InterviewSession.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ sessions });
});

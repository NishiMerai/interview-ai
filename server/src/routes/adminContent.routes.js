import express from 'express';
import Domain from '../models/Domain.js';
import AdminSkill from '../models/AdminSkill.js';
import Roadmap from '../models/Roadmap.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import Resume from '../models/Resume.js';
import InterviewRequest from '../models/InterviewRequest.js';
import { generateAIAnswer } from '../services/ai.service.js';


const router = express.Router();


// DASHBOARD
router.get('/stats', async (req, res) => {
  try {
    const totalResumes = await Resume.countDocuments();
    const totalDomains = await Domain.countDocuments();
    const totalSkills = await AdminSkill.countDocuments();
    const totalRoadmaps = await Roadmap.countDocuments();
    const totalQuestions = await InterviewQuestion.countDocuments();
    const totalInterviews = await InterviewRequest.countDocuments();

    res.json({
      totalResumes,
      totalDomains,
      totalSkills,
      totalRoadmaps,
      totalQuestions,
      totalInterviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DOMAINS
router.post('/domains', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Domain name is required' });
    }

    const domain = await Domain.create({ name, description });
    res.status(201).json({ message: 'Domain added', domain });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/domains', async (req, res) => {
  const domains = await Domain.find().sort({ createdAt: -1 });
  res.json(domains);
});

router.delete('/domains/:id', async (req, res) => {
  const domain = await Domain.findById(req.params.id);

  if (domain) {
    await AdminSkill.deleteMany({ domain: domain.name });
    await InterviewQuestion.deleteMany({ domain: domain.name });
    await Roadmap.deleteMany({ title: { $regex: domain.name, $options: 'i' } });
  }

  await Domain.findByIdAndDelete(req.params.id);
  res.json({ message: 'Domain deleted' });
});

// SKILLS
router.post('/skills', async (req, res) => {
  try {
    const { domain, name, level, aliases } = req.body;

    if (!domain || !name) {
      return res.status(400).json({ message: 'Domain and skill are required' });
    }

    const skill = await AdminSkill.create({
      domain,
      role: domain,
      name,
      category: domain,
      level: level || 'beginner',
      aliases: aliases || [],
    });

    res.status(201).json({ message: 'Skill added', skill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/skills', async (req, res) => {
  const skills = await AdminSkill.find().sort({ createdAt: -1 });
  res.json(skills);
});

router.delete('/skills/:id', async (req, res) => {
  await AdminSkill.findByIdAndDelete(req.params.id);
  res.json({ message: 'Skill deleted' });
});
router.put('/skills/:id', async (req, res) => {
  try {
    const skill = await AdminSkill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: 'Skill updated successfully', skill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ROADMAPS
router.post('/roadmaps', async (req, res) => {
  try {
    const { domain, role, title, stagesText } = req.body;

    if (!domain && !role) {
      return res.status(400).json({ message: 'Domain is required' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const selectedDomain = domain || role;

    const stages = stagesText
      ? stagesText.split('\n').filter(Boolean).map((stage) => ({
          name: stage,
          topics: [stage],
          projects: [`Build project using ${stage}`],
          status: 'not_started',
        }))
      : [];

    const roadmap = await Roadmap.create({
  userId: req.user?._id || null,
  domain: selectedDomain,
  role: selectedDomain,
  title,
  stages,
  
});

    res.status(201).json({ message: 'Roadmap added', roadmap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/roadmaps', async (req, res) => {
  const roadmaps = await Roadmap.find().sort({ createdAt: -1 });
  res.json(roadmaps);
});

router.delete('/roadmaps/:id', async (req, res) => {
  await Roadmap.findByIdAndDelete(req.params.id);
  res.json({ message: 'Roadmap deleted' });
});
router.put('/roadmaps/:id', async (req, res) => {
  try {
    const { domain, role } = req.body;
    const selectedDomain = domain || role;

    const roadmap = await Roadmap.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        domain: selectedDomain,
        role: selectedDomain,
      },
      { new: true }
    );

    res.json({ message: 'Roadmap updated', roadmap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// QUESTIONS
router.post('/questions', async (req, res) => {
  try {
    const { domain, type, difficulty, question, expectedAnswer } = req.body;

    if (!domain || !question) {
      return res.status(400).json({ message: 'Domain and question are required' });
    }

    const savedQuestion = await InterviewQuestion.create({
      domain,
      type: type || 'technical',
      difficulty: difficulty || 'easy',
      question,
      expectedAnswer: expectedAnswer || '',
      answer: expectedAnswer || '',
      keywords: [],
    });

    res.status(201).json({ message: 'Question added', question: savedQuestion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/questions', async (req, res) => {
  const questions = await InterviewQuestion.find().sort({ createdAt: -1 });
  res.json(questions);
});

router.delete('/questions/:id', async (req, res) => {
  await InterviewQuestion.findByIdAndDelete(req.params.id);
  res.json({ message: 'Question deleted' });
});
router.put('/questions/:id', async (req, res) => {
  try {
    const question = await InterviewQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: 'Question updated successfully', question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CHATBOT ANSWER
router.post('/chatbot-answer', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const answer = await generateAIAnswer(question);

    res.json({ answer });
  } catch (error) {
    console.error('Groq chatbot error:', error);
    res.status(500).json({
      message: error.message || 'AI answer generation failed',
    });
  }
});

export default router;
import express from 'express';
import Roadmap from '../models/Roadmap.js';
import AdminSkill from '../models/AdminSkill.js';
import Resume from '../models/Resume.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();



router.get('/domain/:domain', async (req, res) => {
  try {
    const domain = decodeURIComponent(req.params.domain);

    const roadmap = await Roadmap.findOne({
      domain: { $regex: new RegExp(`^${domain}$`, 'i') },
    }).sort({ createdAt: -1 });

    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap found for this domain' });
    }

    res.json({ roadmap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/generate', protect, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const resume = await Resume.findOne({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    if (!resume) {
      return res.status(400).json({
        message: 'Please upload resume first before generating roadmap.',
      });
    }

    const skills = await AdminSkill.find({ role });

    if (!skills.length) {
      return res.status(404).json({
        message: 'No skills found for this role. Admin must add role-wise skills first.',
      });
    }

    const resumeText = `${resume.extractedText || ''}`.toLowerCase();

    const missingSkills = skills
      .map((skill) => skill.name)
      .filter((skillName) => !resumeText.includes(skillName.toLowerCase()));

    const finalSkills = missingSkills.length
      ? missingSkills
      : skills.map((skill) => skill.name).slice(0, 5);

    const stages = finalSkills.map((skillName) => ({
      name: `Learn ${skillName}`,
      topics: [
        `${skillName} basics`,
        `${skillName} intermediate concepts`,
        `${skillName} interview questions`,
        `${skillName} mini project`,
      ],
      resources: [
        {
          title: `${skillName} YouTube Tutorial`,
          type: 'youtube',
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
            skillName + ' tutorial'
          )}`,
        },
        {
          title: `${skillName} Documentation`,
          type: 'documentation',
          url: `https://www.google.com/search?q=${encodeURIComponent(
            skillName + ' documentation'
          )}`,
        },
      ],
      projects: [`Build a mini project using ${skillName}`],
      status: 'not_started',
    }));

    const roadmap = await Roadmap.create({
      userId: req.user._id,
      title: `${role} Placement Roadmap`,
      stages,
      progressPercentage: 0,
      estimatedCompletionDays: stages.length * 5,
    });

    res.status(201).json({
      message: 'Roadmap generated successfully',
      roadmap,
    });
  } catch (error) {
    console.error('Roadmap generate error:', error);
    res.status(500).json({ message: 'Roadmap generation failed' });
  }
});

router.get('/my-roadmaps', protect, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(roadmaps);
  } catch (error) {
    console.error('Fetch roadmaps error:', error);
    res.status(500).json({ message: 'Failed to fetch roadmaps' });
  }
});

export default router;
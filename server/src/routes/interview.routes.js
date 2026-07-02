import { Router } from 'express';
import { listInterviews, startInterview, submitInterview } from '../controllers/interview.controller.js';
import { requestInterview, getMyInterviews } from '../controllers/interviewRequest.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import InterviewQuestion from '../models/InterviewQuestion.js';

const router = Router();

// Public route — fetch questions by domain (no auth required)
router.get('/questions/domain/:domain', async (req, res) => {
  try {
    const domain = decodeURIComponent(req.params.domain);

    const questions = await InterviewQuestion.find({
      domain: { $regex: new RegExp(`^${domain}$`, 'i') },
    }).sort({ createdAt: -1 });

    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected routes
router.use(protect);
router.post('/request', requestInterview);
router.get('/my', getMyInterviews);
router.post('/start', startInterview);
router.put('/:id/submit', submitInterview);
router.get('/', listInterviews);

export default router;

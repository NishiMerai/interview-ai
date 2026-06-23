import { Router } from 'express';
import { listInterviews, startInterview, submitInterview } from '../controllers/interview.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();



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
router.use(protect);
router.post('/start', startInterview);
router.put('/:id/submit', submitInterview);
router.get('/', listInterviews);

export default router;

import { Router } from 'express';
import { analyzeSkillGap, listSkillGapReports } from '../controllers/skillGap.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.post('/analyze', analyzeSkillGap);
router.get('/reports', listSkillGapReports);

export default router;

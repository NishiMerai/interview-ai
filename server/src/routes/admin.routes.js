import { Router } from 'express';
import {
  adminStats,
  createQuestion,
  createSkill,
  listQuestions,
  listSkills,
  listUsers,
  updateUserStatus
} from '../controllers/admin.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, authorize('admin', 'super_admin'));
router.get('/stats', adminStats);
router.get('/users', listUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/skills', listSkills);
router.post('/skills', createSkill);
router.get('/questions', listQuestions);
router.post('/questions', createQuestion);

export default router;

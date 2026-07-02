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
import {
  getAdminInterviewRequests,
  getAdminInterviewRequestById,
  acceptInterviewRequest,
  rejectInterviewRequest,
  deleteInterviewRequest
} from '../controllers/interviewRequest.controller.js';
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

router.get('/interviews', getAdminInterviewRequests);
router.get('/interviews/:id', getAdminInterviewRequestById);
router.put('/interviews/accept/:id', acceptInterviewRequest);
router.put('/interviews/reject/:id', rejectInterviewRequest);
router.delete('/interviews/:id', deleteInterviewRequest);

export default router;

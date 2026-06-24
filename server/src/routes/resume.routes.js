import { Router } from 'express';
import { debugSkills, getResume, listResumes, uploadResume as uploadResumeController } from '../controllers/resume.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadResume } from '../middleware/upload.middleware.js';

const router = Router();

router.use(protect);
router.post('/upload', uploadResume.single('resume'), uploadResumeController);
router.get('/debug-skills', debugSkills);
router.get('/', listResumes);
router.get('/:id', getResume);

export default router;

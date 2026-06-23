import { Router } from 'express';
import { listChats, sendMessage } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', listChats);
router.post('/message', sendMessage);

export default router;

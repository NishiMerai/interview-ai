import { Router } from 'express';
import { listChats, sendMessage, chatHandler } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', listChats);
router.post('/message', sendMessage);
router.post('/', chatHandler);

export default router;

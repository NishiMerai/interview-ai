import { Router } from 'express';
import { bootstrapAdmin, login, logout, me, refreshToken, register } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/bootstrap-admin', bootstrapAdmin);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;

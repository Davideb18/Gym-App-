import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { syncProfile } from '../controllers/userController.js';

const router = Router();

router.post('/sync', authenticateToken, syncProfile);

export default router;

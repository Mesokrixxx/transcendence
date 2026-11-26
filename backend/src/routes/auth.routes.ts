import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', optionalAuth, authController.getCurrentUser);
router.post('/oauth', authController.oauth);

export default router;

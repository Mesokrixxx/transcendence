import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import * as controller from '../controllers/gamification.controller.js';

const router = Router();
router.get('/me', requireAuth, controller.getProgress);
router.patch(
	'/badges/:code/featured',
	requireAuth,
	controller.setBadgeFeatured,
);
export default router;

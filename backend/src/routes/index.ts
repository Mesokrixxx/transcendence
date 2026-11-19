import { Router } from 'express';
import gamesRoutes from './games.routes.js';
import usersRoutes from './users.routes.js';
import chatsRoutes from './chats.routes.js';
import authRoutes from './auth.routes.js';
import friendsRoutes from './friends.routes.js';
import gamificationRoutes from './gamification.routes.js';

const router = Router();

router.use('/games', gamesRoutes);
router.use('/users', usersRoutes);
router.use('/chats', chatsRoutes);
router.use('/auth', authRoutes);
router.use('/friends', friendsRoutes);
router.use('/gamification', gamificationRoutes);

export default router;

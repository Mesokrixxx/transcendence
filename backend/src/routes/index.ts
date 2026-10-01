import { Router } from 'express';
import gamesRoutes from './games.routes.js';
import usersRoutes from './users.routes.js';

const router = Router();

router.use('/games', gamesRoutes);
router.use('/users', usersRoutes);

export default router;

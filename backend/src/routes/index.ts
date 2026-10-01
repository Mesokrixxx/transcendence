import { Router } from 'express';
import gamesRoutes from './games.routes.ts';
import usersRoutes from './users.routes.ts';

const router = Router();

router.use('/games', gamesRoutes);
router.use('/users', usersRoutes);

export default router;

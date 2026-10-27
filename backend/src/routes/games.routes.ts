import { Router } from 'express';
import * as gamesController from '../controllers/games.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:id', requireAuth, gamesController.getGame);
router.post('/', requireAuth, gamesController.createGame); // see CreateGameBody
router.post('/:id/moves', requireAuth, gamesController.playMove);
router.post('/:id/resign', requireAuth, gamesController.resign);
router.post('/:id/draw', requireAuth, gamesController.draw);

export default router;

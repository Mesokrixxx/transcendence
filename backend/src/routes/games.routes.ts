import { Router } from 'express';
import * as gamesController from '../controllers/games.controller.js';

const router = Router();

router.get('/:id', gamesController.getGame);
router.post('/', gamesController.createGame); // see CreateGameBody

export default router;

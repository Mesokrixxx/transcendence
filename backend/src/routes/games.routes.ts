import { Router } from 'express';
import * as gamesController from '../controllers/games.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/active/:friendId', requireAuth, gamesController.getActiveGameWithFriend);
router.get('/invitations', requireAuth, gamesController.getInvitations);
router.get('/draw/offers', requireAuth, gamesController.getDrawOffers);
router.post('/invitations/:friendId', requireAuth, gamesController.createInvitation);
router.post('/invitations/:id/accept', requireAuth, gamesController.acceptInvitation);
router.post('/invitations/:id/decline', requireAuth, gamesController.declineInvitation);
router.get('/:id', requireAuth, gamesController.getGame);
router.post('/', requireAuth, gamesController.createGame); // see CreateGameBody
router.post('/:id/moves', requireAuth, gamesController.playMove);
router.post('/:id/resign', requireAuth, gamesController.resign);
router.post('/:id/draw', requireAuth, gamesController.draw);
router.post('/:id/draw/request', requireAuth, gamesController.requestDraw);
router.post('/:id/draw/accept', requireAuth, gamesController.acceptDraw);
router.post('/:id/draw/decline', requireAuth, gamesController.declineDraw);

export default router;

import { Router } from 'express';
import * as friendsController from '../controllers/friends.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, friendsController.getList);
router.get('/requests', requireAuth, friendsController.getRequests);
router.post('/requests', requireAuth, friendsController.addFriendByUsername);
router.get('/blocked', requireAuth, friendsController.getBlocked);
router.post('/:id/accept', requireAuth, friendsController.acceptFriend);
router.post('/:id/block', requireAuth, friendsController.block);
router.delete('/:id/block', requireAuth, friendsController.unblock);
router.post('/:id', requireAuth, friendsController.addFriend);
router.delete('/:id', requireAuth, friendsController.delFriend);

export default router;

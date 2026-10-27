import { Router } from 'express';
import * as friendsController from '../controllers/friends.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, friendsController.getList);
router.post('/:id', requireAuth, friendsController.addFriend);
router.delete('/:id', requireAuth, friendsController.delFriend);

export default router;

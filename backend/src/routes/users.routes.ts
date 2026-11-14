import { Router } from 'express';
import * as userController from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { receiveAvatar,removeAvatar, uploadAvatar } from '../controllers/avatar.controller.js';

const router = Router();

router.get('/', requireAuth, userController.getUsersByRanking);
router.get('/:id', requireAuth, userController.getUser);
// router.get('/:id/games', requireAuth, userController);
router.patch('/me', requireAuth, userController.updateUser);
router.post('/me/avatar', requireAuth, receiveAvatar, uploadAvatar);
router.delete('/me/avatar', requireAuth, removeAvatar);
router.post('/', userController.createUser); // see CreateUserBody

export default router;

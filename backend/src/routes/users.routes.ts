import { Router } from 'express';
import * as userController from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:id', requireAuth, userController.getUser);
router.patch('/me', requireAuth, userController.updateUser);
router.post('/', userController.createUser); // see CreateUserBody

export default router;

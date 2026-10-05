import { Router } from 'express';
import * as userController from '../controllers/users.controller.js';

const router = Router();

router.get('/:id', userController.getUser);
router.post('/', userController.createUser); // see CreateUserBody
router.post('/auth', userController.authUser);

export default router;

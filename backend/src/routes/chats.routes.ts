import { Router } from 'express'
import * as chatController from '../controllers/chats.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:id', requireAuth, chatController.getChat);
router.post('/', requireAuth, chatController.createChat);

export default router;

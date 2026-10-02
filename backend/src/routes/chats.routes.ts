import { Router } from 'express'
import * as chatController from '../controllers/chats.controller.js'

const router = Router();

router.get('/:id', chatController.getChat);
router.post('/', chatController.createChat);

export default router;

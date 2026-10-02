import { type Request, type Response } from 'express';
import * as chatService from '../services/chats.services.js'

export async function getChat(req: Request, res: Response) {
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be a positive integer' });

	const chat = await chatService.get(id);
	if (!chat)
		return res.status(404).json({ error: 'chat not found' });

	res.status(200).json(chat);
}

export async function createChat(req: Request, res: Response) {
	const chat = await chatService.create();

	res.status(201).json(chat);
}

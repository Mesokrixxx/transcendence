import { type Request, type Response } from 'express';
import * as chatService from '../services/chats.services.js'
import { query } from '../utils/query.js'
import { treatError } from '../utils/errors.js';
import { appendToSchema } from '../validations/chats.validation.js';

export async function getChat(req: Request, res: Response) {
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be a positive integer' });

	const { result, error } = await query(() => chatService.get(id));
	if (error) {
		const treatedErr = treatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	if (!result)
		return res.status(404).json({ error: 'chat not found' });

	res.status(200).json(result);
}

export async function createChat(req: Request, res: Response) {
	const { result, error } = await query(() => chatService.create());
	
	if (error) {
		const treatedErr = treatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	res.status(201).json(result);
}

export async function appendTo(req: Request, res: Response) {
	const user = req.user;
	if (!user)
		return res.status(401).json({ error: 'user must be logged in' });

	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be a positive integer' });

	const treatedReq = appendToSchema.safeParse(req.body);
	if (!treatedReq.success) {
		return res.status(400).json({
			error: 'invalid request body',
			details: treatedReq.error.issues
		});
	}

	const { message } = treatedReq.data;
	const { result, error } = await query(() => chatService.append(message, id, user.id));
	if (error) {
		const treatedErr = treatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	if (!result)
		return res.status(404).json({ error: 'chat not found' });

	return res.status(200).json(result);
}

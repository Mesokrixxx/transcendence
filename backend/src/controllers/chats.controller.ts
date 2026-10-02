import { type Request, type Response } from 'express';
import * as chatService from '../services/chats.services.js'
import { query } from '../utils/query.js'
import { prismaTreatError } from '../utils/prismaError.js';

export async function getChat(req: Request, res: Response) {
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be a positive integer' });

	const { result, error } = await query(() => chatService.get(id));
	if (error) {
		const treatedErr = prismaTreatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	res.status(200).json(result);
}

export async function createChat(req: Request, res: Response) {
	const { result, error } = await query(() => chatService.create());
	
	if (error) {
		const treatedErr = prismaTreatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	res.status(201).json(result);
}

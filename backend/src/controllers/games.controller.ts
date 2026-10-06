import { type Request, type Response } from 'express';
import * as gameService from '../services/games.service.js';
import { createGameSchema } from '../validations/games.validations.js';
import { query } from '../utils/query.js'
import { treatError } from '../utils/errors.js';

export async function getGame(req: Request, res: Response) {
	const id = Number(req.params.id);

	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be an integer' });

	const { result, error } = await query(() => gameService.get(id));
	if (error) {
		const treatedErr = treatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	if (!result)
		return res.status(404).json({ error: 'game not found' });

	res.status(200).json(result);
}

export async function createGame(req: Request, res: Response) {
	const treatedReq = createGameSchema.safeParse(req.body);
	if (!treatedReq.success) {
		return res.status(400).json({
			error: 'Invalid body request',
			details: treatedReq.error.issues
		});
	}

	const { whiteId, blackId } = treatedReq.data; // TODO maybe verify ids and use req.user.id
	const { result, error } = await query(() => gameService.create(whiteId, blackId));
	if (error) {
		const treatedErr = treatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	res.status(201).json(result);
}

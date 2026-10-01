import { type Request, type Response } from 'express';
import * as gameService from '../services/games.service.js';
import { createGameSchema } from '../validations/games.validations.js';

export async function createGame(req: Request, res: Response) {
	const result = createGameSchema.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({
			error: 'Invalid body request',
			details: result.error.issues
		});
	}

	const { whiteId, blackId } = result.data;
	const game = await gameService.create(whiteId, blackId);
	
	res.status(200).json(game);
}

export async function getGame(req: Request, res: Response) {
	const id = Number(req.params.id);

	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be an integer' });

	const game = await gameService.get(id);
	if (!game)
		return res.status(404).json({ error: 'game not found' });

	res.status(201).json(game);
}

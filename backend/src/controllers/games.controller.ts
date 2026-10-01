import { type Request, type Response } from 'express';
import * as gameService from '../services/games.service.js';
import { isNonEmptyString } from '../utils/validates.js';
import { type CreateGameBody } from '../shared/routeBodyDefs.js';

export function createGame(req: Request<{}, {}, CreateGameBody>, res: Response) {
	const { white, black } = req.body ?? {};
	if (!isNonEmptyString(white)|| !isNonEmptyString(black))
		return res.status(400).json({ error: 'white and black shall be a non empty string' });

	const game = gameService.create(white, black);
	
	res.status(201).json(game);
}

export function getGame(req: Request, res: Response) {
	const game = gameService.get(Number(req.params.id));
	if (!game)
		return res.status(404).json({ error: 'id is not link to any game' });

	res.status(201).json(game);
}

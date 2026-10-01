import { type Request, type Response } from 'express';
import * as gameService from '../services/games.service.ts';
import { isNonEmptyString } from '../utils/validates.ts';
import { type CreateGameBody } from '../../shared/routeBodyDefs.ts';

export function createGame(req: Request<{}, {}, CreateGameBody>, res: Response) {
	const { playerA, playerB } = req.body ?? {};
	if (!isNonEmptyString(playerA)|| !isNonEmptyString(playerB))
		return res.status(400).json({ error: 'playerA and playerB shall be a non empty string' });

	const game = gameService.create(playerA, playerB);
	
	res.status(201).json(game);
}

export function getGame(req: Request, res: Response) {
	const game = gameService.get(req.params.id);
	if (!game)
		return res.status(404).json({ error: 'id is not link to any game' });

	res.status(201).json(game);
}

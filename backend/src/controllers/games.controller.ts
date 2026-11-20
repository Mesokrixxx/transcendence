import { type Request, type Response } from 'express';
import * as gameService from '../services/games.service.js';
import { createGameSchema } from '../validations/games.validations.js';
import { moveSchema } from '../validations/game-play.validation.js';
import { query } from '../utils/query.js';
import { treatError } from '../utils/errors.js';
import { broadcast } from '../services/gamePresence.service.js';
import * as presenceService from '../services/presence.service.js';

type GameResult = {
	game: unknown;
	stats: Array<{
		userId: number;
		elo: number;
		gamesPlayed: number;
		maxElo: number;
	}>;
};

function normalizeGameResult(result: GameResult | unknown): GameResult {
	if (
		typeof result === 'object' &&
		result !== null &&
		'game' in result &&
		'stats' in result &&
		Array.isArray(result.stats)
	)
		return result as GameResult;
	return { game: result, stats: [] };
}

function broadcastGameResult(gameId: number, result: GameResult) {
	broadcast(gameId, { type: 'game.updated', game: result.game });
	for (const stats of result.stats)
		presenceService.send(stats.userId, { type: 'stats.updated', stats });
}

export async function listGames(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const { result, error } = await query(() =>
		gameService.listActive(req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	return res.status(200).json({ games: result });
}

export async function getGame(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const id = Number(req.params.id);

	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be an integer' });

	const { result: canSpectate, error: accessError } = await query(() =>
		gameService.canSpectate(id),
	);
	if (accessError) {
		const treatedErr = treatError(accessError);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!canSpectate)
		return res.status(404).json({ error: 'game not found' });

	const { result, error } = await query(() => gameService.getState(id, true));
	if (error) {
		const treatedErr = treatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	if (!result) return res.status(404).json({ error: 'game not found' });

	res.status(200).json(result);
}

export async function createGame(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const treatedReq = createGameSchema.safeParse(req.body);
	if (!treatedReq.success) {
		return res.status(400).json({
			error: 'Invalid body request',
			details: treatedReq.error.issues,
		});
	}

	const { whiteId, blackId } = treatedReq.data;
	if (req.user.id !== whiteId && req.user.id !== blackId)
		return res
			.status(403)
			.json({ error: 'authenticated user must be a game player' });

	const { result, error } = await query(() =>
		gameService.create(whiteId, blackId),
	);
	if (error) {
		const treatedErr = treatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	res.status(201).json(result);
}

export async function getActiveGameWithFriend(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const friendId = Number(req.params.friendId);
	if (!Number.isInteger(friendId) || friendId <= 0)
		return res.status(400).json({ error: 'friendId shall be a positive integer' });

	const { result, error } = await query(() =>
		gameService.getActiveWithFriend(req.user!.id, friendId),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	return res.status(200).json(result);
}

export async function getInvitations(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const { result, error } = await query(() =>
		gameService.getPendingInvitations(req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	return res.status(200).json({ invitations: result });
}

export async function createInvitation(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const receiverId = Number(req.params.friendId);
	if (!Number.isInteger(receiverId) || receiverId <= 0)
		return res.status(400).json({ error: 'friendId shall be a positive integer' });

	const { result, error } = await query(() =>
		gameService.createInvitation(req.user!.id, receiverId),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(404).json({ error: 'invitation could not be created' });
	if (result.activeGame) {
		return res.status(200).json({ gameId: result.activeGame.id });
	}

	presenceService.send(receiverId, {
		type: 'game.invitation.received',
		invitationId: result.invitation?.id,
		senderId: req.user.id,
	});
	return res.status(201).json({ invitationId: result.invitation?.id });
}

export async function acceptInvitation(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const invitationId = Number(req.params.id);
	if (!Number.isInteger(invitationId) || invitationId <= 0)
		return res.status(400).json({ error: 'id shall be a positive integer' });

	const { result, error } = await query(() =>
		gameService.acceptInvitation(invitationId, req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(404).json({ error: 'game not found' });

	presenceService.send(result.whiteId, {
		type: 'game.invitation.accepted',
		gameId: result.id,
		invitationId,
	});
	presenceService.send(result.blackId, {
		type: 'game.invitation.accepted',
		gameId: result.id,
		invitationId,
	});
	return res.status(200).json({ gameId: result.id });
}

export async function declineInvitation(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const invitationId = Number(req.params.id);
	if (!Number.isInteger(invitationId) || invitationId <= 0)
		return res.status(400).json({ error: 'id shall be a positive integer' });

	const { result, error } = await query(() =>
		gameService.declineInvitation(invitationId, req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(404).json({ error: 'invitation not found' });
	presenceService.send(result.senderId, {
		type: 'game.invitation.declined',
		invitationId,
	});
	return res.status(200).json({ invitationId });
}

export async function getDrawOffers(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const { result, error } = await query(() =>
		gameService.getPendingDrawOffers(req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	return res.status(200).json({ offers: result });
}

export async function playMove(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be an integer' });
	const body = moveSchema.safeParse(req.body);
	if (!body.success)
		return res
			.status(400)
			.json({ error: 'Invalid body request', details: body.error.issues });
	const move =
		body.data.promotion === undefined
			? { from: body.data.from, to: body.data.to }
			: {
					from: body.data.from,
					to: body.data.to,
					promotion: body.data.promotion,
				};
	const { result, error } = await query(() =>
		gameService.playMove(id, req.user!.id, move),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(500).json({ error: 'game result unavailable' });
	const gameResult = normalizeGameResult(result);
	broadcastGameResult(id, gameResult);
	return res.status(200).json(gameResult.game);
}

export async function resign(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be an integer' });
	const { result, error } = await query(() =>
		gameService.resign(id, req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(500).json({ error: 'game result unavailable' });
	const gameResult = normalizeGameResult(result);
	broadcastGameResult(id, gameResult);
	return res.status(200).json(gameResult.game);
}

export async function requestDraw(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be an integer' });

	const { result, error } = await query(() =>
		gameService.createDrawOffer(id, req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(404).json({ error: 'draw offer not found' });

	presenceService.send(result.receiverId, {
		type: 'game.draw.received',
		gameId: id,
		senderId: req.user.id,
	});
	return res.status(201).json({ gameId: id });
}

export async function acceptDraw(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be an integer' });

	const { result, error } = await query(() =>
		gameService.acceptDrawOffer(id, req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(404).json({ error: 'game not found' });

	broadcastGameResult(id, result);
	presenceService.send(result.game.whiteId, {
		type: 'game.draw.accepted',
		gameId: id,
	});
	presenceService.send(result.game.blackId, {
		type: 'game.draw.accepted',
		gameId: id,
	});
	return res.status(200).json(result.game);
}

export async function declineDraw(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be an integer' });

	const { result, error } = await query(() =>
		gameService.declineDrawOffer(id, req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(404).json({ error: 'draw offer not found' });

	presenceService.send(result.senderId, {
		type: 'game.draw.declined',
		gameId: id,
	});
	return res.status(200).json({ gameId: id });
}

export async function draw(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be an integer' });
	const { result, error } = await query(() =>
		gameService.draw(id, req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(500).json({ error: 'game result unavailable' });
	const gameResult = normalizeGameResult(result);
	broadcastGameResult(id, gameResult);
	return res.status(200).json(gameResult.game);
}

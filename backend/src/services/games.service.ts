import prisma from '../db/prisma.js';
import { BackendError } from '../types/backendError.types.js';
import ChessGame from '../../../chessgame/src/chessgame.js';
import type { Move } from '../../../chessgame/src/chessgame.types.js';
import { PrismaClientKnownRequestError } from '../generated/prisma/internal/prismaNamespace.js';

const transactionOptions = { isolationLevel: 'Serializable' as const };

function isSerializationConflict(error: unknown) {
	return error instanceof PrismaClientKnownRequestError && error.code === 'P2034';
}

type GameTransactionClient = Pick<typeof prisma, 'game'>;

async function serializableGameTransaction<T>(
	callback: (tx: GameTransactionClient) => Promise<T>,
): Promise<T> {
	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			return await prisma.$transaction(callback, transactionOptions);
		} catch (error: unknown) {
			if (!isSerializationConflict(error) || attempt === 2) throw error;
		}
	}

	throw new Error('unreachable transaction retry state');
}

function readMoves(moves: unknown): Move[] {
	try {
		const parsed: unknown =
			typeof moves === 'string' ? JSON.parse(moves) : moves;
		if (!Array.isArray(parsed)) throw new Error('moves are not an array');
		return parsed as Move[];
	} catch {
		throw new BackendError(500, 'stored game moves are invalid');
	}
}

function gameView(game: {
	id: number;
	status: string;
	result: string | null;
	endType: string | null;
	createdAt: Date;
	startedAt: Date | null;
	endedAt: Date | null;
	whiteId: number;
	blackId: number;
	specChatId: number;
	white?: {
		id: number;
		username: string;
		profile: { avatar: string | null } | null;
	};
	black?: {
		id: number;
		username: string;
		profile: { avatar: string | null } | null;
	};
	moves: unknown;
}) {
	const engine = new ChessGame(readMoves(game.moves));
	return {
		...game,
		moves: engine.getHistory(),
		board: engine.getBoard(),
		turn: engine.getTurn(),
		engineStatus: engine.getGameStatus(),
		check: engine.isCheck(),
		drawClaims: engine.canClaimDraw(),
		...(game.white ? { white: {
			id: game.white.id,
			username: game.white.username,
			avatar: game.white.profile?.avatar ?? null,
		} } : {}),
		...(game.black ? { black: {
			id: game.black.id,
			username: game.black.username,
			avatar: game.black.profile?.avatar ?? null,
		} } : {}),
	};
}

function endData(engine: ChessGame) {
	if (engine.isCheckmate()) {
		return {
			status: 'OVER' as const,
			result:
				engine.getTurn() === 'white' ? ('BLACK' as const) : ('WHITE' as const),
			endType: 'CHECKMATE' as const,
		};
	}
	if (engine.isDraw()) {
		const reason = engine.getDrawReason();
		return {
			status: 'OVER' as const,
			result: 'DRAW' as const,
			endType:
				reason === 'stalemate'
					? ('STALEMATE' as const)
					: reason === 'insufficient material'
						? ('INSUFMATERIAL' as const)
						: reason === 'fivefold-repetition'
							? ('TRIPLEREPETITION' as const)
							: ('FIFTYMOVE' as const),
		};
	}
	return { status: 'PLAYING' as const, result: null, endType: null };
}

export async function create(whiteId: number, blackId: number) {
	return await prisma.$transaction(async (tx) => {
		const users = await tx.user.findMany({
			where: {
				id: {
					in: [whiteId, blackId],
				},
			},
		});

		if (users.length !== 2) throw new BackendError(400, 'invalid game players');

		const specChat = await tx.chat.create({ data: {} });
		const gameChat = await tx.chat.create({
			data: {
				users: {
					connect: [{ id: whiteId }, { id: blackId }],
				},
			},
		});

		return await tx.game.create({
			data: {
				whiteId: whiteId,
				blackId: blackId,
				chatId: gameChat.id,
				specChatId: specChat.id,
				moves: [],
			},
		});
	});
}

export async function get(id: number) {
	return await prisma.game.findUnique({
		where: { id: id },
	});
}

export async function canAccess(id: number, userId: number) {
	const game = await prisma.game.findUnique({
		where: { id },
		select: { whiteId: true, blackId: true },
	});
	return game !== null && (game.whiteId === userId || game.blackId === userId);
}

export async function canSpectate(id: number) {
	const game = await prisma.game.findUnique({
		where: { id },
		select: { id: true },
	});
	return game !== null;
}

export async function getState(id: number) {
	const game = await prisma.game.findUnique({
		where: { id },
		include: {
			white: {
				select: {
					id: true,
					username: true,
					profile: { select: { avatar: true } },
				},
			},
			black: {
				select: {
					id: true,
					username: true,
					profile: { select: { avatar: true } },
				},
			},
		},
	});
	if (!game) return null;
	return gameView(game);
}

export async function playMove(id: number, userId: number, move: Move) {
	return await serializableGameTransaction(async (tx) => {
		const game = await tx.game.findUnique({ where: { id } });
		if (!game) throw new BackendError(404, 'game not found');
		if (game.status === 'OVER') throw new BackendError(409, 'game is over');
		const expectedColor =
			game.whiteId === userId
				? 'white'
				: game.blackId === userId
					? 'black'
					: null;
		if (!expectedColor)
			throw new BackendError(403, 'user is not a game player');

		const engine = new ChessGame(readMoves(game.moves));
		if (engine.getTurn() !== expectedColor)
			throw new BackendError(409, "it is not this player's turn");
		try {
			engine.move(move);
		} catch {
			throw new BackendError(400, 'illegal chess move');
		}

		const outcome = endData(engine);
		const updated = await tx.game.update({
			where: { id },
			data: {
				moves: JSON.stringify(engine.getHistory()),
				status: outcome.status,
				result: outcome.result,
				endType: outcome.endType,
				startedAt: game.startedAt ?? new Date(),
				endedAt: outcome.status === 'OVER' ? new Date() : null,
			},
		});
		return gameView(updated);
	});
}

export async function resign(id: number, userId: number) {
	return await serializableGameTransaction(async (tx) => {
		const game = await tx.game.findUnique({ where: { id } });
		if (!game) throw new BackendError(404, 'game not found');
		if (game.status === 'OVER') throw new BackendError(409, 'game is over');
		const result =
			game.whiteId === userId
				? 'BLACK'
				: game.blackId === userId
					? 'WHITE'
					: null;
		if (!result) throw new BackendError(403, 'user is not a game player');
		const updated = await tx.game.update({
			where: { id },
			data: {
				status: 'OVER',
				result,
				endType: 'FORFEIT',
				endedAt: new Date(),
			},
		});
		return gameView(updated);
	});
}

export async function draw(id: number, userId: number) {
	return await serializableGameTransaction(async (tx) => {
		const game = await tx.game.findUnique({ where: { id } });
		if (!game) throw new BackendError(404, 'game not found');
		if (game.status === 'OVER') throw new BackendError(409, 'game is over');
		if (game.whiteId !== userId && game.blackId !== userId)
			throw new BackendError(403, 'user is not a game player');
		const engine = new ChessGame(readMoves(game.moves));

		const reason = engine.canClaimDraw()[0];
		if (!reason) throw new BackendError(409, 'no draw can be claimed');
		return gameView(
			await tx.game.update({
				where: { id },
				data: {
					status: 'OVER',
					result: 'DRAW',
					endType: reason === 'fifty moves' ? 'FIFTYMOVE' : 'TRIPLEREPETITION',
					endedAt: new Date(),
				},
			}),
		);
	});
}

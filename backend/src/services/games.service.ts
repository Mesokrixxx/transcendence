import prisma from '../db/prisma.js';
import { BackendError } from '../types/backendError.types.js';
import ChessGame from '../../../chessgame/src/chessgame.js';
import type { Move } from '../../../chessgame/src/chessgame.types.js';
import { PrismaClientKnownRequestError } from '../generated/prisma/internal/prismaNamespace.js';
import { getKFactor, getUpdatedELOs } from '../utils/elo.js';

const transactionOptions = { isolationLevel: 'Serializable' as const };

function isSerializationConflict(error: unknown) {
	return error instanceof PrismaClientKnownRequestError && error.code === 'P2034';
}

type GameTransactionClient = Pick<typeof prisma, 'game' | 'user'>;

type GameOutcome = {
	status: 'OVER';
	result: 'DRAW' | 'WHITE' | 'BLACK';
	endType:
		| 'CHECKMATE'
		| 'FORFEIT'
		| 'TIMEFORFEIT'
		| 'STALEMATE'
		| 'INSUFMATERIAL'
		| 'TRIPLEREPETITION'
		| 'FIFTYMOVE'
		| 'AGREED';
};

async function applyFinishedGame(
	tx: GameTransactionClient,
	game: {
		id: number;
		status: string;
		whiteId: number;
		blackId: number;
	},
	outcome: GameOutcome,
) {
	if (game.status === 'OVER')
		return;

	const players = await tx.user.findMany({
		where: { id: { in: [game.whiteId, game.blackId] } },
		select: {
			id: true,
			elo: true,
			gamesPlayed: true,
			maxElo: true,
		},
	});
	const white = players.find((player) => player.id === game.whiteId);
	const black = players.find((player) => player.id === game.blackId);
	if (!white || !black)
		throw new BackendError(400, 'invalid game players');

	const eloResult: 1 | 0.5 | -1 =
		outcome.result === 'DRAW'
			? 0.5
			: outcome.result === 'WHITE'
				? 1
				: -1;
	const [whiteElo, blackElo] = getUpdatedELOs(
		white.elo,
		black.elo,
		eloResult,
		getKFactor(white.maxElo, white.gamesPlayed),
		getKFactor(black.maxElo, black.gamesPlayed),
	);

	await Promise.all([
		tx.user.update({
			where: { id: white.id },
			data: {
				elo: whiteElo,
				gamesPlayed: { increment: 1 },
				maxElo: Math.max(white.maxElo, whiteElo),
			},
		}),
		tx.user.update({
			where: { id: black.id },
			data: {
				elo: blackElo,
				gamesPlayed: { increment: 1 },
				maxElo: Math.max(black.maxElo, blackElo),
			},
		}),
	]);
}

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

export async function getActiveWithFriend(userId: number, friendId: number) {
	return await prisma.game.findFirst({
		where: {
			status: { in: ['WAITING', 'PLAYING'] },
			OR: [
				{ whiteId: userId, blackId: friendId },
				{ whiteId: friendId, blackId: userId },
			],
		},
		orderBy: { createdAt: 'desc' },
		select: { id: true },
	});
}

export async function createInvitation(senderId: number, receiverId: number) {
	if (senderId === receiverId)
		throw new BackendError(400, 'you cannot invite yourself');

	const friendship = await prisma.user.findUnique({
		where: {
			id: senderId,
			friendsAdded: { some: { id: receiverId } },
			addedBy: { some: { id: receiverId } },
		},
		select: { id: true },
	});
	if (!friendship)
		throw new BackendError(403, 'game invitations require friendship');

	const activeGame = await getActiveWithFriend(senderId, receiverId);
	if (activeGame)
		return { activeGame, invitation: null };

	const existing = await prisma.gameInvitation.findFirst({
		where: {
			status: 'PENDING',
			OR: [
				{ senderId, receiverId },
				{ senderId: receiverId, receiverId: senderId },
			],
		},
		orderBy: { createdAt: 'desc' },
	});
	if (existing)
		return { activeGame: null, invitation: existing };

	const invitation = await prisma.gameInvitation.create({
		data: { senderId, receiverId, status: 'PENDING' },
	});
	return { activeGame: null, invitation };
}

export async function getPendingInvitations(userId: number) {
	return await prisma.gameInvitation.findMany({
		where: { receiverId: userId, status: 'PENDING' },
		orderBy: { createdAt: 'desc' },
		include: {
			sender: {
				select: {
					id: true,
					username: true,
					profile: { select: { avatar: true, displayName: true } },
				},
			},
		},
	});
}

export async function acceptInvitation(invitationId: number, userId: number) {
	const invitation = await prisma.gameInvitation.findUnique({
		where: { id: invitationId },
	});
	if (!invitation)
		throw new BackendError(404, 'invitation not found');
	if (invitation.receiverId !== userId)
		throw new BackendError(403, 'you are not the invited player');
	if (invitation.status === 'DECLINED')
		throw new BackendError(409, 'invitation was declined');

	if (invitation.status === 'ACCEPTED') {
		const activeGame = await getActiveWithFriend(invitation.senderId, userId);
		if (activeGame) {
			const existingGame = await prisma.game.findUnique({ where: { id: activeGame.id } });
			if (existingGame) return existingGame;
		}
		throw new BackendError(409, 'invitation was already accepted');
	}

	const activeGame = await getActiveWithFriend(invitation.senderId, userId);
	if (activeGame) {
		const existingGame = await prisma.game.findUnique({ where: { id: activeGame.id } });
		if (existingGame) return existingGame;
	}

	const game = await prisma.$transaction(async (tx) => {
		const whiteId = invitation.senderId;
		const blackId = userId;

		const users = await tx.user.findMany({
			where: { id: { in: [invitation.senderId, userId] } },
			select: { id: true },
		});
		if (users.length !== 2)
			throw new BackendError(400, 'invalid game players');

		const specChat = await tx.chat.create({ data: {} });
		const gameChat = await tx.chat.create({
			data: {
				users: {
					connect: [{ id: invitation.senderId }, { id: userId }],
				},
			},
		});
		const created = await tx.game.create({
			data: {
				whiteId,
				blackId,
				chatId: gameChat.id,
				specChatId: specChat.id,
				moves: [],
			},
		});
		await tx.gameInvitation.deleteMany({
			where: {
				status: 'PENDING',
				OR: [
					{ senderId: invitation.senderId, receiverId: userId },
					{ senderId: userId, receiverId: invitation.senderId },
				],
			},
		});
		return created;
	});
	return game;
}

export async function declineInvitation(invitationId: number, userId: number) {
	const invitation = await prisma.gameInvitation.findUnique({
		where: { id: invitationId },
	});
	if (!invitation)
		throw new BackendError(404, 'invitation not found');
	if (invitation.receiverId !== userId)
		throw new BackendError(403, 'you are not the invited player');
	if (invitation.status !== 'PENDING')
		throw new BackendError(409, 'invitation is no longer pending');

	await prisma.gameInvitation.deleteMany({
		where: {
			status: 'PENDING',
			OR: [
				{ senderId: invitation.senderId, receiverId: userId },
				{ senderId: userId, receiverId: invitation.senderId },
			],
		},
	});
	return { id: invitationId, senderId: invitation.senderId };
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

export async function getState(id: number, includeDisplayNames = false) {
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      white: {
        select: {
          id: true,
          username: true,
          profile: { select: { avatar: true, displayName: true } },
        },
      },
      black: {
        select: {
          id: true,
          username: true,
          profile: { select: { avatar: true, displayName: true } },
        },
      },
    },
  });

  if (!game) return null;

  const view = gameView(game);
  if (!includeDisplayNames) return view;

  return {
    ...view,
    ...(view.white
      ? { white: { ...view.white, displayName: game.white?.profile?.displayName ?? null } }
      : {}),
    ...(view.black
      ? { black: { ...view.black, displayName: game.black?.profile?.displayName ?? null } }
      : {}),
  };
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
		if (outcome.status === 'OVER') {
			await applyFinishedGame(tx, game, outcome);
		}
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
		await applyFinishedGame(tx, game, {
			status: 'OVER',
			result,
			endType: 'FORFEIT',
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
		const outcome: GameOutcome = {
			status: 'OVER',
			result: 'DRAW',
			endType: 'AGREED',
		};
		const updated = await tx.game.update({
			where: { id },
			data: {
				status: outcome.status,
				result: outcome.result,
				endType: outcome.endType,
				endedAt: new Date(),
			},
		});
		await applyFinishedGame(tx, game, outcome);
		return gameView(updated);
	});
}

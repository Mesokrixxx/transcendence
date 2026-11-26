import prisma from '../db/prisma.js';
import { BackendError } from '../types/backendError.types.js';
import ChessGame from '../../../chessgame/src/chessgame.js';
import type { Move } from '../../../chessgame/src/chessgame.types.js';
import { PrismaClientKnownRequestError } from '../generated/prisma/internal/prismaNamespace.js';
import { getKFactor, getUpdatedELOs } from '../utils/elo.js';
import * as gamificationService from './gamification.service.js';
import * as presenceService from './presence.service.js';

const transactionOptions = { isolationLevel: 'Serializable' as const };

function isSerializationConflict(error: unknown) {
  return (
    error instanceof PrismaClientKnownRequestError && error.code === 'P2034'
  );
}

type GameTransactionClient = Pick<typeof prisma, 'game' | 'user' | 'drawOffer'>;
type StoredGame = NonNullable<Awaited<ReturnType<typeof get>>>;
type GamePlayer = {
  id: number;
  username: string;
  profile: { avatar: string | null; displayName: string | null } | null;
};

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

function gameView(
  game: StoredGame & { white?: GamePlayer; black?: GamePlayer },
  includeDisplayNames = false,
) {
  const engine = new ChessGame(readMoves(game.moves));
  return {
    ...game,
    moves: engine.getHistory(),
    board: engine.getBoard(),
    turn: engine.getTurn(),
    engineStatus: engine.getGameStatus(),
    check: engine.isCheck(),
    drawClaims: engine.canClaimDraw(),
    ...(game.white
      ? {
          white: {
            id: game.white.id,
            username: game.white.username,
            avatar: game.white.profile?.avatar ?? null,
            ...(includeDisplayNames
              ? { displayName: game.white.profile?.displayName ?? null }
              : {}),
            online: presenceService.isOnline(game.white.id),
          },
        }
      : {}),
    ...(game.black
      ? {
          black: {
            id: game.black.id,
            username: game.black.username,
            avatar: game.black.profile?.avatar ?? null,
            ...(includeDisplayNames
              ? { displayName: game.black.profile?.displayName ?? null }
              : {}),
            online: presenceService.isOnline(game.black.id),
          },
        }
      : {}),
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

    const white = users.find((u) => u.id === whiteId);
    const black = users.find((u) => u.id === blackId);

    if (users.length !== 2 || !white || !black)
      throw new BackendError(400, 'invalid game players');

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
        whiteElo: white.elo,
        blackId: blackId,
        blackElo: black.elo,
        chatId: gameChat.id,
        specChatId: specChat.id,
        moves: [],
      },
    });
  });
}

export async function listActive(userId: number) {
  const games = await prisma.game.findMany({
    where: { status: { in: ['WAITING', 'PLAYING'] } },
    orderBy: [{ status: 'desc' }, { createdAt: 'desc' }],
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

  return games
    .map((game) => ({
      ...gameView(game, true),
      isPlayer: game.whiteId === userId || game.blackId === userId,
    }))
    .sort(
      (left, right) =>
        Number(right.isPlayer) - Number(left.isPlayer) ||
        Number(right.status === 'PLAYING') -
          Number(left.status === 'PLAYING') ||
        right.createdAt.getTime() - left.createdAt.getTime(),
    );
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
  if (activeGame) return { activeGame, invitation: null };

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
  if (existing) return { activeGame: null, invitation: existing };

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
  if (!invitation) throw new BackendError(404, 'invitation not found');
  if (invitation.receiverId !== userId)
    throw new BackendError(403, 'you are not the invited player');
  if (invitation.status === 'DECLINED')
    throw new BackendError(409, 'invitation was declined');

  if (invitation.status === 'ACCEPTED') {
    const activeGame = await getActiveWithFriend(invitation.senderId, userId);
    if (activeGame) {
      const existingGame = await prisma.game.findUnique({
        where: { id: activeGame.id },
      });
      if (existingGame) return existingGame;
    }
    throw new BackendError(409, 'invitation was already accepted');
  }

  const activeGame = await getActiveWithFriend(invitation.senderId, userId);
  if (activeGame) {
    const existingGame = await prisma.game.findUnique({
      where: { id: activeGame.id },
    });
    if (existingGame) return existingGame;
  }

  const game = await prisma.$transaction(async (tx) => {
    const whiteId = invitation.senderId;
    const blackId = userId;

    const users = await tx.user.findMany({
      where: { id: { in: [invitation.senderId, userId] } },
      select: { id: true, elo: true },
    });
    const white = users.find((player) => player.id === whiteId);
    const black = users.find((player) => player.id === blackId);
    if (!white || !black) throw new BackendError(400, 'invalid game players');

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
        whiteElo: white.elo,
        blackId,
        blackElo: black.elo,
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
  if (!invitation) throw new BackendError(404, 'invitation not found');
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

export async function createDrawOffer(gameId: number, senderId: number) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, status: true, whiteId: true, blackId: true },
  });
  if (!game) throw new BackendError(404, 'game not found');
  if (game.status === 'OVER') throw new BackendError(409, 'game is over');
  if (game.whiteId !== senderId && game.blackId !== senderId)
    throw new BackendError(403, 'you are not a game player');

  const receiverId = game.whiteId === senderId ? game.blackId : game.whiteId;
  const existing = await prisma.drawOffer.findUnique({
    where: {
      gameId_senderId_receiverId: {
        gameId,
        senderId,
        receiverId,
      },
    },
  });
  if (existing) return existing;

  return await prisma.drawOffer.create({
    data: { gameId, senderId, receiverId, status: 'PENDING' },
  });
}

export async function getPendingDrawOffers(userId: number) {
  return await prisma.drawOffer.findMany({
    where: { receiverId: userId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      game: {
        select: {
          id: true,
          status: true,
          whiteId: true,
          blackId: true,
        },
      },
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

export async function acceptDrawOffer(gameId: number, userId: number) {
  return applyGameMutation(async (tx) => {
    const offer = await tx.drawOffer.findFirst({
      where: { gameId, receiverId: userId, status: 'PENDING' },
    });
    if (!offer) throw new BackendError(404, 'draw offer not found');

    const game = await tx.game.findUnique({ where: { id: gameId } });
    if (!game) throw new BackendError(404, 'game not found');
    if (game.status === 'OVER') throw new BackendError(409, 'game is over');
    if (game.whiteId !== userId && game.blackId !== userId) {
      throw new BackendError(403, 'you are not a game player');
    }

    const updated = await tx.game.update({
      where: { id: gameId },
      data: {
        status: 'OVER',
        result: 'DRAW',
        endType: 'AGREED',
        endedAt: new Date(),
      },
    });
    await tx.drawOffer.deleteMany({ where: { gameId } });
    return updated;
  });
}

export async function declineDrawOffer(gameId: number, userId: number) {
  const offer = await prisma.drawOffer.findFirst({
    where: {
      gameId,
      receiverId: userId,
      status: 'PENDING',
    },
  });
  if (!offer) throw new BackendError(404, 'draw offer not found');

  await prisma.drawOffer.delete({
    where: { id: offer.id },
  });
  return offer;
}

export async function get(id: number) {
  return await prisma.game.findUnique({
    where: { id: id },
  });
}

export async function getAll(userId: number) {
  return await prisma.game.findMany({
    where: {
      OR: [
        {
          whiteId: userId,
        },
        {
          blackId: userId,
        },
      ],
    },
    include: {
      white: {
        select: {
          username: true,
          elo: true,
          maxElo: true,
          profile: {
            select: {
              displayName: true,
            },
          },
        },
      },
      black: {
        select: {
          username: true,
          elo: true,
          maxElo: true,
          profile: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
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
  return gameView(game, includeDisplayNames);
}

type PlayerStats = {
  userId: number;
  elo: number;
  gamesPlayed: number;
  maxElo: number;
};

async function updateStats(
  tx: GameTransactionClient,
  game: {
    whiteId: number;
    blackId: number;
    result: NonNullable<StoredGame['result']>;
  },
): Promise<PlayerStats[]> {
  const users = await tx.user.findMany({
    where: { id: { in: [game.whiteId, game.blackId] } },
    select: { id: true, elo: true, maxElo: true, gamesPlayed: true },
  });
  const white = users.find((user) => user.id === game.whiteId);
  const black = users.find((user) => user.id === game.blackId);
  if (!white || !black) throw new BackendError(500, 'game players not found');

  const [whiteElo, blackElo] = getUpdatedELOs(
    white.elo,
    black.elo,
    game.result === 'WHITE' ? 1 : game.result === 'BLACK' ? -1 : 0.5,
    getKFactor(white.maxElo, white.gamesPlayed),
    getKFactor(black.maxElo, black.gamesPlayed),
  );
  const stats = [
    {
      userId: white.id,
      elo: whiteElo,
      gamesPlayed: white.gamesPlayed + 1,
      maxElo: Math.max(white.maxElo, whiteElo),
    },
    {
      userId: black.id,
      elo: blackElo,
      gamesPlayed: black.gamesPlayed + 1,
      maxElo: Math.max(black.maxElo, blackElo),
    },
  ];
  await Promise.all(
    stats.map((player) =>
      tx.user.update({
        where: { id: player.userId },
        data: {
          elo: player.elo,
          gamesPlayed: player.gamesPlayed,
          maxElo: player.maxElo,
        },
      }),
    ),
  );
  return stats;
}

async function notifyGamification(gameId: number) {
  const changedUsers = await gamificationService.recordGameResult(gameId);
  await Promise.all(
    changedUsers.map(async (userId) => {
      presenceService.broadcast({
        type: 'gamification.updated',
        userId,
        progress: await gamificationService.getProgress(userId),
        featuredBadges: await gamificationService.getFeaturedBadges(userId),
      });
    }),
  );
}

async function applyGameMutation(
  mutate: (tx: GameTransactionClient) => Promise<StoredGame>,
) {
  const result = await serializableGameTransaction(async (tx) => {
    const game = await mutate(tx);
    const stats =
      game.status === 'OVER' && game.result !== null
        ? await updateStats(tx, {
            whiteId: game.whiteId,
            blackId: game.blackId,
            result: game.result,
          })
        : [];

    return { game: gameView(game), stats };
  });

  if (result.stats.length > 0) await notifyGamification(result.game.id);
  return result;
}

export async function playMove(id: number, userId: number, move: Move) {
  return applyGameMutation(async (tx) => {
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
    return tx.game.update({
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
  });
}

export async function resign(id: number, userId: number) {
  return applyGameMutation(async (tx) => {
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
    return tx.game.update({
      where: { id },
      data: {
        status: 'OVER',
        result,
        endType: 'FORFEIT',
        endedAt: new Date(),
      },
    });
  });
}

export async function draw(id: number, userId: number) {
  return applyGameMutation(async (tx) => {
    const game = await tx.game.findUnique({ where: { id } });
    if (!game) throw new BackendError(404, 'game not found');
    if (game.status === 'OVER') throw new BackendError(409, 'game is over');
    const playerColor =
      game.whiteId === userId
        ? 'white'
        : game.blackId === userId
          ? 'black'
          : null;
    if (!playerColor) throw new BackendError(403, 'user is not a game player');
    const engine = new ChessGame(readMoves(game.moves));

    // A draw can only be claimed by the player whose turn it is.
    if (engine.getTurn() !== playerColor)
      throw new BackendError(409, "it is not this player's turn");

    const reason = engine.claimDraw();
    if (!reason) throw new BackendError(409, 'no draw can be claimed');
    return tx.game.update({
      where: { id },
      data: {
        status: 'OVER',
        result: 'DRAW',
        endType: reason === 'fifty moves' ? 'FIFTYMOVE' : 'TRIPLEREPETITION',
        endedAt: new Date(),
      },
    });
  });
}

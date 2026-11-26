import prisma from '../db/prisma.js';
import { BackendError } from '../types/backendError.types.js';

const ACHIEVEMENTS = [
  {
    code: 'first-game',
    name: 'Premiers pas',
    description: 'Terminer sa première partie',
  },
  {
    code: 'three-wins',
    name: 'Habitude gagnante',
    description: 'Gagner 3 parties',
  },
  {
    code: 'elo-1600',
    name: 'Joueur confirmé',
    description: 'Atteindre 1600 ELO',
  },
  {
    code: 'elo-1800',
    name: 'Maître du classement',
    description: 'Atteindre 1800 ELO',
  },
] as const;

const BADGES = [
  {
    code: 'win-streak-record',
    name: 'Série de victoires',
    description: 'Votre plus longue série de victoires',
  },
  {
    code: 'consecutive-days-record',
    name: 'Régularité',
    description: 'Votre plus longue série de jours avec une partie',
  },
  {
    code: 'daily-games-record',
    name: 'Marathonien',
    description: 'Votre record de parties terminées en une journée',
  },
  {
    code: 'highest-elo-record',
    name: 'Sommet du classement',
    description: 'Votre plus haut Elo atteint',
  },
] as const;

function isWinForPlayer(
  result: 'DRAW' | 'WHITE' | 'BLACK' | null,
  whiteId: number,
  playerId: number,
) {
  return (
    result !== null &&
    result !== 'DRAW' &&
    result === (whiteId === playerId ? 'WHITE' : 'BLACK')
  );
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function longestWinStreak(
  games: Array<{
    result: 'DRAW' | 'WHITE' | 'BLACK' | null;
    whiteId: number;
  }>,
  playerId: number,
) {
  let current = 0;
  let longest = 0;
  for (const game of games) {
    if (isWinForPlayer(game.result, game.whiteId, playerId)) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

function longestConsecutiveDays(dates: string[]) {
  const uniqueDays = [...new Set(dates)].sort();
  let current = 0;
  let longest = 0;
  let previous: Date | null = null;
  for (const day of uniqueDays) {
    const date = new Date(`${day}T00:00:00.000Z`);
    const consecutive =
      previous !== null &&
      date.getTime() - previous.getTime() === 24 * 60 * 60 * 1000;
    current = consecutive ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = date;
  }
  return longest;
}

export async function recordGameResult(gameId: number) {
  return prisma.$transaction(async (tx) => {
    const changedUsers = new Set<number>();
    const game = await tx.game.findUnique({ where: { id: gameId } });
    if (
      !game ||
      game.status !== 'OVER' ||
      !game.result ||
      game.gamificationProcessed
    )
      return [];

    await tx.game.update({
      where: { id: gameId },
      data: { gamificationProcessed: true },
    });

    const players = [game.whiteId, game.blackId];
    const achievements = await Promise.all(
      ACHIEVEMENTS.map((achievement) =>
        tx.achievement.upsert({
          where: { code: achievement.code },
          create: achievement,
          update: {
            name: achievement.name,
            description: achievement.description,
          },
        }),
      ),
    );
    const badges = await Promise.all(
      BADGES.map((badge) =>
        tx.badge.upsert({
          where: { code: badge.code },
          create: badge,
          update: { name: badge.name, description: badge.description },
        }),
      ),
    );

    for (const playerId of players) {
      const [user, gamesPlayed, wins, playerGames] = await Promise.all([
        tx.user.findUniqueOrThrow({
          where: { id: playerId },
          select: { elo: true, maxElo: true },
        }),
        tx.game.count({
          where: {
            status: 'OVER',
            OR: [{ whiteId: playerId }, { blackId: playerId }],
          },
        }),
        tx.game.count({
          where: {
            status: 'OVER',
            OR: [{ whiteId: playerId }, { blackId: playerId }],
            ...(playerId === game.whiteId
              ? { result: 'WHITE' }
              : { result: 'BLACK' }),
          },
        }),
        tx.game.findMany({
          where: {
            status: 'OVER',
            OR: [{ whiteId: playerId }, { blackId: playerId }],
          },
          orderBy: { endedAt: 'desc' },
          select: { result: true, whiteId: true, endedAt: true },
        }),
      ]);

      const earnedAchievements = achievements.filter((achievement) => {
        if (achievement.code === 'first-game') return gamesPlayed >= 1;
        if (achievement.code === 'three-wins') return wins >= 3;
        if (achievement.code === 'elo-1600') return user.elo >= 1600;
        return user.elo >= 1800;
      });
      for (const achievement of earnedAchievements) {
        const created = await tx.userAchievement.createMany({
          data: [{ userId: playerId, achievementId: achievement.id }],
          skipDuplicates: true,
        });
        if (created.count > 0) changedUsers.add(playerId);
      }

      const orderedGames = [...playerGames].reverse();
      const dates = playerGames
        .map((playerGame) => playerGame.endedAt)
        .filter((endedAt): endedAt is Date => endedAt !== null)
        .map(dayKey);
      const gamesPerDay = new Map<string, number>();
      for (const date of dates)
        gamesPerDay.set(date, (gamesPerDay.get(date) ?? 0) + 1);
      const records = new Map([
        ['win-streak-record', longestWinStreak(orderedGames, playerId)],
        ['consecutive-days-record', longestConsecutiveDays(dates)],
        ['daily-games-record', Math.max(0, ...gamesPerDay.values())],
        ['highest-elo-record', user.maxElo],
      ]);
      for (const badge of badges) {
        const record = records.get(badge.code) ?? 0;
        if (record === 0) continue;
        const owned = await tx.badgesOnProfile.findUnique({
          where: {
            profileUserId_badgeId: {
              profileUserId: playerId,
              badgeId: badge.id,
            },
          },
          select: { record: true },
        });
        if (owned && owned.record >= record) continue;
        await tx.badgesOnProfile.upsert({
          where: {
            profileUserId_badgeId: {
              profileUserId: playerId,
              badgeId: badge.id,
            },
          },
          create: {
            profileUserId: playerId,
            badgeId: badge.id,
            record,
          },
          update: { record },
        });
        changedUsers.add(playerId);
      }
    }
    return [...changedUsers];
  });
}

async function ensureRewardCatalog() {
  await prisma.$transaction([
    ...ACHIEVEMENTS.map((achievement) =>
      prisma.achievement.upsert({
        where: { code: achievement.code },
        create: achievement,
        update: {
          name: achievement.name,
          description: achievement.description,
        },
      }),
    ),
    ...BADGES.map((badge) =>
      prisma.badge.upsert({
        where: { code: badge.code },
        create: badge,
        update: { name: badge.name, description: badge.description },
      }),
    ),
  ]);
}

export async function getProgress(userId: number) {
  await ensureRewardCatalog();
  const [user, achievements, badges, ownedAchievements, ownedBadges] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          elo: true,
          maxElo: true,
          whiteGames: {
            where: { status: 'OVER' },
            orderBy: { endedAt: 'desc' },
            select: { result: true, whiteId: true, endedAt: true },
          },
          blackGames: {
            where: { status: 'OVER' },
            orderBy: { endedAt: 'desc' },
            select: { result: true, whiteId: true, endedAt: true },
          },
        },
      }),
      prisma.achievement.findMany({ orderBy: { id: 'asc' } }),
      prisma.badge.findMany({ orderBy: { id: 'asc' } }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, unlockedAt: true },
      }),
      prisma.badgesOnProfile.findMany({
        where: { profileUserId: userId },
        select: {
          badgeId: true,
          record: true,
          featured: true,
          assignedAt: true,
        },
      }),
    ]);

  if (!user) return null;

  const games = [...user.whiteGames, ...user.blackGames].sort(
    (left, right) =>
      (right.endedAt?.getTime() ?? 0) - (left.endedAt?.getTime() ?? 0),
  );
  const gamesPlayed = games.length;
  const wins = games.filter((game) =>
    isWinForPlayer(game.result, game.whiteId, userId),
  ).length;
  const dates = games
    .map((game) => game.endedAt)
    .filter((endedAt): endedAt is Date => endedAt !== null)
    .map(dayKey);
  const gamesPerDay = new Map<string, number>();
  for (const date of dates)
    gamesPerDay.set(date, (gamesPerDay.get(date) ?? 0) + 1);
  const records = new Map([
    ['win-streak-record', longestWinStreak([...games].reverse(), userId)],
    ['consecutive-days-record', longestConsecutiveDays(dates)],
    ['daily-games-record', Math.max(0, ...gamesPerDay.values())],
    ['highest-elo-record', user.maxElo],
  ]);
  const achievementMap = new Map(
    ownedAchievements.map((item) => [item.achievementId, item.unlockedAt]),
  );
  const badgeMap = new Map(ownedBadges.map((item) => [item.badgeId, item]));

  return {
    achievements: achievements.map((achievement) => ({
      achievement,
      unlocked: achievementMap.has(achievement.id),
      unlockedAt: achievementMap.get(achievement.id) ?? null,
      stats: {
        gamesPlayed,
        wins,
        elo: user.elo,
      },
    })),
    badges: badges.map((badge) => ({
      badge,
      record: records.get(badge.code) ?? 0,
      unlocked: badgeMap.has(badge.id),
      featured: badgeMap.get(badge.id)?.featured ?? false,
      assignedAt: badgeMap.get(badge.id)?.assignedAt ?? null,
    })),
  };
}

export async function getFeaturedBadges(userId: number) {
  return prisma.badgesOnProfile.findMany({
    where: { profileUserId: userId, featured: true },
    include: { badge: true },
    orderBy: { assignedAt: 'asc' },
  });
}

export async function setBadgeFeatured(
  userId: number,
  code: string,
  featured: boolean,
) {
  return prisma.$transaction(async (tx) => {
    const badge = await tx.badge.findUnique({ where: { code } });
    if (!badge) return null;
    const owned = await tx.badgesOnProfile.findUnique({
      where: {
        profileUserId_badgeId: {
          profileUserId: userId,
          badgeId: badge.id,
        },
      },
    });
    if (!owned) return null;
    if (featured) {
      const featuredCount = await tx.badgesOnProfile.count({
        where: { profileUserId: userId, featured: true },
      });
      if (featuredCount >= 3 && !owned.featured) {
        throw new BackendError(400, 'a profile can feature at most 3 badges');
      }
    }
    return tx.badgesOnProfile.update({
      where: {
        profileUserId_badgeId: {
          profileUserId: userId,
          badgeId: badge.id,
        },
      },
      data: { featured },
      include: { badge: true },
    });
  });
}

import prisma from '../db/prisma.js';
import bcrypt from 'bcrypt';
import { BackendError } from '../types/backendError.types.js';
import { randomBytes } from 'node:crypto';
import { PrismaClientKnownRequestError } from '../generated/prisma/internal/prismaNamespace.js';

export async function get(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      elo: true,
      gamesPlayed: true,
      maxElo: true,
      profile: {
        select: { avatar: true, displayName: true },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    elo: user.elo,
    gamesPlayed: user.gamesPlayed,
    maxElo: user.maxElo,
    avatar: user.profile?.avatar ?? null,
    displayName: user.profile?.displayName ?? null,
  };
}

export async function getPlayerProfile(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      elo: true,
      gamesPlayed: true,
      profile: {
        select: { avatar: true, displayName: true },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    avatar: user.profile?.avatar ?? null,
    displayName: user.profile?.displayName ?? null,
    elo: user.elo,
    gamesPlayed: user.gamesPlayed,
  };
}

export async function getGithubUser(githubId: number) {
  return await prisma.user.findUnique({
    where: { githubId },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });
}

export async function create(name: string, email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username: name,
      email: email,
      password: hashedPassword,
      profile: {
        create: {
          displayName: name,
        },
      },
    },
  });

  return get(user.id);
}

export async function createGithubUser(
  login: string,
  email: string,
  githubId: number,
) {
  const maxUsernameLength = 32;
  const randomSize = Math.floor(maxUsernameLength / 3);

  function getRandomUsername(): string {
    const base = login.slice(
      0,
      Math.min(login.length, maxUsernameLength - randomSize),
    );
    const random = randomBytes(Math.floor(randomSize / 2)).toString('hex');
    return base + random;
  }

  login = login.trim();
  if (login.length === 0) login = getRandomUsername();
  else if (login.length > maxUsernameLength)
    login = login.slice(0, maxUsernameLength);

  for (let tries = 0; tries < 42; tries++) {
    const username = !tries ? login : getRandomUsername();

    try {
      const user = await prisma.user.create({
        data: {
          username,
          email,
          githubId,
          profile: {
            create: {
              displayName: login,
            },
          },
        },
      });

      return get(user.id);
    } catch (e: unknown) {
      if (!(e instanceof PrismaClientKnownRequestError) || e.code !== 'P2002')
        throw e;
    }
  }

  throw new BackendError(500, 'unable to create GitHub user');
}

// Never used by OAuth logic
export async function auth(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email },
    select: {
      id: true,
      username: true,
      email: true,
      elo: true,
      gamesPlayed: true,
      maxElo: true,
      password: true,
    },
  });

  if (!user) return null;
  if (!user.password) return null;

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    elo: user.elo,
    gamesPlayed: user.gamesPlayed,
    maxElo: user.maxElo,
  };
}

export async function update(
  id: number,
  data: {
    username?: string | undefined;
    password?: string | undefined;
    currentPassword?: string | undefined;
    displayName?: string | null | undefined;
    avatar?: string | undefined;
  },
) {
  if (data.password !== undefined) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (
      !user?.password ||
      !data.currentPassword ||
      !(await bcrypt.compare(data.currentPassword, user.password))
    ) {
      throw new BackendError(401, 'current password is incorrect');
    }
  }

  const profileData = {
    ...(data.displayName !== undefined
      ? { displayName: data.displayName }
      : {}),
    ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
  };

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...(data.username !== undefined ? { username: data.username } : {}),
      ...(data.password !== undefined
        ? { password: await bcrypt.hash(data.password, 12) }
        : {}),
      ...(Object.keys(profileData).length > 0
        ? {
            profile: {
              upsert: {
                create: profileData,
                update: profileData,
              },
            },
          }
        : {}),
    },
  });

  return get(updatedUser.id);
}

export async function getAll() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      elo: true,
      profile: {
        select: { avatar: true, displayName: true },
      },
      whiteGames: {
        where: { result: { not: null } },
        select: { result: true },
      },
      blackGames: {
        where: { result: { not: null } },
        select: { result: true },
      },
    },
    orderBy: { elo: 'desc' },
  });

  return users
    .map((user) => {
      const wins =
        user.whiteGames.filter((game) => game.result === 'WHITE').length +
        user.blackGames.filter((game) => game.result === 'BLACK').length;
      const games = user.whiteGames.length + user.blackGames.length;

      return {
        id: user.id,
        username: user.username,
        displayName: user.profile?.displayName ?? null,
        rating: user.elo,
        wins,
        games,
        avatar: user.profile?.avatar ?? '',
      };
    })
    .sort(
      (left, right) =>
        right.rating - left.rating ||
        right.games - left.games ||
        left.username.localeCompare(right.username) ||
        left.id - right.id,
    );
}

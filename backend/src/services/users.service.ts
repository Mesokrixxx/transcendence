import prisma from '../db/prisma.js'
import bcrypt from 'bcrypt'
import { BackendError } from '../types/backendError.types.js';

export async function get(id: number) {
	return await prisma.user.findUnique({
		where: { id: id },
		select: {
			id: true,
			username: true,
			email: true
		}
	});
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
		}
	});

	return get(user.id);
}

export async function createGithubUser(username: string, email: string, githubId: number) {
  const user = await prisma.user.create({
    data: {
      username,
      email,
      githubId,
    }
  });

  return get(user.id);
}

// Never used by OAuth logic
export async function auth(email: string, password: string) {
	const user = await prisma.user.findUnique({
		where: { email: email },
		select: {
			id: true,
			username: true,
			email: true,
			password: true
		}
	});

	if (!user)
		return null;

	if (!user.password) {
    return null;
	}

	const passwordMatches = await bcrypt.compare(password, user.password);

	if (!passwordMatches) {
		return null;
	}

	return {
		id: user.id,
		username: user.username,
		email: user.email
	};
}

export async function update(
	id: number,
	data: {
		username?: string;
		password?: string;
		currentPassword?: string;
	}
) {
	if (data.password !== undefined) {
		const user = await prisma.user.findUnique({
			where: { id },
			select: { password: true }
		});

		if (!user?.password || !data.currentPassword ||
			!await bcrypt.compare(data.currentPassword, user.password))
			throw new BackendError(401, 'current password is incorrect');
	}

	const updatedUser = await prisma.user.update({
		where: { id },
		data: {
			...(data.username !== undefined ? { username: data.username } : {}),
			...(data.password !== undefined
				? { password: await bcrypt.hash(data.password, 12) }
				: {})
		}
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
				select: { avatar: true },
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

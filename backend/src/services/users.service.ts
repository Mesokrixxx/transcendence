import prisma from '../db/prisma.js'
import bcrypt from 'bcrypt'

export async function get(id: number) {
	return await prisma.user.findUnique({
		where: { id: id },
		select: {
			id: true,
			username: true,
			email: true,
			profile: {
				select: {
					displayName: true,
					avatar: true,
				},
			},
		}
	}).then((user) => user && ({
		id: user.id,
		username: user.username,
		email: user.email,
		displayName: user.profile?.displayName ?? '',
		avatar: user.profile?.avatar ?? '',
	}));
}

export async function create(name: string, email: string, password: string) {
	const hashedPassword = await bcrypt.hash(password, 12);
	const user = await prisma.user.create({
		data: {
			username: name,
			email: email,
			password: hashedPassword, // TODO handle OAuth 2.0
		}
	});

	return get(user.id);
}

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
    return null; // TODO handle OAuth 2.0
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
		displayName?: string;
		avatar?: string;
	}
) {
	await prisma.profile.upsert({
		where: { userId: id },
		create: {
			userId: id,
			...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
			...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
		},
		update: {
			...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
			...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
		},
	});

	return get(id);
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

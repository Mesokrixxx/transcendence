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

	if (user.password)
		if (!await bcrypt.compare(password, user.password))
			return null;
	else
		return null; // TODO handle oauth 2.0

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

import prisma from '../db/prisma.js'
import bcrypt from 'bcrypt'

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
	const hashedPassword = await bcrypt.hash(password, 12);
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
		if (!await bcrypt.compare(user.password, hashedPassword))
			return null;
	else
		return null; // TODO handle oauth 2.0

	return {
		id: user.id,
		username: user.username,
		email: user.email
	};
}

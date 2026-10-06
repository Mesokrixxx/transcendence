import { createHash, randomBytes } from 'node:crypto';
import prisma from '../db/prisma.js';

export const SESSION_COOKIE = 'session';
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function hashToken(token: string) {
	return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: number) {
	const token = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

	await prisma.session.create({
		data: {
			tokenHash: hashToken(token),
			expiresAt,
			userId
		}
	});

	return { token, expiresAt };
}

export async function deleteSession(token: string) {
	await prisma.session.deleteMany({
		where: { tokenHash: hashToken(token) }
	});
}

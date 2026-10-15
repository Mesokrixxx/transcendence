import prisma from '../db/prisma.js'
import { BackendError } from '../types/backendError.types.js';

export async function get(id: number) {
	return await prisma.chat.findUnique({
		where: { id: id },
		include: {
			messages: true,
			users: true
		}
	});
}

export async function create() {
	const chat = await prisma.chat.create({
		data: {}
	});

	return chat;
}

export async function add(chatId: number, userIds: number[]) {
	if (!await get(chatId))
		return null;
	
	return await prisma.chat.update({
		where: { id: chatId },
		data: {
			users: {
				connect: userIds.map((userId) => ({
					id: userId,
				}))
			}
		}
	});
}

export async function append(message: string, chatId: number, userId: number) {
	const chat = await get(chatId);
	if (!chat)
		return null;

	if (!chat.users.some((chatUser) => chatUser.id === userId))
		throw new BackendError(403, 'user is not a member of this chat');

	await prisma.message.create({
		data: {
			content: message,
			userId,
			chatId,
		}
	});

	return await get(chatId);
}

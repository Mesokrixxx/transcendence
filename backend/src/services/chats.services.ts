import prisma from '../db/prisma.js'
import { BackendError } from '../types/backendError.types.js';
import * as chatPresenceService from './chatPresence.service.js';

export async function get(id: number) {
	return await prisma.chat.findUnique({
		where: { id: id },
		include: {
			messages: {
				orderBy: { creationDate: 'asc' }
			},
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

export async function isMember(chatId: number, userId: number) {
	const membership = await prisma.chat.findUnique({
		where: { id: chatId },
		select: {
			users: {
				where: { id: userId },
				select: { id: true }
			}
		}
	});

	return membership !== null && membership.users.length > 0;
}

export async function append(message: string, chatId: number, userId: number) {
	const chat = await get(chatId);
	if (!chat)
		return null;

	if (!chat.users.some((chatUser) => chatUser.id === userId))
		throw new BackendError(403, 'user is not a member of this chat');

	const createdMessage = await prisma.message.create({
		data: {
			content: message,
			userId,
			chatId,
		},
		include: {
			user: {
				select: {
					id: true,
					username: true
				}
			}
		}
	});

	chatPresenceService.broadcast(chatId, {
		type: 'chat.message',
		chatId,
		message: createdMessage
	});

	return await get(chatId);
}

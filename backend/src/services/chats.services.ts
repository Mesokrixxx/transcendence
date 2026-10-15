import prisma from '../db/prisma.js'

export async function get(id: number) {
	return await prisma.chat.findUnique({
		where: { id: id },
		include: {
			messages: true,
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
	if (!await prisma.chat.findUnique({ where: { id: chatId } }))
		return null;

	await prisma.message.create({
		data: {
			content: message,
			userId,
			chatId,
		}
	});

	return await get(chatId);
}

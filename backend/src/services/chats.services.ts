import prisma from '../db/prisma.js'

export async function get(id: number) {
	return await prisma.chat.findUnique({
		where: { id: id }
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

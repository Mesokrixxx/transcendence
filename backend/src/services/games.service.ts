import prisma from '../db/prisma.js'
import { BackendError } from '../types/backendError.types.js';

export async function create(whiteId: number, blackId: number) {
	return await prisma.$transaction(async (tx) => {
		const users = await tx.user.findMany({
			where: {
				id: {
					in: [whiteId, blackId]
				}
			}
		});

		if (users.length !== 2)
			throw new BackendError(400, 'invalid game players');

		const specChat = await tx.chat.create({ data: {} });
		const gameChat = await tx.chat.create({
			data: { 
				users: { 
					connect: [
						{ id: whiteId },
						{ id: blackId }
					]
				}
			}
		});

		return await tx.game.create({
			data: {
				whiteId: whiteId,
				blackId: blackId,
				chatId: gameChat.id,
				specChatId: specChat.id
			}
		});
	});
}

export async function get(id: number) {
	return await prisma.game.findUnique({ 
		where: { id: id } 
	});
}

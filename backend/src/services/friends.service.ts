import prisma from '../db/prisma.js';

type FriendRelation = {
	id: number;
	username: string;
	email: string;
};

export async function getList(userId: number) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			friendsAdded: {
				select: { id: true, username: true, email: true }
			},
			addedBy: {
				select: { id: true, username: true, email: true }
			}
		}
	});

	if (!user)
		return null;

	const outgoing = new Map<number, FriendRelation>(
		user.friendsAdded.map((friend) => [friend.id, friend])
	);
	const incoming = new Map<number, FriendRelation>(
		user.addedBy.map((friend) => [friend.id, friend])
	);
	const ids = new Set([...outgoing.keys(), ...incoming.keys()]);

	return [...ids].map((id) => {
		const friend = outgoing.get(id) ?? incoming.get(id)!;
		const isFriend = outgoing.has(id) && incoming.has(id);

		return {
			...friend,
			status: isFriend
				? 'friend'
				: outgoing.has(id)
					? 'pending_outgoing'
					: 'pending_incoming'
		} as const;
	});
}

export async function addFriend(userId: number, friendId: number) {
	if (userId === friendId)
		return null;

	const friend = await prisma.user.findUnique({
		where: { id: friendId },
		select: { id: true, username: true, email: true }
	});
	if (!friend)
		return null;

	await prisma.user.update({
		where: { id: userId },
		data: { friendsAdded: { connect: { id: friendId } } }
	});

	return friend;
}

export async function delFriend(userId: number, friendId: number) {
	const friend = await prisma.user.findUnique({
		where: { id: friendId },
		select: { id: true, username: true, email: true }
	});
	if (!friend)
		return null;

	await prisma.$transaction([
		prisma.user.update({
			where: { id: userId },
			data: { friendsAdded: { disconnect: { id: friendId } } }
		}),
		prisma.user.update({
			where: { id: friendId },
			data: { friendsAdded: { disconnect: { id: userId } } }
		})
	]);

	return friend;
}
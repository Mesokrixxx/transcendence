import prisma from '../db/prisma.js';

type FriendRelation = {
	id: number;
	username: string;
	email: string;
};

const relationSelect = {
	id: true,
	username: true,
	email: true,
} as const;

export async function getList(userId: number) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			friendsAdded: { select: relationSelect },
			addedBy: { select: relationSelect },
			blockedUsers: { select: { id: true } },
			blockedBy: { select: { id: true } },
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
	const blockedIds = new Set([
		...user.blockedUsers.map((friend) => friend.id),
		...user.blockedBy.map((friend) => friend.id),
	]);
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
	}).filter((friend) => !blockedIds.has(friend.id));
}

export async function getRequests(userId: number) {
	const list = await getList(userId);
	return list?.filter((relation) => relation.status !== 'friend') ?? null;
}

export async function getBlocked(userId: number) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { blockedUsers: { select: relationSelect } },
	});
	return user?.blockedUsers ?? null;
}

export async function addFriend(userId: number, friendId: number) {
	if (userId === friendId)
		return null;

	const friend = await prisma.user.findUnique({
		where: { id: friendId },
		select: {
			...relationSelect,
			blockedUsers: { where: { id: userId }, select: { id: true } },
			blockedBy: { where: { id: userId }, select: { id: true } },
		}
	});
	if (!friend)
		return null;
	if (friend.blockedUsers.length > 0 || friend.blockedBy.length > 0)
		return null;

	await prisma.user.update({
		where: { id: userId },
		data: { friendsAdded: { connect: { id: friendId } } }
	});

	return {
		id: friend.id,
		username: friend.username,
		email: friend.email,
	};
}

export async function acceptFriend(userId: number, friendId: number) {
	const request = await prisma.user.findFirst({
		where: {
			id: userId,
			addedBy: { some: { id: friendId } },
		},
		select: { id: true },
	});
	if (!request)
		return null;

	await prisma.user.update({
		where: { id: userId },
		data: { friendsAdded: { connect: { id: friendId } } },
	});

	return prisma.user.findUnique({
		where: { id: friendId },
		select: relationSelect,
	});
}

export async function delFriend(userId: number, friendId: number) {
	const friend = await prisma.user.findUnique({
		where: { id: friendId },
		select: relationSelect,
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

export async function block(userId: number, blockedId: number) {
	if (userId === blockedId)
		return null;

	const blocked = await prisma.user.findUnique({
		where: { id: blockedId },
		select: relationSelect,
	});
	if (!blocked)
		return null;

	await prisma.$transaction([
		prisma.user.update({
			where: { id: userId },
			data: {
				friendsAdded: { disconnect: { id: blockedId } },
				blockedUsers: { connect: { id: blockedId } },
			},
		}),
		prisma.user.update({
			where: { id: blockedId },
			data: { friendsAdded: { disconnect: { id: userId } } },
		}),
	]);

	return blocked;
}

export async function unblock(userId: number, blockedId: number) {
	const blocked = await prisma.user.findUnique({
		where: { id: blockedId },
		select: relationSelect,
	});
	if (!blocked)
		return null;

	await prisma.user.update({
		where: { id: userId },
		data: { blockedUsers: { disconnect: { id: blockedId } } },
	});

	return blocked;
}
import prisma from '../db/prisma.js';
import { BackendError } from '../types/backendError.types.js';
import * as chatPresenceService from './chatPresence.service.js';
import { checkMessageRateLimit } from './chatRateLimit.service.js';
import * as presenceService from './presence.service.js';

export async function get(id: number) {
  return await prisma.chat.findUnique({
    where: { id: id },
    include: {
      messages: {
        orderBy: { creationDate: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: { displayName: true },
              },
            },
          },
        },
      },
      users: {
        select: {
          id: true,
          username: true,
          profile: {
            select: { displayName: true },
          },
        },
      },
    },
  });
}

export async function create() {
  const chat = await prisma.chat.create({
    data: {},
  });

  return chat;
}

export async function createPrivate(userId: number, otherUserId: number) {
  if (userId === otherUserId) return null;

  const friendship = await prisma.user.findUnique({
    where: {
      id: userId,
      friendsAdded: { some: { id: otherUserId } },
      addedBy: { some: { id: otherUserId } },
    },
    select: { id: true },
  });
  if (!friendship) return null;

  const existingChats = await prisma.chat.findMany({
    where: {
      game: null,
      spectatorGame: null,
      users: { some: { id: userId } },
    },
    include: {
      users: { select: { id: true } },
    },
  });
  const existingChat = existingChats.find((chat) => {
    const ids = chat.users.map((user) => user.id).sort((a, b) => a - b);
    return (
      ids.length === 2 && ids.includes(userId) && ids.includes(otherUserId)
    );
  });
  if (existingChat) return get(existingChat.id);

  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true },
  });
  if (!otherUser) return null;

  const chat = await prisma.chat.create({
    data: {
      users: {
        connect: [{ id: userId }, { id: otherUserId }],
      },
    },
  });
  return get(chat.id);
}

export async function add(chatId: number, userIds: number[]) {
  if (!(await get(chatId))) return null;

  return await prisma.chat.update({
    where: { id: chatId },
    data: {
      users: {
        connect: userIds.map((userId) => ({
          id: userId,
        })),
      },
    },
  });
}

export async function isMember(chatId: number, userId: number) {
  const access = await prisma.chat.findUnique({
    where: { id: chatId },
    select: {
      users: {
        where: { id: userId },
        select: { id: true },
      },
      spectatorGame: {
        select: { id: true },
      },
    },
  });

  return (
    access !== null &&
    (access.users.length > 0 || access.spectatorGame !== null)
  );
}

export async function append(message: string, chatId: number, userId: number) {
  const chat = await get(chatId);
  if (!chat) return null;

  if (!(await isMember(chatId, userId)))
    throw new BackendError(403, 'user is not a member of this chat');

  const limit = checkMessageRateLimit(userId);
  if (!limit.allowed)
    throw new BackendError(
      429,
      `message rate limit exceeded; retry after ${limit.retryAfterSeconds} seconds`,
    );

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
          username: true,
          profile: {
            select: { displayName: true },
          },
        },
      },
    },
  });

  chatPresenceService.broadcast(chatId, {
    type: 'chat.message',
    chatId,
    message: createdMessage,
  });

  const privateChat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: {
      game: { select: { id: true } },
      spectatorGame: { select: { id: true } },
      users: { select: { id: true } },
    },
  });

  if (
    privateChat &&
    privateChat.game === null &&
    privateChat.spectatorGame === null &&
    privateChat.users.length === 2
  ) {
    for (const recipient of privateChat.users) {
      if (recipient.id === userId) continue;
      presenceService.send(recipient.id, {
        type: 'chat.message.received',
        chatId,
        message: createdMessage,
      });
    }
  }

  return createdMessage;
}

import { parseCookie } from 'cookie';
import type { IncomingMessage, Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import * as authService from './services/auth.service.js';
import * as chatPresenceService from './services/chatPresence.service.js';
import * as chatService from './services/chats.services.js';
import * as friendsService from './services/friends.service.js';
import * as presenceService from './services/presence.service.js';
import * as gamePresenceService from './services/gamePresence.service.js';
import * as gameService from './services/games.service.js';

const webSocketServer = new WebSocketServer({ noServer: true });

function tokenFromRequest(request: IncomingMessage) {
	const cookieHeader = request.headers.cookie;
	return cookieHeader
		? (parseCookie(cookieHeader)[authService.SESSION_COOKIE] ?? null)
		: null;
}

async function friendIds(userId: number) {
	const friends = await friendsService.getList(userId);
	return friends?.map((friend) => friend.id) ?? [];
}

function send(socket: WebSocket, message: unknown) {
	if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(message));
}

async function onConnection(socket: WebSocket, userId: number) {
	presenceService.connect(userId, socket);
	let ids: number[];
	try {
		ids = await friendIds(userId);
	} catch (error: unknown) {
		presenceService.disconnect(userId, socket);
		throw error;
	}

	send(socket, {
		type: 'presence.snapshot',
		users: ids.map((id) => ({
			userId: id,
			online: presenceService.isOnline(id),
		})),
	});

	for (const friendId of ids)
		presenceService.send(friendId, {
			type: 'presence.changed',
			userId,
			online: true,
		});

	socket.on('message', async (data: Buffer) => {
		let message: unknown;
		try {
			message = JSON.parse(data.toString());
		} catch {
			send(socket, { type: 'error', error: 'invalid JSON message' });
			return;
		}

		if (
			!message ||
			typeof message !== 'object' ||
			!('type' in message) ||
			typeof message.type !== 'string'
		) {
			send(socket, { type: 'error', error: 'invalid WebSocket message' });
			return;
		}

		if (
			message.type !== 'chat.join' &&
			message.type !== 'chat.leave' &&
			message.type !== 'game.join' &&
			message.type !== 'game.leave'
		) {
			send(socket, {
				type: 'error',
				error: 'unsupported WebSocket message type',
			});
			return;
		}

		const resourceId = message.type.startsWith('game.') ? 'gameId' : 'chatId';
		const payload = message as Record<string, unknown>;
		if (
			typeof payload[resourceId] !== 'number' ||
			!Number.isInteger(payload[resourceId]) ||
			payload[resourceId] <= 0
		) {
			send(socket, {
				type: 'error',
				error: `${resourceId} shall be a positive integer`,
			});
			return;
		}
		const id = payload[resourceId];

		try {
			if (message.type === 'game.join' || message.type === 'game.leave') {
				if (!(await gameService.canAccess(id, userId))) {
					send(socket, {
						type: 'error',
						error: 'user is not a player in this game',
					});
					return;
				}
				if (message.type === 'game.join') {
					gamePresenceService.subscribe(id, socket);
					send(socket, { type: 'game.joined', gameId: id });
				} else {
					gamePresenceService.unsubscribe(id, socket);
					send(socket, { type: 'game.left', gameId: id });
				}
				return;
			}
			if (!(await chatService.isMember(id, userId))) {
				send(socket, {
					type: 'error',
					error: 'user is not a member of this chat',
				});
				return;
			}

			if (message.type === 'chat.join') {
				chatPresenceService.subscribe(id, socket);
				send(socket, { type: 'chat.joined', chatId: id });
			} else {
				chatPresenceService.unsubscribe(id, socket);
				send(socket, { type: 'chat.left', chatId: id });
			}
		} catch (error: unknown) {
			console.error('WebSocket chat subscription error', error);
			send(socket, { type: 'error', error: 'chat subscription unavailable' });
		}
	});

	socket.on('close', async () => {
		chatPresenceService.unsubscribeAll(socket);
		gamePresenceService.unsubscribeAll(socket);
		if (!presenceService.disconnect(userId, socket)) return;

		try {
			for (const friendId of await friendIds(userId))
				presenceService.send(friendId, {
					type: 'presence.changed',
					userId,
					online: false,
				});
		} catch (error: unknown) {
			console.error('WebSocket presence disconnect error', error);
		}
	});
}

export function attachWebSocket(server: Server) {
	server.on('upgrade', async (request, socket, head) => {
		try {
			const url = new URL(request.url ?? '/', 'http://localhost');
			if (url.pathname !== '/ws') {
				socket.destroy();
				return;
			}

			const token = tokenFromRequest(request);
			const user = token ? await authService.getSession(token) : null;
			if (!user) {
				socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
				socket.destroy();
				return;
			}

			webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
				void onConnection(webSocket, user.id).catch((error: unknown) => {
					console.error('WebSocket presence error', error);
					webSocket.close(1011, 'presence service unavailable');
				});
			});
		} catch (error: unknown) {
			console.error('WebSocket upgrade error', error);
			socket.destroy();
		}
	});
}

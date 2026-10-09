import { parseCookie } from 'cookie';
import type { IncomingMessage, Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import * as authService from './services/auth.service.js';
import * as friendsService from './services/friends.service.js';
import * as presenceService from './services/presence.service.js';

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
	if (socket.readyState === socket.OPEN)
		socket.send(JSON.stringify(message));
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

	socket.on('close', async () => {
		if (!presenceService.disconnect(userId, socket)) return;

		try {
			for (const friendId of await friendIds(userId))
				presenceService.send(friendId, {
					type: 'presence.changed',
					userId,
					online: false,
				});
		}
		
		catch (error: unknown) {
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
		}
	
		catch (error: unknown) {
			console.error('WebSocket upgrade error', error);
			socket.destroy();
		}
	});
}

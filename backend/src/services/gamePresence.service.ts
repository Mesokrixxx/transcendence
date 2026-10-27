import type { WebSocket } from 'ws';

const connections = new Map<number, Set<WebSocket>>();

export function subscribe(gameId: number, socket: WebSocket) {
	const sockets = connections.get(gameId) ?? new Set<WebSocket>();
	sockets.add(socket);
	connections.set(gameId, sockets);
}

export function unsubscribe(gameId: number, socket: WebSocket) {
	const sockets = connections.get(gameId);
	if (!sockets) return;
	sockets.delete(socket);
	if (sockets.size === 0) connections.delete(gameId);
}

export function unsubscribeAll(socket: WebSocket) {
	for (const [gameId, sockets] of connections) {
		sockets.delete(socket);
		if (sockets.size === 0) connections.delete(gameId);
	}
}

export function broadcast(gameId: number, message: unknown) {
	const sockets = connections.get(gameId);
	if (!sockets) return;
	const payload = JSON.stringify(message);
	for (const socket of sockets) {
		if (socket.readyState === socket.OPEN) socket.send(payload);
	}
}

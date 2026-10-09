import type { WebSocket } from 'ws';

const connections = new Map<number, Set<WebSocket>>();

export function isOnline(userId: number) {
	return connections.has(userId);
}

export function connect(userId: number, socket: WebSocket) {
	const userConnections = connections.get(userId) ?? new Set<WebSocket>();
	userConnections.add(socket);
	connections.set(userId, userConnections);
}

export function disconnect(userId: number, socket: WebSocket) {
	const userConnections = connections.get(userId);
	if (!userConnections)
		return false;

	userConnections.delete(socket);
	if (userConnections.size > 0)
		return false;

	connections.delete(userId);
	return true;
}

export function send(userId: number, message: unknown) {
	const payload = JSON.stringify(message);
	for (const socket of connections.get(userId) ?? []) {
		if (socket.readyState === socket.OPEN)
			socket.send(payload);
	}
}

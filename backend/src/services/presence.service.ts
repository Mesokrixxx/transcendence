import type { WebSocket } from 'ws';

const connections = new Map<number, Set<WebSocket>>();
const rankingsSockets = new Set<WebSocket>();

export function joinRankings(socket: WebSocket) {
  if (socket.readyState !== socket.OPEN) return;

  rankingsSockets.add(socket);
  socket.send(
    JSON.stringify({
      type: 'rankings.presence.snapshot',
      onlineUserIds: [...connections.keys()],
    }),
  );
}

export function leaveRankings(socket: WebSocket) {
  rankingsSockets.delete(socket);
}

function notifyRankings(userId: number, online: boolean) {
  const payload = JSON.stringify({
    type: 'rankings.presence.changed',
    userId,
    online,
  });
  for (const socket of rankingsSockets) {
    if (socket.readyState === socket.OPEN) socket.send(payload);
  }
}

export function isOnline(userId: number) {
  return connections.has(userId);
}

export function connect(userId: number, socket: WebSocket) {
  const wasOnline = isOnline(userId);
  const userConnections = connections.get(userId) ?? new Set<WebSocket>();
  userConnections.add(socket);
  connections.set(userId, userConnections);
  if (!wasOnline) notifyRankings(userId, true);
}

export function disconnect(userId: number, socket: WebSocket) {
  leaveRankings(socket);
  const userConnections = connections.get(userId);
  if (!userConnections) return false;

  userConnections.delete(socket);
  if (userConnections.size > 0) return false;

  connections.delete(userId);
  notifyRankings(userId, false);
  return true;
}

export function send(userId: number, message: unknown) {
  const payload = JSON.stringify(message);
  for (const socket of connections.get(userId) ?? []) {
    if (socket.readyState === socket.OPEN) socket.send(payload);
  }
}

export function broadcast(message: unknown) {
  const payload = JSON.stringify(message);
  for (const sockets of connections.values()) {
    for (const socket of sockets) {
      if (socket.readyState === socket.OPEN) socket.send(payload);
    }
  }
}

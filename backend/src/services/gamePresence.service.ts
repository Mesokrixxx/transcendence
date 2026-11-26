import type { WebSocket } from 'ws';

const connections = new Map<number, Map<WebSocket, number | null>>();

export function subscribe(
  gameId: number,
  socket: WebSocket,
  playerId: number | null,
) {
  const sockets =
    connections.get(gameId) ?? new Map<WebSocket, number | null>();
  sockets.set(socket, playerId);
  connections.set(gameId, sockets);
  broadcastPresence(gameId);
}

export function unsubscribe(gameId: number, socket: WebSocket) {
  const sockets = connections.get(gameId);
  if (!sockets) return;

  const playerId = sockets.get(socket) ?? null;
  if (!sockets.delete(socket)) return;
  if (sockets.size === 0) {
    connections.delete(gameId);
  } else {
    broadcastPresence(gameId);
    if (playerId !== null) {
      broadcast(gameId, {
        type: 'game.player.left',
        gameId,
        userId: playerId,
      });
    }
  }
}

export function unsubscribeAll(socket: WebSocket) {
  for (const gameId of connections.keys()) {
    unsubscribe(gameId, socket);
  }
}

function broadcastPresence(gameId: number) {
  const sockets = connections.get(gameId);
  if (!sockets) return;

  const players = new Set<number>();
  for (const [socket, playerId] of sockets) {
    if (playerId !== null && socket.readyState === socket.OPEN) {
      players.add(playerId);
    }
  }

  broadcast(gameId, {
    type: 'game.presence',
    gameId,
    bothPlayersPresent: players.size === 2,
  });
}

export function broadcast(gameId: number, message: unknown) {
  const sockets = connections.get(gameId);
  if (!sockets) return;

  const payload = JSON.stringify(message);
  for (const socket of sockets.keys()) {
    if (socket.readyState === socket.OPEN) socket.send(payload);
  }
}

import type { WebSocket } from 'ws';

const connections = new Map<number, Set<WebSocket>>();
const subscriptions = new Map<WebSocket, Set<number>>();

export function subscribe(chatId: number, socket: WebSocket) {
  const chatConnections = connections.get(chatId) ?? new Set<WebSocket>();
  chatConnections.add(socket);
  connections.set(chatId, chatConnections);

  const socketSubscriptions = subscriptions.get(socket) ?? new Set<number>();
  socketSubscriptions.add(chatId);
  subscriptions.set(socket, socketSubscriptions);
}

export function unsubscribe(chatId: number, socket: WebSocket) {
  const chatConnections = connections.get(chatId);
  if (chatConnections) {
    chatConnections.delete(socket);
    if (chatConnections.size === 0) connections.delete(chatId);
  }

  const socketSubscriptions = subscriptions.get(socket);
  if (socketSubscriptions) {
    socketSubscriptions.delete(chatId);
    if (socketSubscriptions.size === 0) subscriptions.delete(socket);
  }
}

export function unsubscribeAll(socket: WebSocket) {
  for (const chatId of subscriptions.get(socket) ?? [])
    unsubscribe(chatId, socket);
}

export function broadcast(chatId: number, message: unknown) {
  const payload = JSON.stringify(message);
  for (const socket of connections.get(chatId) ?? []) {
    if (socket.readyState === socket.OPEN) socket.send(payload);
  }
}

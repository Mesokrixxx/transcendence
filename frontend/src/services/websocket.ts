export type RealtimeEvent = {
  type: string;
  [key: string]: unknown;
};

type Listener = (event: RealtimeEvent) => void;

class RealtimeSocket {
  private socket: WebSocket | null = null;
  private readonly listeners = new Set<Listener>();
  private readonly chatIds = new Set<number>();
  private readonly gameIds = new Set<number>();
  private readonly rankingsListeners = new Set<Listener>();
  private reconnectTimer: number | null = null;
  private enabled = false;

  setEnabled(enabled: boolean) {
    if (this.enabled === enabled) return;
    this.enabled = enabled;
    if (enabled) {
      this.connect();
    } else {
      this.disconnect();
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    this.connect();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.disconnect();
    };
  }

  joinChat(chatId: number, listener: Listener) {
    const unsubscribe = this.subscribe(listener);
    this.chatIds.add(chatId);
    this.send({ type: 'chat.join', chatId });

    return () => {
      this.chatIds.delete(chatId);
      this.send({ type: 'chat.leave', chatId });
      unsubscribe();
    };
  }

  joinGame(gameId: number, listener: Listener) {
    const unsubscribe = this.subscribe(listener);
    this.gameIds.add(gameId);
    this.send({ type: 'game.join', gameId });

    return () => {
      this.gameIds.delete(gameId);
      this.send({ type: 'game.leave', gameId });
      unsubscribe();
    };
  }

  joinRankings(listener: Listener) {
    this.rankingsListeners.add(listener);
    const unsubscribe = this.subscribe(listener);
    if (this.rankingsListeners.size === 1) this.send({ type: 'rankings.join' });

    return () => {
      if (!this.rankingsListeners.delete(listener)) return;
      if (this.rankingsListeners.size === 0) this.send({ type: 'rankings.leave' });
      unsubscribe();
    };
  }

  send(message: object) {
    if (this.socket?.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify(message));
    return true;
  }

  private connect() {
    if (
      !this.enabled ||
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING ||
      this.listeners.size === 0
    ) {
      return;
    }

    const url = new URL('/ws', window.location.href);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.addEventListener('open', () => {
      for (const chatId of this.chatIds)
        this.send({ type: 'chat.join', chatId });
      for (const gameId of this.gameIds)
        this.send({ type: 'game.join', gameId });
      if (this.rankingsListeners.size > 0)
        this.send({ type: 'rankings.join' });
    });

    socket.addEventListener('message', (message) => {
      try {
        const event: unknown = JSON.parse(String(message.data));
        if (!event || typeof event !== 'object' || !('type' in event)) return;
        if (typeof event.type !== 'string') return;
        for (const listener of this.listeners) listener(event as RealtimeEvent);
      } catch {
        // Ignore malformed server events; HTTP/API errors remain explicit.
      }
    });

    socket.addEventListener('close', () => {
      if (this.socket !== socket) return;
      this.socket = null;
      if (this.listeners.size === 0) return;

      this.reconnectTimer = window.setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, 1000);
    });
  }

  private disconnect() {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
    this.chatIds.clear();
    this.gameIds.clear();
  }
}

const realtimeSocket = new RealtimeSocket();

export default realtimeSocket;

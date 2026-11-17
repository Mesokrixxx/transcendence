export type RealtimeEvent = {
  type: string;
  [key: string]: unknown;
};

type Listener = (event: RealtimeEvent) => void;

class RealtimeSocket {
  private socket: WebSocket | null = null;
  private readonly listeners = new Set<Listener>();
  private reconnectTimer: number | null = null;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    this.connect();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.disconnect();
    };
  }

  private connect() {
    if (
      this.listeners.size === 0 ||
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) return;

    const url = new URL('/ws', window.location.href);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.addEventListener('message', (message) => {
      try {
        const event: unknown = JSON.parse(String(message.data));
        if (!event || typeof event !== 'object' || !('type' in event) ||
          typeof event.type !== 'string') return;
        for (const listener of this.listeners)
          listener(event as RealtimeEvent);
      } catch {
        // Ignore malformed server events.
      }
    });

    socket.addEventListener('close', () => {
      if (this.socket !== socket || this.listeners.size === 0) return;
      this.socket = null;
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
  }
}

export default new RealtimeSocket();

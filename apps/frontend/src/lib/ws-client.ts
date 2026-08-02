import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class WsClient {
  private socket: Socket | null = null;

  public connect(tenantId?: string): Socket {
    if (!this.socket) {
      this.socket = io(`${API_BASE_URL}/ws`, {
        query: tenantId ? { tenantId } : undefined,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('📡 Connected to AxioVital WebSocket gateway:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from AxioVital WebSocket gateway');
      });
    }
    return this.socket;
  }

  public subscribe(event: string, callback: (payload: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public unsubscribe(event: string, callback?: (payload: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const wsClient = new WsClient();

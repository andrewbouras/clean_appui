export type WebSocketMessage = {
  type: 'mcq_progress' | 'mcq_complete' | 'mcq_error' | 'file_progress';
  payload: {
    requestId: string;
    progress?: number;
    status?: string;
    error?: string;
    questions?: any[];
    text?: string;
  };
};

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {
    this.connect();
  }

  static getInstance(): WebSocketService {
    if (!this.instance) {
      this.instance = new WebSocketService();
    }
    return this.instance;
  }

  private connect() {
    try {
      this.socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        const handler = this.messageHandlers.get(message.payload.requestId);
        if (handler) {
          handler(message);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }

  subscribeToProgress(requestId: string, handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.set(requestId, handler);
    return () => {
      this.messageHandlers.delete(requestId);
    };
  }

  send(message: WebSocketMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }
}

export const wsService = WebSocketService.getInstance(); 
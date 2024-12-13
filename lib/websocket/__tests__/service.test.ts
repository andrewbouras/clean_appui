import { WebSocketService, WebSocketMessage } from '../service';

describe('WebSocketService', () => {
  let mockWebSocket: any;
  let service: WebSocketService;

  beforeEach(() => {
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      readyState: WebSocket.OPEN
    };

    // Mock WebSocket constructor
    (global as any).WebSocket = jest.fn(() => mockWebSocket);
    
    service = WebSocketService.getInstance();
  });

  it('should handle subscription and message delivery', () => {
    const handler = jest.fn();
    const requestId = 'test-id';
    
    const unsubscribe = service.subscribeToProgress(requestId, handler);

    const message: WebSocketMessage = {
      type: 'mcq_progress',
      payload: {
        requestId,
        progress: 50
      }
    };

    // Simulate receiving a message
    mockWebSocket.onmessage({ data: JSON.stringify(message) });

    expect(handler).toHaveBeenCalledWith(message);

    unsubscribe();

    // Simulate another message after unsubscribe
    mockWebSocket.onmessage({ data: JSON.stringify(message) });

    // Handler should not be called again
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should attempt to reconnect on connection failure', () => {
    mockWebSocket.onclose();
    
    jest.advanceTimersByTime(1000);
    
    expect(global.WebSocket).toHaveBeenCalledTimes(2);
  });
}); 
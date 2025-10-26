import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WebSocketMessage, TypingRequest, SendMessageRequest, MarkAsReadRequest } from '../types/messaging';
import { debugLogger } from '../utils/debugLogger';
import { authService } from './authService';

export interface WebSocketCallbacks {
  onMessage?: (message: WebSocketMessage) => void;
  onTyping?: (typingData: TypingRequest) => void;
  onError?: (error: any) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private callbacks: WebSocketCallbacks = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializeClient();
  }

  private getConnectionHeaders(): { [key: string]: string } {
    const token = authService.getAccessToken();
    const headers: { [key: string]: string } = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      debugLogger.log('WebSocket', 'Added Authorization header to WebSocket connection');
    } else {
      debugLogger.log('WebSocket', 'No access token available for WebSocket connection');
    }
    
    return headers;
  }

  private initializeClient() {
    const socketUrl = 'http://localhost:8080/ws'; 
    console.log('🔌 Initializing WebSocket client with URL:', socketUrl);

    const socket = new SockJS(socketUrl);

    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: this.getConnectionHeaders(),
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔌 WebSocket Debug:', str);
          debugLogger.log('WebSocket', str);
        }
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('✅ WebSocket connected successfully:', frame);
      debugLogger.log('WebSocket', 'Connected to WebSocket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.callbacks.onConnected?.();
    };

    this.client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame);
      debugLogger.log('WebSocket', 'STOMP error: ' + frame.headers['message']);
      debugLogger.log('WebSocket', 'Details: ' + frame.body);

      if (frame.headers['message']?.includes('authentication') || 
          frame.headers['message']?.includes('unauthorized') ||
          frame.body?.includes('authentication')) {
        debugLogger.log('WebSocket', 'Authentication error detected, disconnecting');
        this.disconnect();
      }

      this.callbacks.onError?.(frame);
    };

    this.client.onWebSocketError = (error) => {
      console.error('❌ WebSocket error:', error);
      debugLogger.log('WebSocket', 'WebSocket error: ' + error);
      this.callbacks.onError?.(error);
    };

    this.client.onWebSocketClose = (event) => {
      console.log('🔌 WebSocket connection closed:', event.code);
      debugLogger.log('WebSocket', 'WebSocket connection closed: ' + event.code);
      this.isConnected = false;
      this.callbacks.onDisconnected?.();
      this.handleReconnect();
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      debugLogger.log('WebSocket', `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.client && !this.isConnected) {
          this.client.connectHeaders = this.getConnectionHeaders();
          this.client.activate();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      debugLogger.log('WebSocket', 'Max reconnection attempts reached');
    }
  }

  connect(callbacks: WebSocketCallbacks = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('WebSocket client not initialized'));
        return;
      }

      this.callbacks = { ...this.callbacks, ...callbacks };

      const originalOnConnect = this.client.onConnect;
      this.client.onConnect = (frame) => {
        debugLogger.log('WebSocket', 'Connection established successfully');
        originalOnConnect?.(frame);
        resolve();
      };

      const originalOnStompError = this.client.onStompError;
      this.client.onStompError = (frame) => {
        debugLogger.log('WebSocket', 'STOMP connection error:', frame);
        originalOnStompError?.(frame);
        reject(new Error(frame.headers['message'] || 'STOMP connection failed'));
      };

      this.client.connectHeaders = this.getConnectionHeaders();
      debugLogger.log('WebSocket', 'Attempting to connect with updated headers...');
      this.client.activate();
    });
  }

  disconnect() {
    if (this.client && this.isConnected) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.isConnected = false;
      debugLogger.log('WebSocket', 'Disconnected from WebSocket server');
    }
  }

  subscribeToConversation(conversationId: number, callbacks: WebSocketCallbacks = {}) {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const topicPath = `/topic/conversations/${conversationId}`;
    const typingPath = `/topic/conversations/${conversationId}/typing`;
    const userQueuePath = `/user/queue/messages`;
    const errorQueuePath = `/user/queue/errors`;

    const messageSubscription = this.client.subscribe(topicPath, (message: IMessage) => {
      try {
        const wsMessage: WebSocketMessage = JSON.parse(message.body);
        debugLogger.log('WebSocket', `Received message for conversation ${conversationId}:`, wsMessage);
        callbacks.onMessage?.(wsMessage);
      } catch (error) {
        debugLogger.log('WebSocket', 'Error parsing message:', error);
        callbacks.onError?.(error);
      }
    });

    const typingSubscription = this.client.subscribe(typingPath, (message: IMessage) => {
      try {
        const typingData: TypingRequest = JSON.parse(message.body).data;
        debugLogger.log('WebSocket', `Received typing indicator for conversation ${conversationId}:`, typingData);
        callbacks.onTyping?.(typingData);
      } catch (error) {
        debugLogger.log('WebSocket', 'Error parsing typing data:', error);
        callbacks.onError?.(error);
      }
    });

    const userSubscription = this.client.subscribe(userQueuePath, (message: IMessage) => {
      try {
        const wsMessage: WebSocketMessage = JSON.parse(message.body);
        debugLogger.log('WebSocket', 'Received user message:', wsMessage);
        callbacks.onMessage?.(wsMessage);
      } catch (error) {
        debugLogger.log('WebSocket', 'Error parsing user message:', error);
        callbacks.onError?.(error);
      }
    });

    const errorSubscription = this.client.subscribe(errorQueuePath, (message: IMessage) => {
      try {
        const errorMessage: WebSocketMessage = JSON.parse(message.body);
        debugLogger.log('WebSocket', 'Received error:', errorMessage);
        callbacks.onError?.(errorMessage);
      } catch (error) {
        debugLogger.log('WebSocket', 'Error parsing error message:', error);
        callbacks.onError?.(error);
      }
    });

    this.subscriptions.set(`conversation_${conversationId}`, messageSubscription);
    this.subscriptions.set(`typing_${conversationId}`, typingSubscription);
    this.subscriptions.set(`user_${conversationId}`, userSubscription);
    this.subscriptions.set(`error_${conversationId}`, errorSubscription);

    debugLogger.log('WebSocket', `Subscribed to conversation ${conversationId}`);
  }

  unsubscribeFromConversation(conversationId: number) {
    const subscriptionKeys = [
      `conversation_${conversationId}`,
      `typing_${conversationId}`,
      `user_${conversationId}`,
      `error_${conversationId}`
    ];

    subscriptionKeys.forEach(key => {
      const subscription = this.subscriptions.get(key);
      if (subscription) {
        subscription.unsubscribe();
        this.subscriptions.delete(key);
      }
    });

    debugLogger.log('WebSocket', `Unsubscribed from conversation ${conversationId}`);
  }

  sendMessage(conversationId: number, message: SendMessageRequest) {
    if (!this.client || !this.isConnected) {
      debugLogger.log('WebSocket', 'Cannot send message - not connected', {
        hasClient: !!this.client,
        isConnected: this.isConnected
      });
      throw new Error('WebSocket not connected');
    }

    const destination = `/app/conversations/${conversationId}/send`;
    debugLogger.log('WebSocket', `Sending message to ${destination}:`, message);
    
    try {
      this.client.publish({
        destination,
        body: JSON.stringify(message)
      });
      debugLogger.log('WebSocket', 'Message published successfully');
    } catch (error) {
      debugLogger.log('WebSocket', 'Failed to publish message:', error);
      throw error;
    }
  }

  sendTypingIndicator(conversationId: number, typingData: TypingRequest) {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const destination = `/app/conversations/${conversationId}/typing`;
    debugLogger.log('WebSocket', `Sending typing indicator to ${destination}:`, typingData);
    
    this.client.publish({
      destination,
      body: JSON.stringify(typingData)
    });
  }

  markAsRead(conversationId: number, readData: MarkAsReadRequest) {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const destination = `/app/conversations/${conversationId}/read`;
    debugLogger.log('WebSocket', `Marking as read to ${destination}:`, readData);
    
    this.client.publish({
      destination,
      body: JSON.stringify(readData)
    });
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  refreshConnection(): void {
    if (this.isConnected) {
      debugLogger.log('WebSocket', 'Refreshing WebSocket connection with new token');
      this.disconnect();
      
      setTimeout(() => {
        this.connect(this.callbacks).catch(error => {
          debugLogger.log('WebSocket', 'Failed to reconnect after token refresh:', error);
        });
      }, 1000);
    }
  }
}

export const websocketService = new WebSocketService();

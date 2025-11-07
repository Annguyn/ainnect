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
  private outboundQueue: Array<{ destination: string; body: string; headers?: Record<string, string> }>= [];

  constructor() {
    this.initializeClient();
  }

  private buildSocketUrl(): string {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const baseUrl = `${apiUrl}/ws`;
    const token = authService.getAccessToken();
    if (token) {
      const urlWithToken = `${baseUrl}?token=${encodeURIComponent(token)}`;
      const masked = token.length > 12 ? `${token.substring(0, 6)}...${token.substring(token.length - 6)}` : '***';
      debugLogger.log('WebSocket', `Building SockJS URL with token param (masked): ${baseUrl}?token=${masked}`);
      return urlWithToken;
    }
    return baseUrl;
  }

  private getConnectionHeaders(): { [key: string]: string } {
    const token = authService.getAccessToken();
    const headers: { [key: string]: string } = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      const masked = token.length > 12 ? `${token.substring(0, 6)}...${token.substring(token.length - 6)}` : '***';
      debugLogger.log('WebSocket', `Added Authorization header to WebSocket connection (masked): Bearer ${masked}`);
    } else {
      debugLogger.log('WebSocket', 'No access token available for WebSocket connection');
    }
    
    return headers;
  }

  private initializeClient() {
    const socketUrl = this.buildSocketUrl();
    console.log('🔌 Initializing WebSocket client with URL:', socketUrl);

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.buildSocketUrl()),
      connectHeaders: this.getConnectionHeaders(),
      beforeConnect: () => {
        if (this.client) {
          const headers = this.getConnectionHeaders();
          debugLogger.log('WebSocket', 'beforeConnect - STOMP connectHeaders to be sent:', {
            Authorization: headers['Authorization'] ? `${(headers['Authorization'] as string).substring(0, 13)}...masked` : undefined
          });
          this.client.connectHeaders = headers;
        }
      },
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

      if (this.outboundQueue.length > 0) {
        const queued = [...this.outboundQueue];
        this.outboundQueue = [];
        queued.forEach((req) => {
          try {
            this.client?.publish(req);
          } catch (e) {
            debugLogger.log('WebSocket', 'Failed to flush queued frame:', e);
          }
        });
        debugLogger.log('WebSocket', `Flushed ${queued.length} queued frames after connect`);
      }
    };

    this.client.onDisconnect = (frame) => {
      console.log('🔌 STOMP disconnected:', frame);
      this.isConnected = false;
      this.callbacks.onDisconnected?.();
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
      const stillActive = !!this.client?.active;
      console.log('🔌 WebSocket transport closed:', { code: event.code, stillActive });
      debugLogger.log('WebSocket', 'WebSocket transport closed: ' + event.code + `, stillActive=${stillActive}`);
      // SockJS may close an underlying transport during upgrade; avoid flipping state if client remains active
      if (stillActive) {
        return;
      }
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

      if (this.isConnected) {
        debugLogger.log('WebSocket', 'Already connected - skipping activate and notifying listeners');
        this.callbacks.onConnected?.();
        resolve();
        return;
      }

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

      const headers = this.getConnectionHeaders();
      this.client.connectHeaders = headers;
      debugLogger.log('WebSocket', 'Attempting to connect with updated headers:', {
        Authorization: headers['Authorization'] ? `${(headers['Authorization'] as string).substring(0, 13)}...masked` : undefined
      });
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
      const token = authService.getAccessToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const frame = {
        destination,
        body: JSON.stringify(message),
        headers
      };
      if (!this.isConnected) {
        this.outboundQueue.push(frame);
        debugLogger.log('WebSocket', 'Queued SEND frame until connected');
      } else {
        this.client.publish(frame);
        debugLogger.log('WebSocket', 'Message published successfully');
      }
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
    
    const token = authService.getAccessToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const frame = {
      destination,
      body: JSON.stringify(typingData),
      headers
    };
    if (!this.isConnected) {
      this.outboundQueue.push(frame);
      debugLogger.log('WebSocket', 'Queued TYPING frame until connected');
    } else {
      this.client.publish(frame);
    }
  }

  markAsRead(conversationId: number, readData: MarkAsReadRequest) {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    const destination = `/app/conversations/${conversationId}/read`;
    console.log(`Marking messages as read for conversation ${conversationId}`);

    try {
      const token = authService.getAccessToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const frame = {
        destination,
        body: JSON.stringify(readData),
        headers,
      };

      this.client.publish(frame);
      console.log('MarkAsRead frame published successfully');
    } catch (error) {
      console.error('Failed to publish markAsRead frame:', error);
    }
  }

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/messages/unread-count`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authService.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
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

  subscribe(callback: (message: WebSocketMessage) => void) {
    const subscriptionId = 'notification-subscription';
    if (this.client && this.isConnected) {
      const subscription = this.client.subscribe('/topic/notifications', (message: IMessage) => {
        const parsedMessage: WebSocketMessage = JSON.parse(message.body);
        callback(parsedMessage);
      });
      this.subscriptions.set(subscriptionId, subscription);
    }
  }

  unsubscribe(callback: (message: WebSocketMessage) => void) {
    const subscriptionId = 'notification-subscription';
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  // Subscribe to user-specific notifications
  subscribeToNotifications(callback: (message: WebSocketMessage) => void) {
    const notificationPath = `/user/queue/notifications`;
    
    const doSubscribe = () => {
      if (!this.client || !this.isConnected) {
        debugLogger.log('WebSocket', 'WebSocket not connected, cannot subscribe to notifications');
        return;
      }

      // Check if already subscribed
      if (this.subscriptions.has('user_notifications')) {
        debugLogger.log('WebSocket', 'Already subscribed to user notifications');
        return;
      }

      try {
        const subscription = this.client.subscribe(notificationPath, (message: IMessage) => {
          try {
            const wsMessage: WebSocketMessage = JSON.parse(message.body);
            debugLogger.log('WebSocket', 'Received notification:', wsMessage);
            callback(wsMessage);
          } catch (error) {
            debugLogger.log('WebSocket', 'Error parsing notification:', error);
          }
        });

        this.subscriptions.set('user_notifications', subscription);
        debugLogger.log('WebSocket', 'Subscribed to user notifications');
      } catch (error) {
        debugLogger.log('WebSocket', 'Error subscribing to notifications:', error);
      }
    };

    // If already connected, subscribe immediately
    if (this.isConnected) {
      doSubscribe();
    } else {
      // Otherwise, connect first then subscribe
      debugLogger.log('WebSocket', 'WebSocket not connected, connecting first...');
      this.connect();
      
      // Wait for connection then subscribe
      const checkConnection = setInterval(() => {
        if (this.isConnected) {
          clearInterval(checkConnection);
          doSubscribe();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkConnection);
        if (!this.isConnected) {
          debugLogger.log('WebSocket', 'Failed to connect WebSocket within timeout');
        }
      }, 10000);
    }
  }

  unsubscribeFromNotifications() {
    const subscription = this.subscriptions.get('user_notifications');
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete('user_notifications');
      debugLogger.log('WebSocket', 'Unsubscribed from user notifications');
    }
  }
}

export const websocketService = new WebSocketService();

import { useEffect, useRef, useState, useCallback } from 'react';
import { websocketService, WebSocketCallbacks } from '../services/websocketService';
import { WebSocketMessage, TypingRequest, SendMessageRequest, MarkAsReadRequest } from '../types/messaging';
import { useAuth } from './useAuth';
import { debugLogger } from '../utils/debugLogger';

export interface UseWebSocketOptions {
  conversationId?: number;
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onTyping?: (typingData: TypingRequest) => void;
  onError?: (error: any) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(websocketService.getConnectionStatus());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Map<number, TypingRequest>>(new Map());
  
  const callbacksRef = useRef<WebSocketCallbacks>({});
  const typingTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const {
    conversationId,
    autoConnect = true,
    onMessage,
    onTyping,
    onError
  } = options;

  // Update callbacks when they change
  useEffect(() => {
    callbacksRef.current = {
      onMessage: (message: WebSocketMessage) => {
        debugLogger.log('useWebSocket', 'Message received:', message);
        onMessage?.(message);
      },
      onTyping: (typingData: TypingRequest) => {
        debugLogger.log('useWebSocket', 'Typing indicator received:', typingData);
        
        // Update typing users
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (typingData.isTyping) {
            newMap.set(typingData.userId, typingData);
          } else {
            newMap.delete(typingData.userId);
          }
          return newMap;
        });

        // Clear existing timeout for this user
        const existingTimeout = typingTimeoutRef.current.get(typingData.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Set timeout to remove typing indicator after 3 seconds
        if (typingData.isTyping) {
          const timeout = setTimeout(() => {
            setTypingUsers(prev => {
              const newMap = new Map(prev);
              newMap.delete(typingData.userId);
              return newMap;
            });
            typingTimeoutRef.current.delete(typingData.userId);
          }, 3000);

          typingTimeoutRef.current.set(typingData.userId, timeout);
        }

        onTyping?.(typingData);
      },
      onError: (error: any) => {
        debugLogger.log('useWebSocket', 'Error received:', error);
        setConnectionError(error.message || 'WebSocket error occurred');
        onError?.(error);
      },
      onConnected: () => {
        debugLogger.log('useWebSocket', 'WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
      },
      onDisconnected: () => {
        debugLogger.log('useWebSocket', 'WebSocket disconnected');
        setIsConnected(false);
        setReconnectAttempts(websocketService.getReconnectAttempts());
      }
    };
  }, [onMessage, onTyping, onError]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    console.log('🔌 useWebSocket connect called:', { user: user?.id });
    
    if (!user) {
      console.log('❌ No user found, cannot connect');
      debugLogger.log('useWebSocket', 'No user found, cannot connect');
      return;
    }

    try {
      console.log('🔌 Attempting to connect to WebSocket...');
      setConnectionError(null);
      await websocketService.connect(callbacksRef.current);
      setIsConnected(true);
      console.log('✅ WebSocket connected successfully');
      debugLogger.log('useWebSocket', 'Successfully connected to WebSocket');
    } catch (error: any) {
      console.error('❌ WebSocket connection failed:', error);
      debugLogger.log('useWebSocket', 'Failed to connect to WebSocket:', error);
      setConnectionError(error.message || 'Failed to connect to WebSocket');
      setIsConnected(false);
    }
  }, [user]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    setConnectionError(null);
    setReconnectAttempts(0);
    debugLogger.log('useWebSocket', 'Disconnected from WebSocket');
  }, []);

  // Subscribe to conversation
  const subscribeToConversation = useCallback((convId: number) => {
    if (!isConnected) {
      debugLogger.log('useWebSocket', 'Not connected, cannot subscribe to conversation');
      return;
    }

    try {
      websocketService.subscribeToConversation(convId, callbacksRef.current);
      debugLogger.log('useWebSocket', `Subscribed to conversation ${convId}`);
    } catch (error: any) {
      debugLogger.log('useWebSocket', `Failed to subscribe to conversation ${convId}:`, error);
      setConnectionError(error.message || 'Failed to subscribe to conversation');
    }
  }, [isConnected]);

  // Unsubscribe from conversation
  const unsubscribeFromConversation = useCallback((convId: number) => {
    try {
      websocketService.unsubscribeFromConversation(convId);
      debugLogger.log('useWebSocket', `Unsubscribed from conversation ${convId}`);
    } catch (error: any) {
      debugLogger.log('useWebSocket', `Failed to unsubscribe from conversation ${convId}:`, error);
    }
  }, []);

  // Send message
  const sendMessage = useCallback((message: SendMessageRequest) => {
    if (!isConnected) {
      throw new Error('WebSocket not connected');
    }

    const targetConversationId = message.conversationId || conversationId;
    if (!targetConversationId) {
      throw new Error('No conversation ID provided');
    }

    try {
      websocketService.sendMessage(targetConversationId, message);
      debugLogger.log('useWebSocket', 'Message sent:', message);
    } catch (error: any) {
      debugLogger.log('useWebSocket', 'Failed to send message:', error);
      setConnectionError(error.message || 'Failed to send message');
      throw error;
    }
  }, [isConnected, conversationId]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!isConnected || !conversationId || !user) {
      return;
    }

    const typingData: TypingRequest = {
      conversationId,
      userId: user.id,
      username: user.username,
      isTyping
    };

    try {
      websocketService.sendTypingIndicator(conversationId, typingData);
      debugLogger.log('useWebSocket', 'Typing indicator sent:', typingData);
    } catch (error: any) {
      debugLogger.log('useWebSocket', 'Failed to send typing indicator:', error);
    }
  }, [isConnected, conversationId, user]);

  // Mark message as read
  const markAsRead = useCallback((messageId?: number) => {
    if (!isConnected || !conversationId || !user) {
      return;
    }

    const readData: MarkAsReadRequest = {
      conversationId,
      messageId,
      userId: user.id
    };

    try {
      websocketService.markAsRead(conversationId, readData);
      debugLogger.log('useWebSocket', 'Mark as read sent:', readData);
    } catch (error: any) {
      debugLogger.log('useWebSocket', 'Failed to mark as read:', error);
    }
  }, [isConnected, conversationId, user]);

  // Auto-connect when user is available
  useEffect(() => {
    console.log('🔌 useWebSocket auto-connect check:', {
      autoConnect,
      user: user?.id,
      isConnected,
      shouldConnect: autoConnect && user && !isConnected
    });
    
    if (autoConnect && user && !isConnected) {
      console.log('🔌 Attempting auto-connect...');
      connect();
    }
  }, [autoConnect, user, isConnected, connect]);

  // Subscribe to conversation when it changes
  useEffect(() => {
    if (conversationId && isConnected) {
      subscribeToConversation(conversationId);
      
      return () => {
        unsubscribeFromConversation(conversationId);
      };
    }
  }, [conversationId, isConnected, subscribeToConversation, unsubscribeFromConversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all typing timeouts
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
      
      // Unsubscribe from current conversation
      if (conversationId) {
        unsubscribeFromConversation(conversationId);
      }
    };
  }, [conversationId, unsubscribeFromConversation]);

  // Get typing users list
  const getTypingUsers = useCallback(() => {
    return Array.from(typingUsers.values());
  }, [typingUsers]);

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    typingUsers: getTypingUsers(),
    connect,
    disconnect,
    subscribeToConversation,
    unsubscribeFromConversation,
    sendMessage,
    sendTypingIndicator,
    markAsRead
  };
};
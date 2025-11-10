import React, { useState, useCallback } from 'react';
import { MessageNotificationPopup } from './MessageNotificationPopup';
import { useWebSocket } from '../hooks/useWebSocket';
import { WebSocketMessage } from '../types/messaging';
import { debugLogger } from '../utils/debugLogger';

interface MessageNotification {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  conversationId: number;
}

interface MessageNotificationContainerProps {
  onOpenConversation: (conversationId: number) => void;
}

export const MessageNotificationContainer: React.FC<MessageNotificationContainerProps> = ({
  onOpenConversation
}) => {
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);

  // Handle new WebSocket messages
  const handleNewMessage = useCallback((message: WebSocketMessage) => {
    // Only show notification for NEW_MESSAGE type
    if (message.type === 'NEW_MESSAGE' && message.data) {
      const messageData = message.data;
      
      // Extract message details from data
      const notification: MessageNotification = {
        id: Date.now(),
        senderId: message.senderId || messageData.senderId,
        senderName: messageData.senderDisplayName || messageData.senderUsername || 'Người dùng',
        senderAvatar: messageData.senderAvatarUrl,
        message: messageData.content || '',
        timestamp: message.timestamp || new Date().toISOString(),
        conversationId: message.conversationId || 0
      };

      // Add notification to queue
      setNotifications(prev => [...prev, notification]);
      
      debugLogger.log('MessageNotification', 'New message notification', {
        from: notification.senderName,
        preview: notification.message.substring(0, 50)
      });

      // Play notification sound
      playNotificationSound();
    }
  }, []);

  const { isConnected } = useWebSocket({
    autoConnect: true,
    onMessage: handleNewMessage
  });

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => {
        debugLogger.log('MessageNotification', 'Failed to play sound', { error: err });
      });
    } catch (error) {
      debugLogger.log('MessageNotification', 'Sound not available', { error });
    }
  };

  const handleCloseNotification = useCallback((notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const handleOpenNotification = useCallback((conversationId: number) => {
    onOpenConversation(conversationId);
  }, [onOpenConversation]);

  return (
    <div className="fixed top-0 right-0 z-[60] pointer-events-none">
      <div className="space-y-3 p-6 pointer-events-auto">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              marginTop: index > 0 ? '12px' : '0'
            }}
          >
            <MessageNotificationPopup
              notification={notification}
              onClose={() => handleCloseNotification(notification.id)}
              onOpen={() => handleOpenNotification(notification.conversationId)}
              autoCloseDelay={5000}
            />
          </div>
        ))}
      </div>

    </div>
  );
};

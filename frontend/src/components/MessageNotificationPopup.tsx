import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Avatar } from './Avatar';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface MessageNotification {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  conversationId: number;
}

interface MessageNotificationPopupProps {
  notification: MessageNotification;
  onClose: () => void;
  onOpen: () => void;
  autoCloseDelay?: number;
}

export const MessageNotificationPopup: React.FC<MessageNotificationPopupProps> = ({
  notification,
  onClose,
  onOpen,
  autoCloseDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto close after delay
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClick = () => {
    onOpen();
    handleClose();
  };

  return (
    <div
      className={`fixed top-20 right-6 z-[60] transition-all duration-300 ${
        isVisible && !isClosing
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        onClick={handleClick}
        className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80 cursor-pointer hover:shadow-3xl transition-shadow"
      >
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar
              user={{
                avatarUrl: notification.senderAvatar,
                displayName: notification.senderName,
                userId: notification.senderId
              }}
              size="md"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm text-gray-900 truncate">
                {notification.senderName}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-gray-700 line-clamp-2 mb-1">
              {notification.message}
            </p>
            
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.timestamp), {
                locale: vi,
                addSuffix: true
              })}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full animate-progress"
            style={{
              animation: `progress ${autoCloseDelay}ms linear`
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-progress {
          animation: progress linear;
        }
      `}</style>
    </div>
  );
};

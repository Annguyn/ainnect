import React from 'react';
import { NotificationResponse, NotificationType, notificationService } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  notifications: NotificationResponse[];
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: number) => void;
}

const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.LIKE:
      return '❤️';
    case NotificationType.COMMENT:
    case NotificationType.REPLY:
      return '💬';
    case NotificationType.FOLLOW:
      return '👤';
    case NotificationType.FRIEND_REQUEST:
      return '🤝';
    case NotificationType.FRIEND_ACCEPT:
      return '✅';
    case NotificationType.MENTION:
      return '@';
    case NotificationType.SHARE:
      return '🔄';
    case NotificationType.MESSAGE:
      return '✉️';
    case NotificationType.GROUP_INVITE:
    case NotificationType.GROUP_JOIN:
      return '👥';
    case NotificationType.SYSTEM:
      return 'ℹ️';
    default:
      return '🔔';
  }
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      await onMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.targetId) {
      switch (notification.type) {
        case NotificationType.LIKE:
        case NotificationType.COMMENT:
        case NotificationType.REPLY:
        case NotificationType.SHARE:
          navigate(`/posts/${notification.targetId}`);
          break;
        case NotificationType.FOLLOW:
        case NotificationType.FRIEND_REQUEST:
        case NotificationType.FRIEND_ACCEPT:
          navigate(`/profile/${notification.actor.id}`);
          break;
        case NotificationType.MESSAGE:
          navigate(`/messages`);
          break;
        case NotificationType.GROUP_INVITE:
        case NotificationType.GROUP_JOIN:
          navigate(`/groups/${notification.targetId}`);
          break;
      }
    } else if (notification.actor) {
      navigate(`/profile/${notification.actor.id}`);
    }

    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-50 to-primary-100">
        <h3 className="text-lg font-semibold text-gray-800">Thông báo</h3>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-2 text-4xl">🔔</div>
            <p>Không có thông báo mới</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.isRead ? 'bg-primary-50/30' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-3">
                {/* Actor Avatar */}
                <div className="flex-shrink-0">
                  {notification.actor?.avatarUrl ? (
                    <img
                      src={notification.actor.avatarUrl}
                      alt={notification.actor.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold shadow-sm">
                      {notification.actor?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  {/* Type Icon Badge */}
                  <div className="relative -mt-3 -mr-2 ml-auto w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm text-xs">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    <span className="font-semibold text-gray-900">
                      {notification.actor?.username || 'Người dùng'}
                    </span>{' '}
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-primary-600 font-medium">
                      {(() => {
                        try {
                          const date = new Date(notification.createdAt);
                          if (isNaN(date.getTime())) {
                            return 'Vừa xong';
                          }
                          return formatDistanceToNow(date, {
                            addSuffix: true,
                            locale: vi
                          });
                        } catch (error) {
                          return 'Vừa xong';
                        }
                      })()}
                    </span>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Xóa thông báo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { notificationService, NotificationResponse, NotificationType } from '../services/notificationService';
import { websocketService } from '../services/websocketService';
import { WebSocketMessage } from '../types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';

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

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [page, filter]);

  useEffect(() => {
    const handleNotificationMessage = (message: WebSocketMessage) => {
      if (message.data) {
        const newNotification = message.data as NotificationResponse;
        setNotifications((prev) => [newNotification, ...prev]);
      }
    };

    if (user) {
      // Subscribe to notifications (will auto-connect if needed)
      websocketService.subscribeToNotifications(handleNotificationMessage);
    }

    return () => {
      if (user) {
        websocketService.unsubscribeFromNotifications();
      }
    };
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications(page, 20);
      
      let filteredContent = data.content;
      if (filter === 'unread') {
        filteredContent = data.content.filter(n => !n.isRead);
      }

      if (page === 0) {
        setNotifications(filteredContent);
      } else {
        setNotifications(prev => [...prev, ...filteredContent]);
      }
      
      setHasMore(data.hasNext);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

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
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="hidden lg:block lg:col-span-3">
            <Sidebar />
          </div>

          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setFilter('all');
                      setPage(0);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => {
                      setFilter('unread');
                      setPage(0);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === 'unread'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-gray-100">
                {loading && page === 0 ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
                    <p className="mt-4 text-gray-500">Đang tải thông báo...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <div className="mb-4 text-6xl">🔔</div>
                    <p className="text-lg">
                      {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-primary-50/30' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Actor Avatar */}
                        <div className="flex-shrink-0 relative">
                          {notification.actor?.avatarUrl ? (
                            <img
                              src={notification.actor.avatarUrl}
                              alt={notification.actor.username}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold shadow-sm">
                              {notification.actor?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          {/* Type Icon Badge */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm text-sm">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold text-gray-900">
                              {notification.actor?.displayName || notification.actor?.username || 'Người dùng'}
                            </span>{' '}
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
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
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <span className="text-xs text-primary-600 font-medium">Mới</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex items-center space-x-2">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                              title="Đánh dấu đã đọc"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Xóa thông báo"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Load More */}
              {hasMore && notifications.length > 0 && (
                <div className="p-6 text-center border-t border-gray-200">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors font-medium"
                  >
                    {loading ? 'Đang tải...' : 'Xem thêm'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from './ui';
import { Button } from './ui';
import { AnimatedLogo } from './AnimatedLogo';
import { websocketService } from '../services/websocketService';
import { WebSocketMessage } from '../types/messaging';
import { notificationService, NotificationResponse, NotificationStatsDto } from '../services/notificationService';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  showSearch?: boolean;
  showUserMenu?: boolean;
  onLogout?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  showSearch = true,
  showUserMenu = true,
  onLogout,
  className = ''
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [showHistory, setShowHistory] = useState(false);
  const [showSocialMenu, setShowSocialMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationStats, setNotificationStats] = useState<NotificationStatsDto>({ unreadCount: 0, totalCount: 0 });
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Load notifications and stats on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [notificationsData, stats] = await Promise.all([
          notificationService.getUserNotifications(0, 10),
          notificationService.getNotificationStats()
        ]);
        setNotifications(notificationsData.content);
        setNotificationStats(stats);
        setUnreadCount(stats.unreadCount);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Subscribe to realtime notifications via WebSocket
  useEffect(() => {
    const handleNotificationMessage = (message: WebSocketMessage) => {
      console.log('Received notification:', message);
      
      // Add new notification to the list
      if (message.data) {
        const newNotification = message.data as NotificationResponse;
        console.log('New notification createdAt:', newNotification.createdAt, typeof newNotification.createdAt);
        setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]); // Keep only latest 10
        setUnreadCount((prev) => prev + 1);
        setNotificationStats(prev => ({
          ...prev,
          unreadCount: prev.unreadCount + 1,
          totalCount: prev.totalCount + 1
        }));
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

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotificationStats(prev => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setNotificationStats(prev => ({ ...prev, unreadCount: 0 }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotificationStats(prev => ({
          unreadCount: Math.max(0, prev.unreadCount - 1),
          totalCount: Math.max(0, prev.totalCount - 1)
        }));
      } else {
        setNotificationStats(prev => ({
          ...prev,
          totalCount: Math.max(0, prev.totalCount - 1)
        }));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const runSearch = (q: string) => {
    const keyword = q.trim();
    if (!keyword) return;
    const nextRecent = [keyword, ...recentSearches.filter(s => s !== keyword)].slice(0, 5);
    setRecentSearches(nextRecent);
    localStorage.setItem('recentSearches', JSON.stringify(nextRecent));
    setShowHistory(false);
    setHighlightIndex(-1);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <header className={`bg-white shadow-md border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <AnimatedLogo size="md" />
              <h1 className="text-xl font-bold text-primary-600">
                ainnect
              </h1>
            </Link>
          </div>
          
          {/* Search Bar */}
          {/* Main Navigation */}
          <div className="hidden md:flex flex-1 justify-center space-x-1 max-w-md">
            <Link
              to="/"
              title="Trang chủ"
              className="p-3 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors font-medium relative group"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Trang chủ
              </span>
            </Link>
            <Link
              to="/messages"
              title="Tin nhắn"
              className="p-3 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors font-medium relative group"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Tin nhắn
              </span>
            </Link>
            <Link
              to="/groups"
              title="Nhóm"
              className="p-3 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors font-medium relative group"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Nhóm
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tìm kiếm trên Ainnect"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const chosen = highlightIndex >= 0 ? recentSearches[highlightIndex] : searchQuery;
                      runSearch(chosen);
                    }
                    if (e.key === 'Escape') setShowHistory(false);
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      if (!showHistory) setShowHistory(true);
                      setHighlightIndex((prev) => {
                        const next = prev + 1;
                        return next >= recentSearches.length ? 0 : next;
                      });
                    }
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightIndex((prev) => {
                        const next = prev - 1;
                        return next < 0 ? recentSearches.length - 1 : next;
                      });
                    }
                  }}
                  className="pl-10 pr-10 py-2 w-full rounded-full border border-gray-200 bg-gray-100 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors"
                />
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  onClick={() => runSearch(searchQuery)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-primary-600 text-white rounded-full hover:bg-primary-700"
                >
                  Tìm
                </button>

                {showHistory && recentSearches.length > 0 && (
                  <div
                    className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                    onMouseLeave={() => setShowHistory(false)}
                  >
                    <div className="px-4 py-2 text-xs text-gray-500">Tìm kiếm gần đây</div>
                    <ul className="max-h-64 overflow-y-auto">
                      {recentSearches.map((term, idx) => (
                        <li key={term}>
                          <button
                            onClick={() => runSearch(term)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${idx === highlightIndex ? 'bg-gray-100' : ''}`}
                          >
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Search Page Link */}
          {!showSearch && (
            <Link
              to="/search"
              title="Tìm kiếm"
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative group"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                Tìm kiếm
              </span>
            </Link>
          )}

          {/* Quick Social Shortcuts */}
          <div className="hidden sm:flex items-center space-x-1 mr-2">
            <Link
              to="/friends"
              title="Danh sách bạn bè"
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative group"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                Bạn bè
              </span>
            </Link>
          </div>
          
          {/* User Menu or Auth Buttons */}
          {showUserMenu ? (
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  {/* Notifications */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={handleNotificationClick}
                      title="Thông báo"
                      className="p-2 hover:bg-gray-100 rounded-full relative text-gray-600 hover:text-primary-600 group transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        Thông báo
                      </span>
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <NotificationDropdown
                        notifications={notifications}
                        onClose={() => setShowNotifications(false)}
                        onMarkAsRead={handleMarkAsRead}
                        onMarkAllAsRead={handleMarkAllAsRead}
                        onDelete={handleDeleteNotification}
                      />
                    )}
                  </div>

                  {/* Social Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSocialMenu(!showSocialMenu)}
                      title="Menu"
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-primary-600 group"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        Menu
                      </span>
                    </button>
                    
                    {showSocialMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900">Mạng xã hội</h3>
                        </div>
                        
                        <div className="py-1">
                          <button
                            onClick={() => {
                              navigate('/groups');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            <span>Nhóm</span>
                          </button>
                        <button
                          onClick={() => {
                            navigate('/friends');
                            setShowSocialMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <span>Danh sách bạn bè</span>
                        </button>

                          <button
                            onClick={() => {
                              navigate('/friend-requests?tab=received');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <span>Lời mời kết bạn</span>
                          </button>

                        <button
                          onClick={() => {
                            navigate('/friend-requests?tab=sent');
                            setShowSocialMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <span>Lời mời đã gửi</span>
                        </button>
                          
                          <button
                            onClick={() => {
                              navigate('/followers');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Người theo dõi</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/following');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Đang theo dõi</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/friends');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <span>Bạn bè</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/blocked-users');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                            <span>Người dùng đã chặn</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/reports');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>Báo cáo của tôi</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Messages Button with Counter */}
                  <button
                    onClick={() => navigate('/messages')}
                    title="Tin nhắn"
                    className="p-2 hover:bg-gray-100 rounded-full relative text-gray-600 hover:text-primary-600 group"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Tin nhắn
                    </span>
                  </button>

                  {/* User Profile Link */}
                  <div className="relative">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 text-gray-800"
                    >
                      <img
                        src={user.avatarUrl || '/favicon.ico'}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <span className="hidden sm:block text-sm font-semibold">
                        {user.displayName?.split(' ').pop()}
                      </span>
                    </Link>
                  </div>

                  {/* Logout Button (for ProfilePage) */}
                  {onLogout && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onLogout}
                    >
                      Đăng xuất
                    </Button>
                  )}
                </>
              ) : (
                /* Auth Buttons for non-authenticated users */
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const event = new CustomEvent('openAuthModal', { detail: { mode: 'login' } });
                      window.dispatchEvent(event);
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const event = new CustomEvent('openAuthModal', { detail: { mode: 'register' } });
                      window.dispatchEvent(event);
                    }}
                  >
                    Đăng ký
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

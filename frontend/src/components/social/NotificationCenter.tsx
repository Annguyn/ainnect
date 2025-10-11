import React, { useState, useEffect } from 'react'
import { NotificationCard } from './NotificationCard'
import { cn } from '../../lib/utils'
import { SocialNotification } from '../../types/social'

interface NotificationCenterProps {
  isVisible: boolean
  onClose: () => void
  notifications: SocialNotification[]
  unreadCount: number
  onMarkAsRead: (notificationId: number) => void
  onMarkAllAsRead: () => void
  onNotificationClick: (notification: SocialNotification) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  className?: string
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isVisible,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications

  const handleTabChange = (tab: 'all' | 'unread') => {
    setActiveTab(tab)
  }

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">Thông báo</h2>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Đọc tất cả
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange('all')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Tất cả
              </button>
              <button
                onClick={() => handleTabChange('unread')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors relative',
                  activeTab === 'unread'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Chưa đọc
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 7h5l-5-5v5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'unread' 
                    ? 'Tất cả thông báo của bạn đã được đọc.' 
                    : 'Bạn sẽ nhận được thông báo khi có hoạt động mới.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onNotificationClick={onNotificationClick}
                  />
                ))}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="p-4 text-center">
                    <button
                      onClick={onLoadMore}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
                          Đang tải...
                        </>
                      ) : (
                        'Tải thêm'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

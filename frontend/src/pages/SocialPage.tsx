import React, { useState, useEffect } from 'react'
import { 
  FollowButton, 
  FriendRequestButton, 
  UserCard, 
  NotificationCenter, 
  SocialFeed 
} from '../components/social'
import { useSocial } from '../hooks/useSocial'
import { cn } from '../lib/utils'
import { socialService } from '../services/socialService'
import { User, SocialUser } from '../types';

export const SocialPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    followUser,
    unfollowUser,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useSocial()

  const [activeTab, setActiveTab] = useState<'feed' | 'users' | 'notifications'>('feed')
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await socialService.fetchUsers();
      const mappedUsers: SocialUser[] = fetchedUsers.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl ?? undefined, // Ensure compatibility with SocialUser
        bio: user.bio || '',
        isOnline: false, // Default value, update if real-time data is available
        lastSeen: undefined, // Default value, update if real-time data is available
        followerCount: 0, // Default value
        followingCount: 0, // Default value
        postCount: 0, // Default value
        isVerified: false, // Default value
      }));
      setUsers(mappedUsers);
    };

    const loadActivities = async () => {
      const fetchedActivities = await socialService.fetchActivities();
      setActivities(fetchedActivities);
    };

    loadUsers();
    loadActivities();
  }, [])

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification)
    // Handle navigation to relevant content
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">Mạng xã hội</h1>
              
              {/* Navigation Tabs */}
              <nav className="flex space-x-8">
                {[
                  { key: 'feed', label: 'Bảng tin', icon: '📱' },
                  { key: 'users', label: 'Người dùng', icon: '👥' },
                  { key: 'notifications', label: 'Thông báo', icon: '🔔' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      activeTab === tab.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.key === 'notifications' && unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Notification Button */}
            <button
              onClick={() => setShowNotificationCenter(true)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 7h5l-5-5v5z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bảng tin xã hội</h2>
              <SocialFeed
                activities={activities}
                onFollow={followUser}
                onUnfollow={unfollowUser}
                onSendFriendRequest={sendFriendRequest}
                onAcceptFriendRequest={acceptFriendRequest}
                onDeclineFriendRequest={declineFriendRequest}
                onRemoveFriend={removeFriend}
              />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Khám phá người dùng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onFollow={followUser}
                    onUnfollow={unfollowUser}
                    onSendFriendRequest={sendFriendRequest}
                    onAcceptFriendRequest={acceptFriendRequest}
                    onDeclineFriendRequest={declineFriendRequest}
                    onRemoveFriend={removeFriend}
                    variant="default"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Thông báo</h2>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 7h5l-5-5v5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thông báo</h3>
                  <p className="text-gray-500">Bạn sẽ nhận được thông báo khi có hoạt động mới.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 7h5l-5-5v5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Center Modal */}
      <NotificationCenter
        isVisible={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  )
}

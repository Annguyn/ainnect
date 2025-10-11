import React, { useState } from 'react'
import { Avatar } from '../Avatar'
import { FollowButton, FriendRequestButton } from '../social'
import { cn } from '../../lib/utils'

interface ConnectionUser {
  id: number
  username: string
  displayName: string
  avatarUrl?: string
  bio?: string
  isVerified: boolean
  isOnline: boolean
  lastSeen?: string
  mutualFriends?: number
  connectionDate: string
}

interface ConnectionsListProps {
  title: string
  users: ConnectionUser[]
  type: 'followers' | 'following' | 'friends'
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  onFollow?: (userId: number) => void
  onUnfollow?: (userId: number) => void
  onSendFriendRequest?: (userId: number, message?: string) => void
  onAcceptFriendRequest?: (requestId: number) => void
  onDeclineFriendRequest?: (requestId: number) => void
  onRemoveFriend?: (userId: number) => void
  className?: string
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({
  title,
  users,
  type,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onFollow,
  onUnfollow,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onRemoveFriend,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Vừa xong'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} phút trước`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} giờ trước`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ngày trước`
    } else {
      return date.toLocaleDateString('vi-VN')
    }
  }

  const getConnectionInfo = (user: ConnectionUser) => {
    switch (type) {
      case 'followers':
        return `Theo dõi bạn ${getTimeAgo(user.connectionDate)}`
      case 'following':
        return `Bạn đã theo dõi ${getTimeAgo(user.connectionDate)}`
      case 'friends':
        return `Bạn bè từ ${getTimeAgo(user.connectionDate)}`
      default:
        return ''
    }
  }

  const getActionButtons = (user: ConnectionUser) => {
    switch (type) {
      case 'followers':
        return (
          <div className="flex space-x-2">
            <FollowButton
              userId={user.id}
              onFollow={onFollow}
              onUnfollow={onUnfollow}
              size="sm"
              variant="outline"
            />
            <FriendRequestButton
              userId={user.id}
              onSendRequest={onSendFriendRequest}
              onAcceptRequest={onAcceptFriendRequest}
              onDeclineRequest={onDeclineFriendRequest}
              onRemoveFriend={onRemoveFriend}
              size="sm"
              variant="outline"
            />
          </div>
        )
      case 'following':
        return (
          <FollowButton
            userId={user.id}
            isFollowing={true}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            size="sm"
            variant="outline"
          />
        )
      case 'friends':
        return (
          <FriendRequestButton
            userId={user.id}
            friendshipStatus="friends"
            onSendRequest={onSendFriendRequest}
            onAcceptRequest={onAcceptFriendRequest}
            onDeclineRequest={onDeclineFriendRequest}
            onRemoveFriend={onRemoveFriend}
            size="sm"
            variant="outline"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500">{users.length} người</span>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có kết nối nào'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Thử tìm kiếm với từ khóa khác'
                : `Bạn sẽ thấy danh sách ${type === 'followers' ? 'người theo dõi' : type === 'following' ? 'người đang theo dõi' : 'bạn bè'} ở đây.`
              }
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar
                    user={{
                      userId: user.id,
                      displayName: user.displayName,
                      avatarUrl: user.avatarUrl
                    }}
                    size="md"
                  />
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 truncate">{user.displayName}</h3>
                    {user.isVerified && (
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                  <p className="text-xs text-gray-400">{getConnectionInfo(user)}</p>
                  {user.mutualFriends && user.mutualFriends > 0 && (
                    <p className="text-xs text-blue-600">{user.mutualFriends} bạn chung</p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {getActionButtons(user)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="p-4 border-t border-gray-200 text-center">
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
  )
}

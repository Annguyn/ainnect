import React, { useState, useEffect } from 'react'
import { PostCard } from '../PostCard'
import { UserCard } from './UserCard'
import { cn } from '../../lib/utils'
import { SocialActivity, SocialUser } from '../../types/social'

interface SocialFeedProps {
  activities: SocialActivity[]
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  onFollow?: (userId: number) => void
  onUnfollow?: (userId: number) => void
  onSendFriendRequest?: (userId: number, message?: string) => void
  onAcceptFriendRequest?: (requestId: number) => void
  onDeclineFriendRequest?: (requestId: number) => void
  onRemoveFriend?: (userId: number) => void
  onReaction?: (postId: number, reaction: string) => void
  onUnreact?: (postId: number) => void
  onShare?: (postId: number) => void
  className?: string
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  activities,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onFollow,
  onUnfollow,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onRemoveFriend,
  onReaction,
  onUnreact,
  onShare,
  className
}) => {
  const [filter, setFilter] = useState<'all' | 'posts' | 'follows' | 'friends'>('all')

  const filteredActivities = activities.filter(activity => {
    switch (filter) {
      case 'posts':
        return activity.type === 'post'
      case 'follows':
        return activity.type === 'follow'
      case 'friends':
        return activity.type === 'friend_request'
      default:
        return true
    }
  })

  const renderActivity = (activity: SocialActivity) => {
    switch (activity.type) {
      case 'post':
        return (
          <PostCard
            key={activity.id}
            post={activity.target}
            onReaction={onReaction || (() => {})}
            onUnreact={onUnreact || (() => {})}
            onShare={onShare || (() => {})}
            onComment={async (id: number, content: string) => {}}
            className="mb-6"
          />
        )
      
      case 'follow':
        return (
          <div key={activity.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.user.displayName}</span> đã theo dõi bạn
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onFollow?.(activity.user.id)}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Theo dõi lại
                </button>
              </div>
            </div>
          </div>
        )
      
      case 'friend_request':
        return (
          <div key={activity.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.user.displayName}</span> đã gửi lời mời kết bạn
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onAcceptFriendRequest?.(activity.id)}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Chấp nhận
                </button>
                <button
                  onClick={() => onDeclineFriendRequest?.(activity.id)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        )
      
      case 'like':
        return (
          <div key={activity.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.user.displayName}</span> đã thích bài viết của bạn
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        )
      
      case 'comment':
        return (
          <div key={activity.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.user.displayName}</span> đã bình luận bài viết của bạn
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        )
      
      case 'share':
        return (
          <div key={activity.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.user.displayName}</span> đã chia sẻ bài viết của bạn
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'Tất cả', count: activities.length },
            { key: 'posts', label: 'Bài viết', count: activities.filter(a => a.type === 'post').length },
            { key: 'follows', label: 'Theo dõi', count: activities.filter(a => a.type === 'follow').length },
            { key: 'friends', label: 'Bạn bè', count: activities.filter(a => a.type === 'friend_request').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === tab.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 7h5l-5-5v5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Chưa có hoạt động nào' : `Chưa có ${filter === 'posts' ? 'bài viết' : filter === 'follows' ? 'theo dõi' : 'bạn bè'} nào`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Bạn sẽ thấy các hoạt động từ bạn bè và người theo dõi ở đây.'
                : `Bạn sẽ thấy các hoạt động ${filter === 'posts' ? 'bài viết' : filter === 'follows' ? 'theo dõi' : 'bạn bè'} ở đây.`}
            </p>
          </div>
        ) : (
          filteredActivities.map(renderActivity)
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
                Đang tải...
              </>
            ) : (
              'Tải thêm hoạt động'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

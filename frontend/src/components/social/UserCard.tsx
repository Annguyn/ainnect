import React from 'react'
import { Avatar } from '../Avatar'
import { FollowButton } from './FollowButton'
import { FriendRequestButton } from './FriendRequestButton'
import { cn } from '../../lib/utils'
import { SocialUser } from '../../types/social'
import { toFriendshipButtonStatus } from '../../utils/relationshipUtils'

interface UserCardProps {
  user: SocialUser
  showFollowButton?: boolean
  showFriendButton?: boolean
  showStats?: boolean
  onFollow?: (userId: number) => void
  onUnfollow?: (userId: number) => void
  onSendFriendRequest?: (userId: number, message?: string) => void
  onAcceptFriendRequest?: (requestId: number) => void
  onDeclineFriendRequest?: (requestId: number) => void
  onRemoveFriend?: (userId: number) => void
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  showFollowButton = true,
  showFriendButton = true,
  showStats = true,
  onFollow,
  onUnfollow,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onRemoveFriend,
  className,
  variant = 'default'
}) => {
  const handleUserClick = () => {
    window.location.href = `/profile/${user.id}`
  }

  const getOnlineStatus = () => {
    if (user.isOnline) {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium">Đang hoạt động</span>
        </div>
      )
    }
    
    if (user.lastSeen) {
      const lastSeenDate = new Date(user.lastSeen)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) {
        return (
          <div className="flex items-center space-x-1 text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="text-xs">Vừa xong</span>
          </div>
        )
      } else if (diffInMinutes < 60) {
        return (
          <div className="flex items-center space-x-1 text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="text-xs">{diffInMinutes} phút trước</span>
          </div>
        )
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60)
        return (
          <div className="flex items-center space-x-1 text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="text-xs">{hours} giờ trước</span>
          </div>
        )
      }
    }
    
    return null
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow',
        className
      )}>
        <div className="relative">
          <div onClick={handleUserClick} className="cursor-pointer">
            <Avatar
              user={{
                userId: user.id,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl
              }}
              size="md"
            />
          </div>
          {user.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 
              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
              onClick={handleUserClick}
            >
              {user.displayName}
            </h3>
            {user.isVerified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">@{user.username}</p>
          {getOnlineStatus()}
        </div>
        
        <div className="flex space-x-2">
          {showFollowButton && (
            <FollowButton
              userId={user.id}
              isFollowing={user.relationship?.isFollowing || false}
              isFollower={user.relationship?.isFollowedBy || false}
              isFriend={user.relationship?.isFriend || false}
              onFollow={onFollow}
              onUnfollow={onUnfollow}
              size="sm"
              variant="outline"
            />
          )}
          {showFriendButton && (
            <FriendRequestButton
              userId={user.id}
              friendshipStatus={toFriendshipButtonStatus(user.relationship?.relationshipStatus || 'none')}
              onSendRequest={onSendFriendRequest}
              onAcceptRequest={onAcceptFriendRequest}
              onDeclineRequest={onDeclineFriendRequest}
              onRemoveFriend={onRemoveFriend}
              size="sm"
              variant="outline"
            />
          )}
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow',
        className
      )}>
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div onClick={handleUserClick} className="cursor-pointer">
                <Avatar
                  user={{
                    userId: user.id,
                    displayName: user.displayName,
                    avatarUrl: user.avatarUrl
                  }}
                  size="xl"
                />
              </div>
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h2 
                  className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleUserClick}
                >
                  {user.displayName}
                </h2>
                {user.isVerified && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <p className="text-gray-600 mb-2">@{user.username}</p>
              
              {user.bio && (
                <p className="text-gray-700 mb-4 leading-relaxed">{user.bio}</p>
              )}
              
              {getOnlineStatus()}
              
              {showStats && (
                <div className="flex space-x-6 mt-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{user.followerCount || 0} người theo dõi</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{user.followingCount || 0} đang theo dõi</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{user.postCount || 0} bài viết</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            {showFollowButton && (
              <FollowButton
                userId={user.id}
                isFollowing={user.relationship?.isFollowing || false}
                isFollower={user.relationship?.isFollowedBy || false}
                isFriend={user.relationship?.isFriend || false}
                onFollow={onFollow}
                onUnfollow={onUnfollow}
                size="md"
                variant="default"
              />
            )}
            {showFriendButton && (
              <FriendRequestButton
                userId={user.id}
                friendshipStatus={toFriendshipButtonStatus(user.relationship?.relationshipStatus || 'none')}
                onSendRequest={onSendFriendRequest}
                onAcceptRequest={onAcceptFriendRequest}
                onDeclineRequest={onDeclineFriendRequest}
                onRemoveFriend={onRemoveFriend}
                size="md"
                variant="outline"
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <div onClick={handleUserClick} className="cursor-pointer">
            <Avatar
              user={{
                userId: user.id,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl
              }}
              size="lg"
            />
          </div>
          {user.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 
              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleUserClick}
            >
              {user.displayName}
            </h3>
            {user.isVerified && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-500">@{user.username}</p>
          {getOnlineStatus()}
        </div>
      </div>
      
      {user.bio && (
        <p className="text-gray-700 text-sm mb-4 leading-relaxed">{user.bio}</p>
      )}
      
      {showStats && (
        <div className="flex space-x-4 mb-4 text-sm text-gray-600">
          <span>{user.followerCount || 0} người theo dõi</span>
          <span>{user.followingCount || 0} đang theo dõi</span>
          <span>{user.postCount || 0} bài viết</span>
        </div>
      )}
      
      <div className="flex space-x-2">
        {showFollowButton && (
          <FollowButton
            userId={user.id}
            isFollowing={user.relationship?.isFollowing || false}
            isFollower={user.relationship?.isFollowedBy || false}
            isFriend={user.relationship?.isFriend || false}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            size="sm"
            variant="default"
          />
        )}
        {showFriendButton && (
          <FriendRequestButton
            userId={user.id}
            friendshipStatus={toFriendshipButtonStatus(user.relationship?.relationshipStatus || 'none')}
            onSendRequest={onSendFriendRequest}
            onAcceptRequest={onAcceptFriendRequest}
            onDeclineRequest={onDeclineFriendRequest}
            onRemoveFriend={onRemoveFriend}
            size="sm"
            variant="outline"
          />
        )}
      </div>
    </div>
  )
}

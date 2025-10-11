import React, { useState } from 'react'
import { Avatar } from '../Avatar'
import { FollowButton, FriendRequestButton } from '../social'
import { cn } from '../../lib/utils'

interface ProfileCardProps {
  profile: {
    id: number
    username: string
    displayName: string
    avatarUrl?: string
    bio?: string
    location?: string
    website?: string
    isPrivate: boolean
    isVerified: boolean
    isOnline: boolean
    lastSeen?: string
    createdAt: string
  }
  socialStats?: {
    followers: number
    following: number
    friends: number
    posts: number
  }
  isOwnProfile?: boolean
  onFollow?: (userId: number) => void
  onUnfollow?: (userId: number) => void
  onSendFriendRequest?: (userId: number, message?: string) => void
  onAcceptFriendRequest?: (requestId: number) => void
  onDeclineFriendRequest?: (requestId: number) => void
  onRemoveFriend?: (userId: number) => void
  onEditProfile?: () => void
  className?: string
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  socialStats,
  isOwnProfile = false,
  onFollow,
  onUnfollow,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onRemoveFriend,
  onEditProfile,
  className
}) => {
  const [showFullBio, setShowFullBio] = useState(false)

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

  const getOnlineStatus = () => {
    if (profile.isOnline) {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Đang hoạt động</span>
        </div>
      )
    }
    
    if (profile.lastSeen) {
      return (
        <div className="flex items-center space-x-1 text-gray-500">
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <span className="text-sm">Hoạt động {getTimeAgo(profile.lastSeen)}</span>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 overflow-hidden',
      className
    )}>
      {/* Cover Photo Placeholder */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {isOwnProfile && (
          <button className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-start space-x-4 -mt-16 relative">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
              <Avatar
                user={{
                  userId: profile.id,
                  displayName: profile.displayName,
                  avatarUrl: profile.avatarUrl
                }}
                size="xl"
              />
            </div>
            {profile.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full" />
            )}
          </div>

          <div className="flex-1 pt-16">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
              {profile.isVerified && (
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {profile.isPrivate && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm">Riêng tư</span>
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-2">@{profile.username}</p>
            {getOnlineStatus()}
          </div>

          {/* Action Buttons */}
          <div className="pt-16">
            {isOwnProfile ? (
              <button
                onClick={onEditProfile}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Chỉnh sửa hồ sơ
              </button>
            ) : (
              <div className="flex space-x-2">
                <FollowButton
                  userId={profile.id}
                  onFollow={onFollow}
                  onUnfollow={onUnfollow}
                  size="md"
                  variant="default"
                />
                <FriendRequestButton
                  userId={profile.id}
                  onSendRequest={onSendFriendRequest}
                  onAcceptRequest={onAcceptFriendRequest}
                  onDeclineRequest={onDeclineFriendRequest}
                  onRemoveFriend={onRemoveFriend}
                  size="md"
                  variant="outline"
                />
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-4">
            <p className="text-gray-700 leading-relaxed">
              {showFullBio || profile.bio.length <= 150 
                ? profile.bio 
                : `${profile.bio.substring(0, 150)}...`
              }
            </p>
            {profile.bio.length > 150 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
              >
                {showFullBio ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        )}

        {/* Location and Website */}
        <div className="mt-4 space-y-2">
          {profile.location && (
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{profile.location}</span>
            </div>
          )}
          
          {profile.website && (
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {profile.website}
              </a>
            </div>
          )}

          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Social Stats */}
        {socialStats && (
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{socialStats.posts}</div>
              <div className="text-sm text-gray-600">Bài viết</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{socialStats.followers}</div>
              <div className="text-sm text-gray-600">Người theo dõi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{socialStats.following}</div>
              <div className="text-sm text-gray-600">Đang theo dõi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{socialStats.friends}</div>
              <div className="text-sm text-gray-600">Bạn bè</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

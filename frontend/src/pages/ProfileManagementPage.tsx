import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  ProfileCard, 
  ProfileEditModal, 
  ConnectionsList, 
  SocialStatsCard 
} from '../components/profile'
import { useProfile } from '../hooks/useProfile'
import { useSocial } from '../hooks/useSocial'
import { cn } from '../lib/utils'

export const ProfileManagementPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>()
  const targetUserId = userId ? parseInt(userId) : 1
  const isOwnProfile = !userId || targetUserId === 1 // Mock current user ID

  const {
    profile,
    socialStats,
    isLoading,
    error,
    loadProfile,
    updateProfile,
    loadSocialStats,
    loadFollowers,
    loadFollowing,
    loadFriends,
    uploadAvatar
  } = useProfile()

  const {
    followUser,
    unfollowUser,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend
  } = useSocial()

  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following' | 'friends'>('posts')
  const [showEditModal, setShowEditModal] = useState(false)
  const [connections, setConnections] = useState<any[]>([])
  const [connectionsLoading, setConnectionsLoading] = useState(false)

  // Load profile data
  useEffect(() => {
    if (targetUserId) {
      loadProfile(targetUserId)
      loadSocialStats(targetUserId)
    }
  }, [targetUserId, loadProfile, loadSocialStats])

  // Load connections based on active tab
  useEffect(() => {
    const loadConnections = async () => {
      if (!targetUserId) return

      setConnectionsLoading(true)
      try {
        let response
        switch (activeTab) {
          case 'followers':
            response = await loadFollowers(targetUserId)
            break
          case 'following':
            response = await loadFollowing(targetUserId)
            break
          case 'friends':
            response = await loadFriends(targetUserId)
            break
          default:
            return
        }
        setConnections(response.content || [])
      } catch (err) {
        console.error('Load connections error:', err)
      } finally {
        setConnectionsLoading(false)
      }
    }

    if (activeTab !== 'posts') {
      loadConnections()
    }
  }, [activeTab, targetUserId, loadFollowers, loadFollowing, loadFriends])

  const handleEditProfile = () => {
    setShowEditModal(true)
  }

  const handleSaveProfile = async (data: any) => {
    try {
      await updateProfile(targetUserId, data)
      setShowEditModal(false)
    } catch (err) {
      console.error('Save profile error:', err)
    }
  }

  const handleAvatarChange = async (file: File) => {
    try {
      await uploadAvatar(targetUserId, file)
    } catch (err) {
      console.error('Avatar upload error:', err)
    }
  }

  const handleStatClick = (statType: string) => {
    switch (statType) {
      case 'posts':
        setActiveTab('posts')
        break
      case 'followers':
        setActiveTab('followers')
        break
      case 'following':
        setActiveTab('following')
        break
      case 'friends':
        setActiveTab('friends')
        break
    }
  }

  const getConnectionsTitle = () => {
    switch (activeTab) {
      case 'followers': return 'Người theo dõi'
      case 'following': return 'Đang theo dõi'
      case 'friends': return 'Bạn bè'
      default: return ''
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể tải hồ sơ</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => loadProfile(targetUserId)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard
              profile={profile}
              socialStats={socialStats}
              isOwnProfile={isOwnProfile}
              onFollow={followUser}
              onUnfollow={unfollowUser}
              onSendFriendRequest={sendFriendRequest}
              onAcceptFriendRequest={acceptFriendRequest}
              onDeclineFriendRequest={declineFriendRequest}
              onRemoveFriend={removeFriend}
              onEditProfile={handleEditProfile}
              className="mb-6"
            />

            {/* Social Stats Card */}
            {socialStats && (
              <SocialStatsCard
                stats={socialStats}
                onStatClick={handleStatClick}
              />
            )}
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'posts', label: 'Bài viết', icon: '📝' },
                    { key: 'followers', label: 'Người theo dõi', icon: '👥' },
                    { key: 'following', label: 'Đang theo dõi', icon: '👤' },
                    { key: 'friends', label: 'Bạn bè', icon: '🤝' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={cn(
                        'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      )}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                      {socialStats && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {socialStats[tab.key as keyof typeof socialStats] || 0}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'posts' ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết nào</h3>
                <p className="text-gray-500">
                  {isOwnProfile 
                    ? 'Hãy tạo bài viết đầu tiên của bạn!' 
                    : `${profile?.displayName} chưa có bài viết nào.`
                  }
                </p>
              </div>
            ) : (
              <ConnectionsList
                title={getConnectionsTitle()}
                users={connections}
                type={activeTab as any}
                isLoading={connectionsLoading}
                onFollow={followUser}
                onUnfollow={unfollowUser}
                onSendFriendRequest={sendFriendRequest}
                onAcceptFriendRequest={acceptFriendRequest}
                onDeclineFriendRequest={declineFriendRequest}
                onRemoveFriend={removeFriend}
              />
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {profile && (
        <ProfileEditModal
          isVisible={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onSave={handleSaveProfile}
          onAvatarChange={handleAvatarChange}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

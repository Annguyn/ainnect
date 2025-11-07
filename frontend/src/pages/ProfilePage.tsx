import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { useSocial } from '../hooks/useSocial';
import { userService } from '../services/userService';
import { profileService } from '../services/profileService';
import { socialService } from '../services/socialService';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/ui';
import { PostCard } from '../components/PostCard';
import { Header } from '../components/Header';
import { EmptyState } from '../components/EmptyState';
import { ProfileSettingsModal } from '../components/ProfileSettingsModal';
import { EducationSection, WorkExperienceSection, InterestsSection, LocationsSection, ProfileOverview, ProfileEditModalV2 } from '../components/profile';
import { Navigate, useParams } from 'react-router-dom';
import { debugLogger } from '../utils/debugLogger';
import { 
  getReactionCount, 
  getCommentCount, 
  getShareCount 
} from '../utils/postUtils';
import type { ReactionType } from '../components/ReactionPicker';
import type { User, SocialStats, Media } from '../types';
import type { CompleteProfile } from '../services/profileService';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const { isAuthenticated, user: currentUser, logout } = useAuth();
  const { posts, isLoading, refreshPosts, reactToPost, unreactToPost, addComment, sharePost } = usePosts();
  const {
    isLoading: socialLoading,
    error: socialError,
    followUser,
    unfollowUser,
    sendFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    getUserSocialStats,
    checkFollowingStatus,
    checkFriendStatus,
    checkBlockStatus,
    clearError
  } = useSocial();
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'education' | 'experience' | 'interests' | 'locations'>('posts');
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [socialStats, setSocialStats] = useState<any | null>(null);
  const [completeProfile, setCompleteProfile] = useState<CompleteProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isFriend, setIsFriend] = useState<boolean | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
  const [canSendFriendReq, setCanSendFriendReq] = useState<boolean>(true);
  const [friendshipStatus, setFriendshipStatus] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [commonFriends, setCommonFriends] = useState<any[]>([])
  const [commonFriendsCount, setCommonFriendsCount] = useState<number>(0)
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(false);

  const isCurrentUserProfile = !userId || (currentUser && userId === currentUser.id.toString());
  const targetUserId = userId ? parseInt(userId) : currentUser?.id;

  // Extract photos from user's posts
  useEffect(() => {
    if (completeProfile?.posts?.posts && completeProfile.posts.posts.length > 0) {
      const photos: string[] = [];
      completeProfile.posts.posts.forEach(post => {
        if (post.media && post.media.length > 0) {
          post.media.forEach((mediaItem: Media) => {
            if (mediaItem.mediaType === 'image') {
              photos.push(mediaItem.mediaUrl);
            }
          });
        }
      });
      setUserPhotos(photos);
    } else {
      setUserPhotos([]);
    }
  }, [completeProfile?.posts?.posts]);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!targetUserId) return;
      
      console.log('ProfilePage: Loading profile data', {
        userId,
        targetUserId,
        isCurrentUserProfile,
        currentUserId: currentUser?.id
      });
      
      setIsLoadingProfile(true);
      try {
          // Use new endpoint for both current user and other users
          console.log('ProfilePage: Loading profile data for userId:', targetUserId);
          const completeProfileData = await profileService.getCompleteProfile(targetUserId);
            setCompleteProfile(completeProfileData);
          
          // Set profile user from complete profile data
          const userData = {
            id: completeProfileData.userId,
            username: completeProfileData.username,
            displayName: completeProfileData.displayName,
            avatarUrl: completeProfileData.avatarUrl,
            bio: completeProfileData.bio,
            location: completeProfileData.location,
            website: completeProfileData.website,
            createdAt: completeProfileData.joinedAt,
            isVerified: completeProfileData.verified
          };
          setProfileUser(userData as any);
          
          // Prefer live stats endpoint for dynamic flags
          try {
            const stats = await getUserSocialStats(completeProfileData.userId)
            setSocialStats(stats)
            if (!isCurrentUserProfile) {
              setIsFollowing(!!stats.following)
              setIsFriend(!!stats.friend)
              setIsBlocked(!!stats.blocked)
              setCanSendFriendReq(!!stats.canSendFriendRequest)
            }
          } catch {}

          if (!isCurrentUserProfile) {
            setFriendshipStatus((completeProfileData as any).friendshipStatus || null)
            // Ensure friend status is consistent with dedicated endpoint
            try {
              const friendNow = await checkFriendStatus(completeProfileData.userId)
              setIsFriend(!!friendNow)
            } catch {}
          }
        
        debugLogger.log('ProfilePage', 'Loading user posts', { userId: targetUserId });
        refreshPosts();

        // Load friends list
        try {
          setFriendsLoading(true);
          const friendsData = await socialService.getFriends(targetUserId, 0, 9);
          setFriends(friendsData.content || []);
        } catch (err) {
          console.error('Failed to load friends:', err);
          setFriends([]);
        } finally {
          setFriendsLoading(false);
        }

        // Load common friends when viewing someone else
        if (!isCurrentUserProfile) {
          try {
            const [cf, cfCount] = await Promise.all([
              socialService.getCommonFriends(targetUserId, 0, 10),
              socialService.getCommonFriendsCount(targetUserId)
            ])
            setCommonFriends(cf.content || [])
            setCommonFriendsCount(cfCount)
          } catch (err) {
            console.error('Failed to load common friends:', err)
            setCommonFriends([])
            setCommonFriendsCount(0)
          }
        }
      } catch (error) {
        debugLogger.log('ProfilePage', 'Failed to load profile data', { userId: targetUserId, error });
        console.error('Failed to load profile data:', error);
          
          // Fallback: try to load basic user data
          try {
            if (isCurrentUserProfile && currentUser) {
              setProfileUser(currentUser);
            } else if (targetUserId) {
              const userData = await userService.getUserById(targetUserId);
              setProfileUser(userData);
            }
          } catch (fallbackError) {
            console.error('Failed to load fallback user data:', fallbackError);
          }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileData();
  }, [targetUserId, isCurrentUserProfile, currentUser, getUserSocialStats, checkFollowingStatus, checkFriendStatus, checkBlockStatus]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading profile...</h2>
          <p className="text-gray-500">Please wait while we fetch the profile information</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile not found</h1>
          <p className="text-gray-600 mb-8">The profile you're looking for doesn't exist or may have been removed.</p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    debugLogger.logButtonClick('Logout', { userId: currentUser?.id });
    try {
      await logout();
    } catch (error) {
      debugLogger.log('ProfilePage', 'Logout error', error);
      console.error('Logout error:', error);
    }
  };

  const handleProfileUpdated = (updatedUser: any) => {
    setProfileUser(updatedUser);
    setIsProfileEditModalOpen(false);
  };

  const handleFollow = async () => {
    if (!targetUserId) return;
    
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
        setIsFollowing(false);
        if (socialStats) {
          setSocialStats({ ...socialStats, followersCount: socialStats.followersCount - 1 });
        }
      } else {
        await followUser(targetUserId);
        setIsFollowing(true);
        if (socialStats) {
          setSocialStats({ ...socialStats, followersCount: socialStats.followersCount + 1 });
        }
      }
    } catch (err) {
      console.error('Follow/Unfollow error:', err);
    }
  };

  const handleFriendRequest = async () => {
    if (!targetUserId) return;
    
    try {
      await sendFriendRequest(targetUserId);
      setCanSendFriendReq(false);
      setFriendshipStatus('PENDING');
    } catch (err) {
      console.error('Friend request error:', err);
    }
  };

  const handleUnfriend = async () => {
    if (!targetUserId) return;
    try {
      await removeFriend(targetUserId);
      setIsFriend(false);
    } catch (err) {
      console.error('Unfriend error:', err);
    }
  };

  const handleBlock = async () => {
    if (!targetUserId) return;
    
    try {
      if (isBlocked) {
        await unblockUser(targetUserId);
        setIsBlocked(false);
      } else {
        await blockUser(targetUserId);
        setIsBlocked(true);
      }
    } catch (err) {
      console.error('Block/Unblock error:', err);
    }
  };

  const handleReaction = (postId: number, reaction: ReactionType) => {
    debugLogger.logButtonClick('React to Post on Profile', { postId, reaction });
    reactToPost(postId, reaction);
  };

  const handleUnreact = (postId: number) => {
    debugLogger.logButtonClick('Unreact to Post on Profile', { postId });
    unreactToPost(postId);
  };

  const handleComment = async (postId: number, content: string) => {
    debugLogger.logFormSubmit('Add Comment on Profile', { postId, content });
    try {
      await addComment(postId, content);
      debugLogger.log('ProfilePage', 'Comment added successfully', { postId });
    } catch (error) {
      debugLogger.log('ProfilePage', 'Failed to add comment', error);
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const handleShare = (postId: number) => {
    debugLogger.logButtonClick('Share Post on Profile', { postId });
    try {
      sharePost(postId);
      debugLogger.log('ProfilePage', 'Post shared successfully', { postId });
    } catch (error) {
      debugLogger.log('ProfilePage', 'Failed to share post', error);
      console.error('Failed to share post:', error);
    }
  };

  const userPosts = posts.filter(post => post.authorId === profileUser?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={false} showUserMenu={true} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 mb-6 overflow-hidden transform hover:shadow-3xl transition-all duration-300">
          <div className="h-64 relative overflow-hidden">
            {completeProfile?.coverUrl ? (
              <>
                <img
                  src={completeProfile.coverUrl}
                  alt="Cover photo"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </>
            ) : (
              <div className="h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30"></div>
                {/* Animated gradient orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
              </div>
            )}
            
            {isCurrentUserProfile && (
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-8">
              <div className="relative -mt-24 mb-4 lg:mb-0">
                <div className="w-40 h-40 rounded-3xl border-4 border-white bg-white shadow-2xl overflow-hidden relative group">
                  <Avatar
                    user={profileUser || undefined}
                    size="xl"
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                {isCurrentUserProfile && (
                  <button className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-xl transition-all duration-200 transform hover:scale-110">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
                {profileUser?.isVerified && (
                  <div className="absolute top-0 right-0 p-1.5 bg-blue-600 rounded-full shadow-lg border-2 border-white">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        {profileUser?.displayName || profileUser?.username}
                      </h1>
                    </div>
                    
                    <p className="text-lg text-gray-600 mb-3">@{profileUser?.username}</p>
                    
                    {profileUser?.bio && (
                      <div className="relative mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                        <div className="absolute top-2 left-2 text-blue-300">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-gray-700 leading-relaxed pl-6">{profileUser.bio}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                      {profileUser?.location && (
                        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium">{profileUser.location}</span>
                        </div>
                      )}
                      
                      {profileUser?.phone && (
                        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="font-medium">{profileUser.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Tham gia {new Date(profileUser?.createdAt || '').toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
              
                  <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
                    {isCurrentUserProfile ? (
                      <Button
                        onClick={() => {
                          debugLogger.logButtonClick('Open Profile Settings', { userId: profileUser?.id });
                          setShowSettingsModal(true);
                        }}
                        variant="primary"
                        size="md"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Cài đặt hồ sơ
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleFollow}
                          disabled={socialLoading || !!isBlocked}
                          variant={isFollowing ? "outline" : "primary"}
                          size="md"
                          className={isFollowing ? "border-2 border-gray-300 text-gray-700 hover:bg-gray-50" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"}
                        >
                          {socialLoading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Đang xử lý...
                            </div>
                          ) : (
                            <>
                              {isFollowing ? (
                                <>
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Bỏ theo dõi
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                  </svg>
                                  Theo dõi
                                </>
                              )}
                            </>
                          )}
                        </Button>

                        {!isFriend ? (
                          <Button
                            onClick={handleFriendRequest}
                            disabled={socialLoading || !!isBlocked || !canSendFriendReq}
                            variant="outline"
                            size="md"
                            className="border-2 border-green-300 text-green-700 hover:bg-green-50"
                          >
                            {socialLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                {!canSendFriendReq || friendshipStatus === 'PENDING' ? 'Đã gửi lời mời' : 'Kết bạn'}
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleUnfriend}
                            disabled={socialLoading || !!isBlocked}
                            variant="outline"
                            size="md"
                            className="border-2 border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Hủy kết bạn
                          </Button>
                        )}

                        <Button
                          onClick={handleBlock}
                          disabled={socialLoading}
                          variant="outline"
                          size="md"
                          className={isBlocked ? 'border-2 border-green-300 text-green-700 hover:bg-green-50' : 'border-2 border-red-300 text-red-700 hover:bg-red-50'}
                        >
                          {isBlocked ? (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Bỏ chặn
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                              </svg>
                              Chặn
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="text-2xl font-bold text-gray-900">
                        {completeProfile?.socialStats?.postsCount || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Bài viết</div>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/friends${!isCurrentUserProfile ? `/${targetUserId}` : ''}`)}
                      className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-2xl font-bold text-gray-900">
                        {completeProfile?.socialStats?.friendsCount || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Bạn bè</div>
                    </button>
                    
                    <button 
                      onClick={() => navigate(`/followers/${targetUserId}`)}
                      className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-2xl font-bold text-gray-900">
                        {completeProfile?.socialStats?.followersCount || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Người theo dõi</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Giới thiệu</h2>
              
              <div className="space-y-4">
                {profileUser?.bio ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{profileUser.bio}</p>
        </div>
                ) : (
                  <button className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 font-medium transition-colors">
                    Thêm tiểu sử
                  </button>
                )}

                {completeProfile?.educations && completeProfile.educations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">Học vấn</h3>
                    {completeProfile.educations.slice(0, 2).map((education) => (
                      <div key={education.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                        {education.imageUrl ? (
                          <img
                            src={education.imageUrl}
                            alt={`${education.schoolName} logo`}
                            className="w-8 h-8 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ${education.imageUrl ? 'hidden' : ''}`}>
                          <span className="text-blue-600 text-sm">🎓</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {education.schoolName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {education.degree} - {education.fieldOfStudy}
                          </p>
                          <p className="text-xs text-gray-500">
                            {education.isCurrent ? 'Hiện tại' : `${education.startDate} - ${education.endDate || 'Hiện tại'}`}
                          </p>
                        </div>
                      </div>
                    ))}
                    {completeProfile.educations.length > 2 && (
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        Xem thêm {completeProfile.educations.length - 2} trường khác
                      </button>
                    )}
                  </div>
                )}

                {completeProfile?.workExperiences && completeProfile.workExperiences.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">Kinh nghiệm làm việc</h3>
                    {completeProfile.workExperiences.slice(0, 2).map((work) => (
                      <div key={work.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                        {work.imageUrl ? (
                          <img
                            src={work.imageUrl}
                            alt={`${work.companyName} logo`}
                            className="w-8 h-8 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ${work.imageUrl ? 'hidden' : ''}`}>
                          <span className="text-green-600 text-sm">💼</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {work.companyName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {work.position}
                          </p>
                          <p className="text-xs text-gray-500">
                            {work.isCurrent ? 'Hiện tại' : `${work.startDate} - ${work.endDate || 'Hiện tại'}`}
                          </p>
                          {work.location && (
                            <p className="text-xs text-gray-500 truncate">
                              📍 {work.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {completeProfile.workExperiences.length > 2 && (
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        Xem thêm {completeProfile.workExperiences.length - 2} công ty khác
                      </button>
                    )}
                  </div>
                )}

                {/* Location */}
                {completeProfile?.locations && completeProfile.locations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">Địa điểm</h3>
                    {completeProfile.locations.slice(0, 2).map((location) => (
                      <div key={location.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                        {location.imageUrl ? (
                          <img
                            src={location.imageUrl}
                            alt={`${location.locationName} image`}
                            className="w-8 h-8 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 ${location.imageUrl ? 'hidden' : ''}`}>
                          <span className="text-purple-600 text-sm">
                            {location.locationType === 'hometown' ? '🏘️' : 
                             location.locationType === 'education' ? '🎓' :
                             location.locationType === 'work' ? '🏢' :
                             location.locationType === 'current' ? '🏠' : '📍'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {location.locationName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {location.locationType === 'hometown' ? 'Quê quán' :
                             location.locationType === 'education' ? 'Học tập' :
                             location.locationType === 'work' ? 'Làm việc' :
                             location.locationType === 'current' ? 'Hiện tại' : 'Khác'}
                          </p>
                          {location.address && (
                            <p className="text-xs text-gray-500 truncate">
                              {location.address}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {completeProfile.locations.length > 2 && (
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        Xem thêm {completeProfile.locations.length - 2} địa điểm khác
                      </button>
                    )}
                  </div>
                )}

                {/* Fallback to basic location */}
                {(!completeProfile?.locations || completeProfile.locations.length === 0) && profileUser?.location && (
                  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 text-sm">📍</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Đến từ</p>
                      <p className="text-xs text-gray-600 truncate">{profileUser.location}</p>
                    </div>
                  </div>
                )}

                {/* Personal Info */}
                <div className="space-y-2">
                  {profileUser?.website && (
                    <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm">🌐</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Website</p>
                        <a 
                          href={profileUser.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 truncate block"
                        >
                          {profileUser.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-sm">📅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Tham gia</p>
                      <p className="text-xs text-gray-600">
                        {new Date(profileUser?.createdAt || '').toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>

                {isCurrentUserProfile && (
                  <button 
                    onClick={() => setIsProfileEditModalOpen(true)}
                    className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                  >
                    Chỉnh sửa chi tiết
                  </button>
                )}
              </div>
            </div>

            {/* Photos Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-xl font-bold text-gray-900">Ảnh</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {userPhotos.length}
                  </span>
                </div>
                {userPhotos.length > 0 && (
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors">
                    Xem tất cả ảnh
                  </button>
                )}
              </div>
              
              {userPhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {userPhotos.slice(0, 9).map((photo, i) => (
                    <div 
                      key={i} 
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer relative transform hover:scale-105 transition-transform duration-300"
                    >
                      <img 
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Chưa có ảnh nào</p>
                  {isCurrentUserProfile && (
                    <p className="text-gray-400 text-xs mt-1">Ảnh của bạn sẽ xuất hiện ở đây</p>
                  )}
                </div>
              )}
            </div>

            {/* Friends Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Bạn bè</h2>
                <button 
                  onClick={() => navigate(`/friends${!isCurrentUserProfile ? `/${targetUserId}` : ''}`)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Xem tất cả bạn bè
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {completeProfile?.socialStats?.friendsCount || 0} người bạn
              </p>
              
              {friendsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : friends.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {friends.slice(0, 9).map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => navigate(`/profile/${friend.id}`)}
                      className="group aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all relative"
                    >
                      {friend.avatarUrl ? (
                        <img 
                          src={friend.avatarUrl} 
                          alt={friend.displayName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            {friend.displayName?.charAt(0).toUpperCase() || friend.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-2 w-full">
                          <p className="text-white text-xs font-semibold truncate">{friend.displayName}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Chưa có bạn bè</p>
                </div>
              )}
            </div>

            {!isCurrentUserProfile && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-gray-900">Bạn chung</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{commonFriendsCount}</span>
                  </div>
                  {commonFriendsCount > 0 && (
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Xem tất cả</button>
                  )}
                </div>

                {commonFriends && commonFriends.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {commonFriends.slice(0, 6).map((u, idx) => (
                      <button
                        key={u.id}
                        onClick={() => navigate(`/profile/${u.id}`)}
                        className="group flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                      >
                        <div className="relative">
                          <Avatar user={{ userId: u.id, displayName: u.displayName, avatarUrl: u.avatarUrl }} size="md" />
                          <span className="absolute -bottom-0.5 -right-0.5 inline-block w-3 h-3 bg-white rounded-full">
                            <span className="block w-full h-full rounded-full bg-green-500" />
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700">{u.displayName}</p>
                          <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                        </div>
                      </button>
                    ))}
                    {commonFriendsCount > 6 && (
                      <div className="flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-200">
                        <span className="text-sm font-semibold text-gray-500">+{commonFriendsCount - 6} nữa</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3M5 13a4 4 0 110-8 4 4 0 010 8zm14 6a4 4 0 10-8 0 4 4 0 008 0zM7 21a4 4 0 00-4-4h0a4 4 0 014 4zM17 7a4 4 0 014-4h0a4 4 0 01-4 4z"/></svg>
                    <span>Không có bạn chung</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Section (Facebook style) */}
            {isCurrentUserProfile && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Avatar
                      user={profileUser || undefined}
                      size="md"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <button className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-left text-gray-500 transition-colors">
                      Bạn đang nghĩ gì?
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Video trực tiếp</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Ảnh/video</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Cảm xúc</span>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <nav className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => {
                debugLogger.logButtonClick('Profile Tab', { tab: 'posts' });
                setActiveTab('posts');
              }}
              className={`flex-shrink-0 py-4 px-6 text-center font-semibold text-sm transition-all duration-200 ${
                activeTab === 'posts'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Bài viết</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'posts' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>
                      {completeProfile?.socialStats?.postsCount || 0}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => {
                debugLogger.logButtonClick('Profile Tab', { tab: 'education' });
                setActiveTab('education');
              }}
              className={`flex-shrink-0 py-4 px-6 text-center font-semibold text-sm transition-all duration-200 ${
                activeTab === 'education'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <span>Học vấn</span>
                {completeProfile?.educations && completeProfile.educations.length > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === 'education' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {completeProfile.educations.length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => {
                debugLogger.logButtonClick('Profile Tab', { tab: 'experience' });
                setActiveTab('experience');
              }}
              className={`flex-shrink-0 py-4 px-6 text-center font-semibold text-sm transition-all duration-200 ${
                activeTab === 'experience'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <span>Kinh nghiệm</span>
                {completeProfile?.workExperiences && completeProfile.workExperiences.length > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === 'experience' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {completeProfile.workExperiences.length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => {
                debugLogger.logButtonClick('Profile Tab', { tab: 'interests' });
                setActiveTab('interests');
              }}
              className={`flex-shrink-0 py-4 px-6 text-center font-semibold text-sm transition-all duration-200 ${
                activeTab === 'interests'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Sở thích</span>
                {completeProfile?.interests && completeProfile.interests.length > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === 'interests' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {completeProfile.interests.length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => {
                debugLogger.logButtonClick('Profile Tab', { tab: 'locations' });
                setActiveTab('locations');
              }}
              className={`flex-shrink-0 py-4 px-6 text-center font-semibold text-sm transition-all duration-200 ${
                activeTab === 'locations'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Địa điểm</span>
                {completeProfile?.locations && completeProfile.locations.length > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === 'locations' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {completeProfile.locations.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {isLoading ? (
              <EmptyState type="loading" title="Đang tải bài viết..." />
                ) : (completeProfile?.posts?.posts && completeProfile.posts.posts.length > 0) ? (
                  completeProfile.posts.posts.map((post) => {
                    // Add author information to post
                    const postWithAuthor = {
                      ...post,
                      authorId: completeProfile.userId,
                      authorUsername: completeProfile.username,
                      authorDisplayName: completeProfile.displayName,
                      authorAvatarUrl: completeProfile.avatarUrl,
                      author: {
                        id: completeProfile.userId,
                        username: completeProfile.username,
                        displayName: completeProfile.displayName,
                        avatarUrl: completeProfile.avatarUrl,
                        isVerified: completeProfile.verified
                      }
                    };
                    
                    return (
                      <PostCard
                        key={post.id}
                        post={postWithAuthor}
                        onReaction={handleReaction}
                        onUnreact={handleUnreact}
                        onComment={handleComment}
                        onShare={handleShare}
                        currentUser={currentUser}
                      />
                    );
                  })
            ) : (
              isCurrentUserProfile ? (
                <EmptyState 
                  type="no-posts" 
                  onButtonClick={() => window.location.href = '/'} 
                />
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-16 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có bài viết nào</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {profileUser?.displayName || 'Người dùng này'} chưa đăng bài viết nào.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {activeTab === 'education' && (
          <EducationSection userId={profileUser?.id} isEditable={isCurrentUserProfile || false} />
        )}

        {activeTab === 'experience' && (
          <WorkExperienceSection userId={profileUser?.id} isEditable={isCurrentUserProfile || false} />
        )}

        {activeTab === 'interests' && (
          <InterestsSection userId={profileUser?.id} isEditable={isCurrentUserProfile || false} />
        )}

        {activeTab === 'locations' && (
          <LocationsSection userId={profileUser?.id} isEditable={isCurrentUserProfile || false} />
        )}
          </div>
        </div>

        {/* Social Error Display */}
        {socialError && !isCurrentUserProfile && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Social Action Error</h3>
                <p className="text-sm text-red-700 mb-2">{socialError}</p>
                <button
                  onClick={clearError}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {isCurrentUserProfile && (
          <ProfileSettingsModal
            isVisible={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            user={profileUser}
          />
        )}

        {/* Profile Edit Modal */}
        {isCurrentUserProfile && profileUser && (
          <ProfileEditModalV2
            isVisible={isProfileEditModalOpen}
            onClose={() => setIsProfileEditModalOpen(false)}
            user={profileUser}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </main>
    </div>
  );
};

export default ProfilePage;

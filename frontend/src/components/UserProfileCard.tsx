import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Button } from './ui/Button';
import { useSocial } from '../hooks/useSocial';
import { useAuth } from '../hooks/useAuth';
import { debugLogger } from '../utils/debugLogger';
import type { SocialStats } from '../types';

interface UserProfileCardProps {
  user: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    bio?: string | null;
    location?: string | null;
    isOnline?: boolean;
    lastSeen?: string;
    createdAt?: string;
  };
  isVisible: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  isVisible,
  onClose,
  position = { x: 0, y: 0 },
  className = ''
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const {
    isLoading,
    error,
    followUser,
    unfollowUser,
    sendFriendRequest,
    blockUser,
    unblockUser,
    checkFollowingStatus,
    checkFriendStatus,
    checkBlockStatus,
    getUserSocialStats,
    clearError
  } = useSocial();

  const [socialStats, setSocialStats] = useState<SocialStats | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDelay, setShowDelay] = useState(false);

  // Handle show delay and hover behavior
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowDelay(true);
      }, 300); // 300ms delay before showing
      
      return () => clearTimeout(timer);
    } else {
      setShowDelay(false);
      setIsHovered(false);
    }
  }, [isVisible]);

  // Handle auto-close when not hovered
  useEffect(() => {
    if (showDelay && !isHovered) {
      const timer = setTimeout(() => {
        onClose();
      }, 500); // 500ms delay before closing
      
      return () => clearTimeout(timer);
    }
  }, [showDelay, isHovered, onClose]);

  // Load social data when component becomes visible
  useEffect(() => {
    if (isVisible && user.id) {
      const loadSocialData = async () => {
        setIsLoadingStats(true);
        try {
          const [stats, followingStatus, friendStatus, blockStatus] = await Promise.all([
            getUserSocialStats(user.id),
            checkFollowingStatus(user.id),
            checkFriendStatus(user.id),
            checkBlockStatus(user.id)
          ]);
          
          setSocialStats(stats);
          setIsFollowing(followingStatus);
          setIsBlocked(blockStatus);
          
          debugLogger.log('UserProfileCard', 'Social data loaded', {
            userId: user.id,
            stats,
            isFollowing: followingStatus,
            isFriend: friendStatus,
            isBlocked: blockStatus
          });
        } catch (err) {
          debugLogger.log('UserProfileCard', 'Failed to load social data', {
            userId: user.id,
            error: err
          });
        } finally {
          setIsLoadingStats(false);
        }
      };

      loadSocialData();
    }
  }, [isVisible, user.id, getUserSocialStats, checkFollowingStatus, checkFriendStatus, checkBlockStatus]);

  // Don't show profile card for current user
  if (currentUser?.id === user.id) {
    return null;
  }

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(user.id);
        setIsFollowing(false);
        if (socialStats) {
          setSocialStats({ ...socialStats, followersCount: socialStats.followersCount - 1 });
        }
      } else {
        await followUser(user.id);
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
    try {
      await sendFriendRequest(user.id);
      // Note: In a real app, you might want to show a pending state
    } catch (err) {
      console.error('Friend request error:', err);
    }
  };

  const handleBlock = async () => {
    try {
      if (isBlocked) {
        await unblockUser(user.id);
        setIsBlocked(false);
      } else {
        await blockUser(user.id);
        setIsBlocked(true);
      }
    } catch (err) {
      console.error('Block/Unblock error:', err);
    }
  };

  const handleViewProfile = () => {
    navigate(`/profile/${user.id}`);
    onClose();
  };

  // Don't show if not visible or delay hasn't passed
  if (!isVisible || !showDelay) return null;

  return (
    <div
      className={`fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm bg-white/95 w-72 transition-all duration-300 ease-out ${className}`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg p-2 pb-4">
        <button
          onClick={onClose}
          className="absolute top-1.5 right-1.5 text-white/80 hover:text-white transition-colors p-0.5 rounded-full hover:bg-white/20"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Avatar user={user} size="sm" />
            {user.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div className="text-white">
            <h3 className="font-semibold text-sm">{user.displayName}</h3>
            <p className="text-white/80 text-xs">@{user.username}</p>
            {user.isOnline && (
              <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white mt-0.5">
                <div className="w-1 h-1 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Online
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-2 -mt-2">
        {/* Bio */}
        {user.bio && (
          <div className="mb-2 bg-gray-50 rounded-md p-1.5">
            <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{user.bio}</p>
          </div>
        )}

        {/* Additional Info */}
        <div className="mb-2 space-y-0.5">
          {user.location && (
            <div className="flex items-center text-xs text-gray-600">
              <svg className="w-3 h-3 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{user.location}</span>
            </div>
          )}
          {user.createdAt && (
            <div className="flex items-center text-xs text-gray-600">
              <svg className="w-3 h-3 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Social Stats */}
        {isLoadingStats ? (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        ) : socialStats ? (
          <div className="grid grid-cols-3 gap-1 mb-2">
            <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-md p-1.5">
              <div className="text-xs font-bold text-blue-600">{socialStats.followersCount}</div>
              <div className="text-xs text-blue-500">Followers</div>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-md p-1.5">
              <div className="text-xs font-bold text-purple-600">{socialStats.followingCount}</div>
              <div className="text-xs text-purple-500">Following</div>
            </div>
            <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-md p-1.5">
              <div className="text-xs font-bold text-green-600">{socialStats.postsCount}</div>
              <div className="text-xs text-green-500">Posts</div>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="space-y-1.5">
          {/* Follow/Unfollow Button */}
          {!isBlocked && (
            <Button
              onClick={handleFollow}
              disabled={isLoading}
              variant={isFollowing ? "outline" : "primary"}
              className={`w-full h-7 text-xs font-medium transition-all duration-200 ${
                isFollowing 
                  ? 'border border-blue-200 text-blue-600 hover:bg-blue-50' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                isFollowing ? 'Following' : 'Follow'
              )}
            </Button>
          )}

          {/* View Profile Button */}
          <Button
            onClick={handleViewProfile}
            variant="outline"
            className="w-full h-7 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition-all duration-200"
          >
            View Profile
          </Button>

          {/* Block/Unblock Button */}
          <Button
            onClick={handleBlock}
            disabled={isLoading}
            variant="outline"
            className={`w-full h-7 border text-xs font-medium transition-all duration-200 ${
              isBlocked 
                ? 'border-green-200 text-green-600 hover:bg-green-50' 
                : 'border-red-200 text-red-600 hover:bg-red-50'
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
            ) : (
              isBlocked ? 'Unblock' : 'Block'
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-2 p-1.5 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start space-x-1">
              <svg className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-xs text-red-600 font-medium">{error}</p>
                <button
                  onClick={clearError}
                  className="text-xs text-red-500 hover:text-red-700 mt-0.5"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

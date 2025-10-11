import React, { useState, useEffect } from 'react';
import { useSocial } from '../hooks/useSocial';
import { useAuth } from '../hooks/useAuth';
import { debugLogger } from '../utils/debugLogger';

interface SocialButtonProps {
  targetUserId: number;
  targetUserName?: string;
  className?: string;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  targetUserId,
  targetUserName = 'User',
  className = ''
}) => {
  const { user } = useAuth();
  const {
    isLoading,
    error,
    followUser,
    unfollowUser,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    sharePost,
    checkFollowingStatus,
    checkFriendStatus,
    checkBlockStatus,
    clearError
  } = useSocial();

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isFriend, setIsFriend] = useState<boolean | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
  const [showActions, setShowActions] = useState(false);

  // Load social status when component mounts
  useEffect(() => {
    const loadSocialStatus = async () => {
      try {
        const [followingStatus, friendStatus, blockStatus] = await Promise.all([
          checkFollowingStatus(targetUserId),
          checkFriendStatus(targetUserId),
          checkBlockStatus(targetUserId)
        ]);
        
        setIsFollowing(followingStatus);
        setIsFriend(friendStatus);
        setIsBlocked(blockStatus);
        
        debugLogger.log('SocialButton', 'Social status loaded', {
          targetUserId,
          isFollowing: followingStatus,
          isFriend: friendStatus,
          isBlocked: blockStatus
        });
      } catch (err) {
        debugLogger.log('SocialButton', 'Failed to load social status', {
          targetUserId,
          error: err
        });
      }
    };

    loadSocialStatus();
  }, [targetUserId, checkFollowingStatus, checkFriendStatus, checkBlockStatus]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
        setIsFollowing(false);
      } else {
        await followUser(targetUserId);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow/Unfollow error:', err);
    }
  };

  const handleFriendRequest = async () => {
    try {
      await sendFriendRequest(targetUserId);
      // Note: In a real app, you might want to show a pending state
    } catch (err) {
      console.error('Friend request error:', err);
    }
  };

  const handleBlock = async () => {
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

  const handleShare = async () => {
    try {
      // This would typically be called with a specific post ID
      // For demo purposes, we'll use a placeholder
      await sharePost(1, `Sharing ${targetUserName}'s profile`);
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  // Don't show social buttons for current user
  if (user?.id === targetUserId) {
    return null;
  }

  if (isLoading && isFollowing === null) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-md h-8 w-20"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Action Button */}
      <div className="flex items-center space-x-2">
        {isBlocked ? (
          <button
            onClick={handleBlock}
            disabled={isLoading}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? '...' : 'Unblock'}
          </button>
        ) : (
          <>
            {/* Follow/Unfollow Button */}
            <button
              onClick={handleFollow}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
            </button>

            {/* More Actions Button */}
            <button
              onClick={() => setShowActions(!showActions)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ⋯
            </button>
          </>
        )}
      </div>

      {/* Dropdown Actions */}
      {showActions && !isBlocked && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={handleFriendRequest}
              disabled={isLoading}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isLoading ? '...' : 'Send Friend Request'}
            </button>
            
            <button
              onClick={handleShare}
              disabled={isLoading}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isLoading ? '...' : 'Share Profile'}
            </button>
            
            <hr className="my-1" />
            
            <button
              onClick={handleBlock}
              disabled={isLoading}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {isLoading ? '...' : 'Block User'}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={clearError}
            className="text-xs text-red-500 hover:text-red-700 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

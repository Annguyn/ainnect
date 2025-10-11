import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/ui';
import { EmptyState } from '../components/EmptyState';
import { socialService, User } from '../services/socialService';
import { useAuth } from '../hooks/useAuth';
import { debugLogger } from '../utils/debugLogger';

export const FollowersPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, logout } = useAuth();
  const [followers, setFollowers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [followingStatus, setFollowingStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    loadFollowers();
  }, [currentUser, navigate, userId]);

  const loadFollowers = async (page: number = 0) => {
    try {
      setIsLoading(true);
      const targetUserId = userId ? parseInt(userId) : currentUser?.id;
      if (!targetUserId) return;

      const response = await socialService.getFollowers(targetUserId, page, 20);
      
      if (page === 0) {
        setFollowers(response.content);
      } else {
        setFollowers(prev => [...prev, ...response.content]);
      }
      
      setHasMore(response.hasNext);
      setCurrentPage(page);
      
      debugLogger.log('FollowersPage', 'Loaded followers', {
        userId: targetUserId,
        page,
        count: response.content.length,
        hasMore: response.hasNext
      });
    } catch (error) {
      debugLogger.log('FollowersPage', 'Failed to load followers', error);
      console.error('Failed to load followers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      setIsProcessing(userId);
      await socialService.followUser({ followeeId: userId });
      
      // Update local state - mark as following
      setFollowingStatus(prev => ({ ...prev, [userId]: true }));
      
      debugLogger.log('FollowersPage', 'User followed', { userId });
    } catch (error) {
      debugLogger.log('FollowersPage', 'Failed to follow user', error);
      console.error('Failed to follow user:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      setIsProcessing(userId);
      await socialService.unfollowUser(userId);
      
      // Update local state - mark as not following
      setFollowingStatus(prev => ({ ...prev, [userId]: false }));
      
      debugLogger.log('FollowersPage', 'User unfollowed', { userId });
    } catch (error) {
      debugLogger.log('FollowersPage', 'Failed to unfollow user', error);
      console.error('Failed to unfollow user:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadFollowers(currentPage + 1);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUserClick = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  if (!currentUser) {
    return null;
  }

  const isCurrentUserProfile = !userId || userId === currentUser.id.toString();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={false} showUserMenu={true} onLogout={handleLogout} />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isCurrentUserProfile ? 'Người theo dõi của bạn' : 'Người theo dõi'}
            </h1>
          </div>
          <p className="text-gray-600">
            {isCurrentUserProfile 
              ? 'Những người đang theo dõi bạn' 
              : 'Những người đang theo dõi người dùng này'
            }
          </p>
        </div>

        {/* Content */}
        {isLoading && followers.length === 0 ? (
          <EmptyState type="loading" title="Đang tải danh sách người theo dõi..." />
        ) : followers.length > 0 ? (
          <div className="space-y-4">
            {followers.map((follower) => (
              <div key={follower.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleUserClick(follower.id)}
                  >
                    <Avatar
                      user={follower}
                      size="lg"
                      className="w-16 h-16"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleUserClick(follower.id)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {follower.displayName}
                      </h3>
                      <p className="text-sm text-gray-500">@{follower.username}</p>
                    </div>
                    
                    {follower.bio && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {follower.bio}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2">
                      {follower.isVerified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Đã xác thực
                        </span>
                      )}
                      {follower.isPrivate && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Riêng tư
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!isCurrentUserProfile && follower.id !== currentUser.id && (
                    <div className="flex space-x-3">
                      {followingStatus[follower.id] ? (
                        <Button
                          onClick={() => handleUnfollow(follower.id)}
                          disabled={isProcessing === follower.id}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isProcessing === follower.id ? 'Đang xử lý...' : 'Đang theo dõi'}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleFollow(follower.id)}
                          disabled={isProcessing === follower.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isProcessing === follower.id ? 'Đang xử lý...' : 'Theo dõi'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Đang tải...' : 'Tải thêm'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState 
            type="no-friends" 
            title="Không có người theo dõi"
            description={isCurrentUserProfile 
              ? "Bạn chưa có người theo dõi nào." 
              : "Người dùng này chưa có người theo dõi nào."
            }
          />
        )}
      </main>
    </div>
  );
};

export default FollowersPage;

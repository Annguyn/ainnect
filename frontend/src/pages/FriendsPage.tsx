import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/ui';
import { EmptyState } from '../components/EmptyState';
import { socialService } from '../services/socialService';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { debugLogger } from '../utils/debugLogger';

export const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, logout } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    loadFriends();
  }, [currentUser, navigate, userId]);

  const loadFriends = async (page: number = 0) => {
    try {
      setIsLoading(true);
      const targetUserId = userId ? parseInt(userId) : currentUser?.id;
      if (!targetUserId) return;

      const response: any = await socialService.getFriends(targetUserId, page, 20);

      // Normalize 2 formats:
      // A) Paginated: { content: User[], hasNext }
      // B) Wrapped: { result, data: { friendships: [...] } }
      let newFriends: User[] = [];
      let hasNext = false;

      if (Array.isArray(response?.content)) {
        newFriends = response.content as User[];
        hasNext = !!response.hasNext;
      } else if (Array.isArray(response?.data?.friendships)) {
        newFriends = response.data.friendships.map((f: any) => ({
          id: f.userId,
          username: f.username,
          displayName: f.displayName,
          avatarUrl: f.avatarUrl,
          email: '',
          isActive: true,
          bio: '',
        }));
        hasNext = !!response.data?.hasNext;
      }

      if (page === 0) {
        setFriends(newFriends);
      } else {
        setFriends(prev => [...prev, ...newFriends]);
      }

      setHasMore(!!hasNext);
      setCurrentPage(page);

      debugLogger.log('FriendsPage', 'Loaded friends', {
        userId: targetUserId,
        page,
        count: newFriends.length,
        hasMore: hasNext
      });
    } catch (error) {
      debugLogger.log('FriendsPage', 'Failed to load friends', error);
      console.error('Failed to load friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bạn bè này?')) {
      return;
    }

    try {
      setIsProcessing(friendId);
      await socialService.removeFriend(friendId);
      
      // Remove from friends list
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
      
      debugLogger.log('FriendsPage', 'Friend removed', { friendId });
    } catch (error) {
      debugLogger.log('FriendsPage', 'Failed to remove friend', error);
      console.error('Failed to remove friend:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadFriends(currentPage + 1);
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
              {isCurrentUserProfile ? 'Bạn bè của bạn' : 'Bạn bè'}
            </h1>
          </div>
          <p className="text-gray-600">
            {isCurrentUserProfile 
              ? 'Danh sách bạn bè của bạn' 
              : 'Danh sách bạn bè của người dùng này'
            }
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-4 mb-8">
          <Link to="/friend-requests">
            <Button className="flex-1">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M3 12h18M3 21h18" />
              </svg>
              Lời mời kết bạn
            </Button>
          </Link>
          <Link to="/blocked-users">
            <Button className="flex-1">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M3 12h18M3 21h18" />
              </svg>
              Người dùng bị chặn
            </Button>
          </Link>
        </div>

        {/* Content */}
        {isLoading && friends.length === 0 ? (
          <EmptyState type="loading" title="Đang tải danh sách bạn bè..." />
        ) : friends.length > 0 ? (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div key={friend.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleUserClick(friend.id)}
                  >
                    <Avatar
                      user={friend}
                      size="lg"
                      className="w-16 h-16"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleUserClick(friend.id)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {friend.displayName}
                      </h3>
                      <p className="text-sm text-gray-500">@{friend.username}</p>
                    </div>
                    
                    {friend.bio && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {friend.bio}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2">
                      {friend.isVerified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Đã xác thực
                        </span>
                      )}
                      {friend.isPrivate && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Riêng tư
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Bạn bè
                      </span>
                    </div>
                  </div>
                  
                  {isCurrentUserProfile && friend.id !== currentUser.id && (
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleRemoveFriend(friend.id)}
                        disabled={isProcessing === friend.id}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isProcessing === friend.id ? 'Đang xử lý...' : 'Xóa bạn bè'}
                      </Button>
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
            title="Chưa có bạn bè"
            description={isCurrentUserProfile 
              ? "Bạn chưa có bạn bè nào." 
              : "Người dùng này chưa có bạn bè nào."
            }
          />
        )}
      </main>
    </div>
  );
};

export default FriendsPage;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <Header showSearch={false} showUserMenu={true} onLogout={handleLogout} />
      
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-3 hover:bg-white/80 rounded-xl transition-all shadow-sm hover:shadow-md border border-gray-200/50 backdrop-blur-sm group"
              >
                <svg className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
                  {isCurrentUserProfile ? 'Bạn bè của bạn' : 'Danh sách bạn bè'}
                </h1>
                <p className="text-gray-600 mt-1 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>{friends.length} bạn bè</span>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/friend-requests" className="group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-200 transition-shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Lời mời kết bạn</h3>
                    <p className="text-sm text-gray-500">Quản lý lời mời</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link to="/blocked-users" className="group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg hover:border-red-300 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-red-200 transition-shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">Người bị chặn</h3>
                    <p className="text-sm text-gray-500">Danh sách chặn</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-100 mb-1">Tổng số</p>
                  <p className="text-3xl font-bold">{friends.length}</p>
                  <p className="text-sm text-primary-100 mt-1">Bạn bè</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading && friends.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-600 mb-4"></div>
              <p className="text-gray-500 font-medium">Đang tải danh sách bạn bè...</p>
            </div>
          </div>
        ) : friends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {friends.map((friend) => (
              <div 
                key={friend.id} 
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 hover:shadow-xl hover:border-primary-200 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div 
                      className="cursor-pointer relative"
                      onClick={() => handleUserClick(friend.id)}
                    >
                      <Avatar
                        user={friend}
                        size="lg"
                        className="w-20 h-20 ring-4 ring-white shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div 
                        className="cursor-pointer"
                        onClick={() => handleUserClick(friend.id)}
                      >
                        <h3 className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors truncate">
                          {friend.displayName}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">@{friend.username}</p>
                      </div>
                      
                      {friend.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {friend.bio}
                        </p>
                      )}
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        {friend.isVerified && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Bạn bè
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {isCurrentUserProfile && friend.id !== currentUser.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-3">
                      <button
                        onClick={() => navigate(`/messages?userId=${friend.id}`)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Nhắn tin</span>
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        disabled={isProcessing === friend.id}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-300 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                        </svg>
                        <span>{isProcessing === friend.id ? '...' : 'Xóa'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có bạn bè</h3>
            <p className="text-gray-500 mb-6">
              {isCurrentUserProfile 
                ? "Hãy kết nối với mọi người để mở rộng mạng lưới bạn bè của bạn!" 
                : "Người dùng này chưa có bạn bè nào."
              }
            </p>
            {isCurrentUserProfile && (
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg font-medium"
              >
                Tìm kiếm bạn bè
              </button>
            )}
          </div>
        )}
        
        {/* Load More Button */}
        {hasMore && friends.length > 0 && (
          <div className="text-center py-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-8 py-3 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-primary-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang tải...</span>
                </span>
              ) : (
                'Tải thêm bạn bè'
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FriendsPage;

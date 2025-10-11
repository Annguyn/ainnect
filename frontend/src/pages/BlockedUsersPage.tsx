import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/ui';
import { EmptyState } from '../components/EmptyState';
import { socialService, User } from '../services/socialService';
import { useAuth } from '../hooks/useAuth';
import { debugLogger } from '../utils/debugLogger';

export const BlockedUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    loadBlockedUsers();
  }, [currentUser, navigate]);

  const loadBlockedUsers = async (page: number = 0) => {
    try {
      setIsLoading(true);
      const response = await socialService.getBlockedUsers(page, 20);
      
      if (page === 0) {
        setBlockedUsers(response.content);
      } else {
        setBlockedUsers(prev => [...prev, ...response.content]);
      }
      
      setHasMore(response.hasNext);
      setCurrentPage(page);
      
      debugLogger.log('BlockedUsersPage', 'Loaded blocked users', {
        page,
        count: response.content.length,
        hasMore: response.hasNext
      });
    } catch (error) {
      debugLogger.log('BlockedUsersPage', 'Failed to load blocked users', error);
      console.error('Failed to load blocked users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblockUser = async (userId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn bỏ chặn người dùng này?')) {
      return;
    }

    try {
      setIsProcessing(userId);
      await socialService.unblockUser(userId);
      
      // Remove from blocked users list
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
      
      debugLogger.log('BlockedUsersPage', 'User unblocked', { userId });
    } catch (error) {
      debugLogger.log('BlockedUsersPage', 'Failed to unblock user', error);
      console.error('Failed to unblock user:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadBlockedUsers(currentPage + 1);
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

  if (!currentUser) {
    return null;
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Người dùng đã chặn</h1>
          </div>
          <p className="text-gray-600">
            Danh sách những người dùng bạn đã chặn
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-700 font-medium">Lưu ý</span>
          </div>
          <p className="text-yellow-700 text-sm mt-2">
            Những người dùng bị chặn sẽ không thể xem nội dung của bạn, gửi tin nhắn hoặc tương tác với bạn.
          </p>
        </div>

        {/* Content */}
        {isLoading && blockedUsers.length === 0 ? (
          <EmptyState type="loading" title="Đang tải danh sách người dùng đã chặn..." />
        ) : blockedUsers.length > 0 ? (
          <div className="space-y-4">
            {blockedUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="opacity-50">
                    <Avatar
                      user={user}
                      size="lg"
                      className="w-16 h-16"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 opacity-50">
                      {user.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 opacity-50">@{user.username}</p>
                    
                    {user.bio && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2 opacity-50">
                        {user.bio}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2">
                      {user.isVerified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 opacity-50">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Đã xác thực
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                        </svg>
                        Đã chặn
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleUnblockUser(user.id)}
                      disabled={isProcessing === user.id}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessing === user.id ? 'Đang xử lý...' : 'Bỏ chặn'}
                    </Button>
                  </div>
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
            title="Chưa chặn ai"
            description="Bạn chưa chặn người dùng nào."
          />
        )}
      </main>
    </div>
  );
};

export default BlockedUsersPage;

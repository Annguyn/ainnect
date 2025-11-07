import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Avatar } from '../components/Avatar';
import { socialService, Friendship } from '../services/socialService';
import { useAuth } from '../hooks/useAuth';
import { debugLogger } from '../utils/debugLogger';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const FriendRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, logout } = useAuth();
  const [friendRequests, setFriendRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    loadFriendRequests();
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'sent') {
      setActiveTab('sent');
    }
  }, [currentUser, navigate, location.search]);

  const loadFriendRequests = async () => {
    try {
      setIsLoading(true);
      const [receivedResponse, sentResponse] = await Promise.all([
        socialService.getFriendRequests(0, 50),
        socialService.getSentFriendRequests(0, 50)
      ]);
      
      let normalizedReceived: any[] = [];
      const rawReceived: any = receivedResponse as any;
      if (Array.isArray(rawReceived?.content)) {
        normalizedReceived = rawReceived.content;
      } else if (Array.isArray(rawReceived?.data?.friendships)) {
        normalizedReceived = rawReceived.data.friendships.map((f: any) => ({
          id: f.friendshipId || 0,
          status: (f.status || 'PENDING').toUpperCase(),
          createdAt: f.createdAt,
          requester: {
            id: f.userId,
            username: f.username,
            displayName: f.displayName,
            avatarUrl: f.avatarUrl,
          },
        }));
      }
      setFriendRequests(normalizedReceived);

      let normalizedSent: any[] = [];
      const rawAny: any = sentResponse as any;
      if (Array.isArray(rawAny?.content)) {
        normalizedSent = rawAny.content;
      } else if (Array.isArray(rawAny?.data?.friendships)) {
        normalizedSent = rawAny.data.friendships.map((f: any) => ({
          id: f.friendshipId || 0,
          status: (f.status || 'PENDING').toUpperCase(),
          createdAt: f.createdAt,
          addressee: {
            id: f.userId,
            username: f.username,
            displayName: f.displayName,
            avatarUrl: f.avatarUrl,
          },
        }));
      }
      setSentRequests(normalizedSent);
      
      debugLogger.log('FriendRequestsPage', 'Loaded friend requests');
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (friendshipIdOrUserId: number, userIdFallback?: number) => {
    try {
      setIsProcessing(friendshipIdOrUserId);
      const otherUserId = userIdFallback ?? friendshipIdOrUserId;
      await socialService.acceptFriendRequest({ otherUserId });
      setFriendRequests(prev => prev.filter((req: any) => (req.friendshipId || req.id) !== friendshipIdOrUserId));
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectRequest = async (friendshipIdOrUserId: number, userIdFallback?: number) => {
    try {
      setIsProcessing(friendshipIdOrUserId);
      const otherUserId = userIdFallback ?? friendshipIdOrUserId;
      await socialService.rejectFriendRequest({ otherUserId });
      setFriendRequests(prev => prev.filter((req: any) => (req.friendshipId || req.id) !== friendshipIdOrUserId));
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancelRequest = async (friendshipId: number, otherUserId?: number) => {
    try {
      setIsProcessing(friendshipId);
      if (otherUserId) {
        await socialService.rejectFriendRequest({ otherUserId });
      }
      setSentRequests(prev => prev.filter((req: any) => (req.id || req.friendshipId) !== friendshipId));
    } catch (error) {
      console.error('Failed to cancel friend request:', error);
    } finally {
      setIsProcessing(null);
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

  if (!currentUser) return null;

  const currentRequests = activeTab === 'received' ? friendRequests : sentRequests;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30">
      <Header showSearch={false} showUserMenu={true} onLogout={handleLogout} />
      
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Header with Gradient */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-3 hover:bg-white/80 rounded-xl transition-all shadow-sm hover:shadow-md border border-gray-200/50 backdrop-blur-sm group"
              >
                <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Lời mời kết bạn
                </h1>
                <p className="text-gray-600 mt-1">Quản lý lời mời kết bạn của bạn</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-100 mb-1">Lời mời nhận được</p>
                  <p className="text-4xl font-bold">{friendRequests.length}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100 mb-1">Lời mời đã gửi</p>
                  <p className="text-4xl font-bold">{sentRequests.length}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2h4a1 1 0 100-2h-4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-2 mb-6">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('received')}
              className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'received'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                <span>Nhận được</span>
                {friendRequests.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'received' ? 'bg-white/30' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {friendRequests.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'sent'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2h4a1 1 0 100-2h-4z" />
                </svg>
                <span>Đã gửi</span>
                {sentRequests.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'sent' ? 'bg-white/30' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {sentRequests.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mb-4"></div>
              <p className="text-gray-500 font-medium">Đang tải lời mời...</p>
            </div>
          </div>
        ) : currentRequests.length > 0 ? (
          <div className="space-y-4">
            {currentRequests.map((request: any) => {
              const user = activeTab === 'received' ? request.requester : request.addressee;
              const requestId = request.id || request.friendshipId || 0;
              
              return (
                <div 
                  key={requestId}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      {/* User Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div 
                          className="cursor-pointer relative"
                          onClick={() => navigate(`/profile/${user?.id}`)}
                        >
                          <Avatar
                            user={user}
                            size="lg"
                            className="w-16 h-16 ring-4 ring-white shadow-lg"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 border-4 border-white rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div 
                            className="cursor-pointer"
                            onClick={() => navigate(`/profile/${user?.id}`)}
                          >
                            <h3 className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors truncate">
                              {user?.displayName || 'Unknown'}
                            </h3>
                            <p className="text-sm text-gray-500">@{user?.username || 'unknown'}</p>
                          </div>
                          
                          {request.createdAt && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>
                                {(() => {
                                  try {
                                    const date = new Date(request.createdAt);
                                    if (isNaN(date.getTime())) return 'Vừa xong';
                                    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
                                  } catch {
                                    return 'Vừa xong';
                                  }
                                })()}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        {activeTab === 'received' ? (
                          <>
                            <button
                              onClick={() => handleAcceptRequest(requestId, user?.id)}
                              disabled={isProcessing === requestId}
                              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{isProcessing === requestId ? '...' : 'Chấp nhận'}</span>
                            </button>
                            <button
                              onClick={() => handleRejectRequest(requestId, user?.id)}
                              disabled={isProcessing === requestId}
                              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>{isProcessing === requestId ? '...' : 'Từ chối'}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleCancelRequest(requestId, user?.id)}
                            disabled={isProcessing === requestId}
                            className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>{isProcessing === requestId ? '...' : 'Hủy lời mời'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'received' ? 'Không có lời mời kết bạn' : 'Chưa gửi lời mời nào'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'received' 
                ? 'Bạn chưa nhận được lời mời kết bạn nào.' 
                : 'Bạn chưa gửi lời mời kết bạn cho ai.'
              }
            </p>
            {activeTab === 'sent' && (
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg font-medium"
              >
                Tìm kiếm bạn bè
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FriendRequestsPage;

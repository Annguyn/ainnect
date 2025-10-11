import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/ui';
import { EmptyState } from '../components/EmptyState';
import { socialService, Friendship } from '../services/socialService';
import { useAuth } from '../hooks/useAuth';
import { debugLogger } from '../utils/debugLogger';

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
    // Read initial tab from query (?tab=sent)
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'sent') {
      setActiveTab('sent');
    } else if (tabParam === 'received') {
      setActiveTab('received');
    }
  }, [currentUser, navigate, location.search]);

  const loadFriendRequests = async () => {
    try {
      setIsLoading(true);
      const [receivedResponse, sentResponse] = await Promise.all([
        socialService.getFriendRequests(0, 50),
        socialService.getSentFriendRequests(0, 50)
      ]);
      
      // Normalize received list (supports two formats)
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
            bio: '',
            isVerified: false,
            isPrivate: false,
          },
        }));
      }
      setFriendRequests(normalizedReceived);

      // Backend can return two shapes for sent requests:
      // 1) { content: Friendship[] }
      // 2) { result, message, data: { friendships: Raw[] } }
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
            bio: '',
            isVerified: false,
            isPrivate: false,
          },
        }));
      }
      setSentRequests(normalizedSent);
      
      debugLogger.log('FriendRequestsPage', 'Loaded friend requests', {
        received: Array.isArray((receivedResponse as any)?.content) ? (receivedResponse as any).content.length : ((receivedResponse as any)?.data?.friendships || []).length,
        sent: Array.isArray((sentResponse as any)?.content) ? (sentResponse as any).content.length : ((sentResponse as any)?.data?.friendships || []).length
      });
    } catch (error) {
      debugLogger.log('FriendRequestsPage', 'Failed to load friend requests', error);
      console.error('Failed to load friend requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (friendshipIdOrUserId: number, userIdFallback?: number) => {
    try {
      setIsProcessing(friendshipIdOrUserId);
      try {
        const otherUserId = userIdFallback ?? friendshipIdOrUserId;
        await socialService.acceptFriendRequest({ otherUserId });
      } catch (e) {
        if (userIdFallback) {
          await socialService.acceptFriendRequestByUser(userIdFallback);
        } else {
          throw e;
        }
      }
      
      // Remove from received requests
      setFriendRequests(prev => prev.filter((req: any) => (req.friendshipId || req.id) !== friendshipIdOrUserId));
      
      debugLogger.log('FriendRequestsPage', 'Friend request accepted', { friendshipId: friendshipIdOrUserId });
    } catch (error) {
      debugLogger.log('FriendRequestsPage', 'Failed to accept friend request', error);
      console.error('Failed to accept friend request:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectRequest = async (friendshipIdOrUserId: number, userIdFallback?: number) => {
    try {
      setIsProcessing(friendshipIdOrUserId);
      try {
        const otherUserId = userIdFallback ?? friendshipIdOrUserId;
        await socialService.rejectFriendRequest({ otherUserId });
      } catch (e) {
        if (userIdFallback) {
          await socialService.rejectFriendRequestByUser(userIdFallback);
        } else {
          throw e;
        }
      }
      
      // Remove from received requests
      setFriendRequests(prev => prev.filter((req: any) => (req.friendshipId || req.id) !== friendshipIdOrUserId));
      
      debugLogger.log('FriendRequestsPage', 'Friend request rejected', { friendshipId: friendshipIdOrUserId });
    } catch (error) {
      debugLogger.log('FriendRequestsPage', 'Failed to reject friend request', error);
      console.error('Failed to reject friend request:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancelRequest = async (friendshipId: number, otherUserId?: number) => {
    try {
      setIsProcessing(friendshipId);
      // Note: API doesn't have cancel endpoint, so we'll use reject
      if (otherUserId) {
        await socialService.rejectFriendRequest({ otherUserId });
      } else {
        await socialService.rejectFriendRequestByUser(friendshipId);
      }
      
      // Remove from sent requests
      setSentRequests(prev => prev.filter(req => req.id !== friendshipId));
      
      debugLogger.log('FriendRequestsPage', 'Friend request cancelled', { friendshipId });
    } catch (error) {
      debugLogger.log('FriendRequestsPage', 'Failed to cancel friend request', error);
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

  const handleUserClick = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={false} showUserMenu={true} onLogout={handleLogout} />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lời mời kết bạn</h1>
          <p className="text-gray-600 mt-2">Quản lý lời mời kết bạn của bạn</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'received'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Đã nhận ({friendRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'sent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Đã gửi ({sentRequests.length})
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <EmptyState type="loading" title="Đang tải lời mời kết bạn..." />
        ) : (
          <>
            {/* Received Requests */}
            {activeTab === 'received' && (
              <div className="space-y-4">
                {(friendRequests && friendRequests.length > 0) ? (
                  friendRequests.map((request: any) => (
                    <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleUserClick(request.requester?.id || request.requesterId)}
                        >
                          <Avatar
                            user={request.requester}
                            size="lg"
                            className="w-16 h-16"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleUserClick(request.requester?.id || request.requesterId)}
                          >
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              {request.requester?.displayName}
                            </h3>
                            <p className="text-sm text-gray-500">@{request.requester?.username}</p>
                          </div>
                          
                          {request.requester?.bio && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {request.requester?.bio}
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => handleAcceptRequest((request as any).friendshipId || request.id, request.requester?.id || (request as any).requesterId)}
                            disabled={isProcessing === ((request as any).friendshipId || request.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isProcessing === ((request as any).friendshipId || request.id) ? 'Đang xử lý...' : 'Chấp nhận'}
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest((request as any).friendshipId || request.id, request.requester?.id || (request as any).requesterId)}
                            disabled={isProcessing === ((request as any).friendshipId || request.id)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState 
                    type="no-friends" 
                    title="Không có lời mời kết bạn nào"
                    description="Bạn chưa nhận được lời mời kết bạn nào."
                  />
                )}
              </div>
            )}

            {/* Sent Requests */}
            {activeTab === 'sent' && (
              <div className="space-y-4">
                {(sentRequests && sentRequests.length > 0) ? (
                  sentRequests.map((request: any) => (
                    <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleUserClick(request.addressee?.id)}
                        >
                          <Avatar
                            user={request.addressee}
                            size="lg"
                            className="w-16 h-16"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleUserClick(request.addressee?.id)}
                          >
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              {request.addressee?.displayName}
                            </h3>
                            <p className="text-sm text-gray-500">@{request.addressee?.username}</p>
                          </div>
                          
                          {request.addressee?.bio && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {request.addressee?.bio}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="text-xs text-gray-400">
                              {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'PENDING' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'ACCEPTED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {request.status === 'PENDING' ? 'Đang chờ' :
                               request.status === 'ACCEPTED' ? 'Đã chấp nhận' :
                               'Đã từ chối'}
                            </span>
                          </div>
                        </div>
                        
                        {request.status === 'PENDING' && request.id !== 0 && (
                          <Button
                            onClick={() => handleCancelRequest(request.id, request.addressee?.id)}
                            disabled={isProcessing === request.id}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isProcessing === request.id ? 'Đang xử lý...' : 'Hủy'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState 
                    type="no-friends" 
                    title="Chưa gửi lời mời kết bạn nào"
                    description="Bạn chưa gửi lời mời kết bạn nào."
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default FriendRequestsPage;

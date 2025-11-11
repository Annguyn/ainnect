import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Avatar } from './Avatar';
import { Users, TrendingUp, Star, MessageCircle, Heart, UserPlus } from 'lucide-react';
import { 
  fetchFriendRequests, 
  acceptFriendRequest, 
  rejectFriendRequest,
  FriendRequest 
} from '../services/friendRequestService';
import { useAuth } from '../hooks/useAuth';
import { debugLogger } from '../utils/debugLogger';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RightSidebarProps {
  className?: string;
  suggestedGroups?: any[];
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ className = '', suggestedGroups = [] }) => {
  const { isAuthenticated } = useAuth();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [showFriendRequests, setShowFriendRequests] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  // Ensure suggestedGroups is always an array
  const safeGroups = Array.isArray(suggestedGroups) ? suggestedGroups : [];

  const loadFriendRequests = async () => {
    if (!isAuthenticated) {
      setFriendRequests([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await fetchFriendRequests();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        // Filter only pending requests
        const pendingRequests = data.filter((req: FriendRequest) => req.status === 'PENDING');
        setFriendRequests(pendingRequests);
      } else if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as any).content)) {
        // Handle paginated response structure
        const pendingRequests = (data as any).content.filter((req: FriendRequest) => req.status === 'PENDING');
        setFriendRequests(pendingRequests);
      } else {
        debugLogger.log('RightSidebar', 'Friend requests response is not an array', { data });
        setFriendRequests([]);
      }
    } catch (error) {
      debugLogger.log('RightSidebar', 'Failed to fetch friend requests', { error });
      setFriendRequests([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriendRequests();
    
    // Only set interval if authenticated
    if (!isAuthenticated) {
      return;
    }
    
    // Refresh friend requests every 30 seconds
    const interval = setInterval(() => {
      loadFriendRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleAcceptRequest = async (requestId: number) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await acceptFriendRequest(requestId);
      debugLogger.log('RightSidebar', 'Accepted friend request', { requestId });
      
      // Remove from list
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      debugLogger.log('RightSidebar', 'Failed to accept friend request', { error });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await rejectFriendRequest(requestId);
      debugLogger.log('RightSidebar', 'Rejected friend request', { requestId });
      
      // Remove from list
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      debugLogger.log('RightSidebar', 'Failed to reject friend request', { error });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };


  return (
    <div className={`space-y-4 ${className}`}>
      {/* Friend Requests - Only show when authenticated */}
      {isAuthenticated && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Lời mời kết bạn</h3>
              {friendRequests.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {friendRequests.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFriendRequests(!showFriendRequests)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showFriendRequests ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
        {showFriendRequests && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : friendRequests.length > 0 ? (
              <>
                {friendRequests.map((request) => {
                  const isProcessing = processingIds.has(request.id);
                  return (
                    <div
                      key={request.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      {/* Avatar */}
                      <Link 
                        to={`/profile/${request.senderId}`}
                        className="flex-shrink-0"
                      >
                        <Avatar
                          user={{
                            avatarUrl: request.senderAvatarUrl,
                            displayName: request.senderUsername,
                            userId: request.senderId
                          }}
                          size="md"
                        />
                      </Link>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/profile/${request.senderId}`}
                          className="block hover:underline"
                        >
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {request.senderUsername}
                          </h4>
                        </Link>
                        
                        {request.mutualFriendsCount !== undefined && request.mutualFriendsCount > 0 && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {request.mutualFriendsCount} bạn chung
                          </p>
                        )}
                        
                        {request.createdAt && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDistanceToNow(new Date(request.createdAt), {
                              locale: vi,
                              addSuffix: true
                            })}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-2">
                          <Button
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={isProcessing}
                            size="sm"
                            className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isProcessing ? 'Đang xử lý...' : 'Chấp nhận'}
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={isProcessing}
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs hover:bg-gray-100"
                          >
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* View All Link */}
                <div className="pt-2 border-t border-gray-200">
                  <Link
                    to="/friend-requests"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Xem tất cả lời mời ({friendRequests.length})
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <UserPlus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  Không có lời mời kết bạn
                </p>
              </div>
            )}
          </div>
        )}
        </Card>
      )}

      {/* Suggested Groups */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Nhóm gợi ý</h3>
        </div>
        <div className="space-y-2">
          {safeGroups.length > 0 ? (
            safeGroups.map((group) => (
              <div key={group.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <img
                  src={group.avatarUrl || '/default-group-avatar.png'}
                  alt={group.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{group.name}</h4>
                  <p className="text-xs text-gray-500">{group.description}</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Tham gia
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">
              Không có nhóm gợi ý
            </p>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link
            to="/groups"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem tất cả nhóm →
          </Link>
        </div>
      </Card>


      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Thao tác nhanh</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <MessageCircle className="w-4 h-4 mr-2" />
            Tạo cuộc trò chuyện
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Users className="w-4 h-4 mr-2" />
            Tìm bạn bè
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Star className="w-4 h-4 mr-2" />
            Tạo nhóm
          </Button>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-xs text-gray-500 space-y-2">
        <div className="flex flex-wrap gap-2">
          <Link to="/about" className="hover:underline">Giới thiệu</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:underline">Quyền riêng tư</Link>
          <span>·</span>
          <Link to="/terms" className="hover:underline">Điều khoản</Link>
        </div>
        <div>© 2025 Ainnect. Tất cả quyền được bảo lưu.</div>
      </div>
    </div>
  );
};

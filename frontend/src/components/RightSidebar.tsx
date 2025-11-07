import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Users, TrendingUp, Star, MessageCircle, Heart } from 'lucide-react';
import { fetchFriendRequests } from '@services/friendRequestService';

interface RightSidebarProps {
  className?: string;
  suggestedGroups?: any[];
}

interface FriendRequest {
  id: number;
  name: string;
  mutualFriends: number;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ className = '', suggestedGroups = [] }) => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [showFriendRequests, setShowFriendRequests] = useState(true);

  // Ensure suggestedGroups is always an array
  const safeGroups = Array.isArray(suggestedGroups) ? suggestedGroups : [];

  useEffect(() => {
    const loadFriendRequests = async () => {
      try {
        const data = await fetchFriendRequests();
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setFriendRequests(data);
        } else if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as any).content)) {
          // Handle paginated response structure
          setFriendRequests((data as any).content);
        } else {
          console.warn('Friend requests response is not an array:', data);
          setFriendRequests([]);
        }
      } catch (error) {
        console.error('Failed to fetch friend requests:', error);
        setFriendRequests([]); // Set empty array on error
      }
    };

    loadFriendRequests();
  }, []);


  return (
    <div className={`space-y-4 ${className}`}>
      {/* Friend Requests */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Lời mời kết bạn</h3>
          </div>
          <button
            onClick={() => setShowFriendRequests(!showFriendRequests)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showFriendRequests ? 'Ẩn' : 'Hiện'}
          </button>
        </div>
        {showFriendRequests && (
          <div className="space-y-2">
            {Array.isArray(friendRequests) && friendRequests.length > 0 ? (
              friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.name}</p>
                    <p className="text-xs text-gray-500">
                      {request.mutualFriends} bạn chung
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      Chấp nhận
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Từ chối
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                Không có lời mời kết bạn
              </p>
            )}
          </div>
        )}
      </Card>

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

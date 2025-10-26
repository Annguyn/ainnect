import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Users, TrendingUp, Star, MessageCircle, Heart } from 'lucide-react';
import { fetchFriendRequests } from '@services/friendRequestService';

interface RightSidebarProps {
  className?: string;
}

interface FriendRequest {
  id: number;
  name: string;
  mutualFriends: number;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ className = '' }) => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [showFriendRequests, setShowFriendRequests] = useState(true);

  useEffect(() => {
    const loadFriendRequests = async () => {
      try {
        const data = await fetchFriendRequests();
        setFriendRequests(data);
      } catch (error) {
        console.error('Failed to fetch friend requests:', error);
      }
    };

    loadFriendRequests();
  }, []);

  // Mock data for suggested groups and recent activities
  const suggestedGroups = [
    { id: 1, name: 'Lập trình viên Việt Nam', members: 15420, avatar: '💻' },
    { id: 2, name: 'Du lịch bụi', members: 8900, avatar: '🎒' },
    { id: 3, name: 'Nấu ăn ngon', members: 12300, avatar: '🍳' },
    { id: 4, name: 'Fitness & Yoga', members: 6700, avatar: '💪' },
  ];

  const recentActivities = [
    { id: 1, user: 'Nguyễn Văn A', action: 'đã thích bài viết của bạn', time: '5 phút trước', icon: Heart },
    { id: 2, user: 'Trần Thị B', action: 'đã bình luận bài viết', time: '15 phút trước', icon: MessageCircle },
    { id: 3, user: 'Lê Văn C', action: 'đã chia sẻ bài viết', time: '1 giờ trước', icon: Star },
  ];

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
            {friendRequests.map((request) => (
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
            ))}
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
          {suggestedGroups.map((group) => (
            <div key={group.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {group.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{group.name}</h4>
                <p className="text-xs text-gray-500">{group.members.toLocaleString()} thành viên</p>
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                Tham gia
              </Button>
            </div>
          ))}
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

      {/* Recent Activities */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Hoạt động gần đây</h3>
        <div className="space-y-2">
          {recentActivities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link
            to="/notifications"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem tất cả thông báo →
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

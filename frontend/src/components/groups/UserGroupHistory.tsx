import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import { Group } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../Avatar';
import { 
  Users, 
  Shield, 
  UserX, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface UserGroupHistoryProps {
  userId: number;
  userName: string;
  onBlockUser?: (groupId: number, groupName: string) => void;
  className?: string;
}

export const UserGroupHistory: React.FC<UserGroupHistoryProps> = ({
  userId,
  userName,
  onBlockUser,
  className = ''
}) => {
  const { user: currentUser } = useAuth();
  const { getUserGroupHistory, blockUserFromGroup, isLoading, error } = useGroups();
  
  const [groupHistory, setGroupHistory] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [blocking, setBlocking] = useState<number | null>(null);
  const [showConfirmBlock, setShowConfirmBlock] = useState<{
    groupId: number;
    groupName: string;
  } | null>(null);

  const loadUserGroupHistory = async () => {
    setLoading(true);
    try {
      const response = await getUserGroupHistory(userId, 0, 20);
      setGroupHistory(response.content || []);
    } catch (error) {
      console.error('Failed to load user group history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserGroupHistory();
  }, [userId]);

  const handleBlockUser = async (groupId: number, groupName: string) => {
    if (!currentUser) return;
    
    setBlocking(groupId);
    try {
      await blockUserFromGroup({
        userId,
        groupId,
        reason: `Blocked by ${currentUser.displayName || currentUser.username}`
      });
      
      // Remove the group from history after blocking
      setGroupHistory(prev => prev.filter(group => group.id !== groupId));
      
      // Call the parent callback if provided
      onBlockUser?.(groupId, groupName);
      
      alert(`Đã chặn ${userName} khỏi nhóm "${groupName}"`);
    } catch (error) {
      console.error('Failed to block user:', error);
      alert('Không thể chặn người dùng. Vui lòng thử lại.');
    } finally {
      setBlocking(null);
      setShowConfirmBlock(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleText = (role: string) => {
    const roleTranslations: Record<string, string> = {
      'owner': 'Chủ sở hữu',
      'admin': 'Quản trị viên',
      'moderator': 'Điều hành viên',
      'member': 'Thành viên'
    };
    return roleTranslations[role] || role;
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch sử nhóm...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-red-600">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Không thể tải lịch sử nhóm</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadUserGroupHistory}
            className="mt-2"
          >
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  if (groupHistory.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Users className="w-8 h-8 mx-auto mb-2" />
          <p>Người dùng chưa tham gia nhóm nào</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Lịch sử nhóm của {userName}
        </h3>
        <span className="text-sm text-gray-500">
          {groupHistory.length} nhóm
        </span>
      </div>

      <div className="space-y-3">
        {groupHistory.map((group) => (
          <div 
            key={group.id} 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Avatar
                user={{
                  avatarUrl: group.avatarUrl,
                  displayName: group.name,
                  userId: group.id
                }}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {group.name}
                  </h4>
                  {getRoleIcon(group.userRole || 'member')}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{getRoleText(group.userRole || 'member')}</span>
                  <span>•</span>
                  <span>{group.memberCount} thành viên</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(group.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmBlock({
                  groupId: group.id,
                  groupName: group.name
                })}
                disabled={blocking === group.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {blocking === group.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <>
                    <UserX className="w-4 h-4 mr-1" />
                    Chặn
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Xác nhận chặn người dùng
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn chặn <strong>{userName}</strong> khỏi nhóm{' '}
              <strong>"{showConfirmBlock.groupName}"</strong>? 
              Người dùng sẽ không thể tham gia lại nhóm này.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowConfirmBlock(null)}
                disabled={blocking === showConfirmBlock.groupId}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={() => handleBlockUser(showConfirmBlock.groupId, showConfirmBlock.groupName)}
                disabled={blocking === showConfirmBlock.groupId}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {blocking === showConfirmBlock.groupId ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang chặn...</span>
                  </div>
                ) : (
                  <>
                    <UserX className="w-4 h-4 mr-1" />
                    Chặn người dùng
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

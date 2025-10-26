import React, { useState, useCallback } from 'react';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { socialService } from '../../services/socialService';
import { BlockedUser } from '../../types/social';
import { Avatar } from '../Avatar';
import { Button } from '../ui';
import { EmptyState } from '../EmptyState';

interface BlockedUsersListProps {
  className?: string;
}

export const BlockedUsersList: React.FC<BlockedUsersListProps> = ({ className = '' }) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBlockedUsers = useCallback(async () => {
    if (isLoading || !hasMore) {
      console.log('Skipping loadBlockedUsers - isLoading:', isLoading, 'hasMore:', hasMore);
      return;
    }

    console.log('Loading blocked users for page:', page);
    setIsLoading(true);
    setError(null);

    try {
      const response = await socialService.getBlockedUsers(page);
      console.log('Got response:', {
        blocks: response.blocks.length,
        totalPages: response.totalPages,
        currentPage: response.currentPage
      });
      
      setBlockedUsers(prev => [...prev, ...response.blocks]);
      setPage(prev => {
        const nextPage = prev + 1;
        setHasMore(nextPage < response.totalPages);
        return nextPage;
      });
    } catch (err) {
      setError('Failed to load blocked users. Please try again later.');
      console.error('Error loading blocked users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading]);

  // Load initial data
  React.useEffect(() => {
    loadBlockedUsers();
  }, [loadBlockedUsers]);

  useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadBlockedUsers,
    threshold: 200
  });

  const handleUnblock = async (blockedId: number) => {
    try {
      await socialService.unblockUser(blockedId);
      setBlockedUsers(prev => prev.filter(user => user.blockedId !== blockedId));
    } catch (err) {
      console.error('Error unblocking user:', err);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!isLoading && blockedUsers.length === 0) {
    return (
      <EmptyState
        type="no-blocked"
        title="Không có người dùng nào bị chặn"
        description="Bạn chưa chặn người dùng nào."
      />
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {blockedUsers.map(user => (
        <div
          key={user.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Avatar
                  user={{
                    userId: user.blockedId,
                    displayName: user.blockedDisplayName,
                    avatarUrl: user.blockedAvatarUrl
                  }}
                  size="lg"
                />
              <div>
                <h3 className="font-medium text-gray-900">{user.blockedDisplayName}</h3>
                <p className="text-sm text-gray-500">@{user.blockedUsername}</p>
                {user.reason && (
                  <p className="text-sm text-gray-500 mt-1">
                    Lý do: {user.reason}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Đã chặn từ: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleUnblock(user.blockedId)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              Bỏ chặn
            </Button>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
};

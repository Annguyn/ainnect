import React, { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { Modal } from './ui/Modal';
import { debugLogger } from '../utils/debugLogger';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

interface ReactionUser {
  id: number;
  type: ReactionType;
  userId: number;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt: string;
}

interface ReactionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  postId: number;
  reactions?: {
    totalCount: number;
    reactionCounts: Array<{
      type: ReactionType;
      count: number;
    }>;
    recentReactions?: ReactionUser[];
  };
  onLoadReactions?: (postId: number, page?: number) => Promise<ReactionUser[]>;
}

const reactionEmojis: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  haha: '😆',
  wow: '😮',
  sad: '😢',
  angry: '😡'
};

const reactionLabels: Record<ReactionType, string> = {
  like: 'Thích',
  love: 'Yêu thích',
  haha: 'Haha',
  wow: 'Wow',
  sad: 'Buồn',
  angry: 'Phẫn nộ'
};

export const ReactionsModal: React.FC<ReactionsModalProps> = ({
  isVisible,
  onClose,
  postId,
  reactions,
  onLoadReactions
}) => {
  const [selectedTab, setSelectedTab] = useState<ReactionType | 'all'>('all');
  const [reactionUsers, setReactionUsers] = useState<ReactionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load reactions when modal opens
  useEffect(() => {
    if (isVisible && onLoadReactions) {
      loadReactions();
    }
  }, [isVisible, postId]);

  const loadReactions = async (page: number = 0, append: boolean = false) => {
    if (!onLoadReactions) return;

    debugLogger.log('ReactionsModal', 'Loading reactions', { postId, page, append });
    setIsLoading(true);
    
    try {
      const users = await onLoadReactions(postId, page);
      if (append) {
        setReactionUsers(prev => [...prev, ...users]);
      } else {
        setReactionUsers(users);
      }
      setCurrentPage(page);
      setHasMore(users.length >= 10); // Assuming page size is 10
      
      debugLogger.log('ReactionsModal', 'Reactions loaded successfully', { 
        postId, 
        page,
        count: users.length,
        totalUsers: append ? reactionUsers.length + users.length : users.length
      });
    } catch (error) {
      debugLogger.log('ReactionsModal', 'Failed to load reactions', { postId, page, error });
      console.error('Failed to load reactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreReactions = () => {
    if (hasMore && !isLoading) {
      loadReactions(currentPage + 1, true);
    }
  };

  // Get reaction counts from props or calculate from users
  const getReactionCounts = () => {
    if (reactions?.reactionCounts) {
      return reactions.reactionCounts;
    }

    // Calculate from users if no summary provided
    const counts: Record<ReactionType, number> = {
      like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0
    };

    reactionUsers.forEach(user => {
      counts[user.type] = (counts[user.type] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({ type: type as ReactionType, count }));
  };

  // Filter users based on selected tab
  const filteredUsers = selectedTab === 'all' 
    ? reactionUsers 
    : reactionUsers.filter(user => user.type === selectedTab);

  const reactionCounts = getReactionCounts();
  const totalCount = reactions?.totalCount || reactionUsers.length;

  if (!isVisible) return null;

  return (
    <Modal isOpen={isVisible} onClose={onClose} title="Người đã bày tỏ cảm xúc">
      <div className="w-full max-w-md">
        {/* Reaction Tabs */}
        <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => {
              debugLogger.logButtonClick('Reactions Tab', { tab: 'all', postId });
              setSelectedTab('all');
            }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedTab === 'all' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span>Tất cả</span>
            <span className="text-sm font-semibold">{totalCount}</span>
          </button>

          {reactionCounts.map(({ type, count }) => (
            <button
              key={type}
              onClick={() => {
                debugLogger.logButtonClick('Reactions Tab', { tab: type, postId });
                setSelectedTab(type);
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedTab === type 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className="text-lg">{reactionEmojis[type]}</span>
              <span className="text-sm font-semibold">{count}</span>
            </button>
          ))}
        </div>

        {/* Users List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={`${user.userId}-${user.type}`} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      user={{
                        userId: user.userId,
                        displayName: user.displayName,
                        avatarUrl: user.avatarUrl
                      }}
                      size="md"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {user.displayName || user.username}
                      </h4>
                      <p className="text-sm text-gray-500">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{reactionEmojis[user.type]}</span>
                    <span className="text-sm text-gray-500">
                      {reactionLabels[user.type]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {selectedTab === 'all' 
                ? 'Chưa có ai bày tỏ cảm xúc'
                : `Chưa có ai ${reactionLabels[selectedTab as ReactionType].toLowerCase()}`
              }
            </div>
          )}

          {/* Load More Button */}
          {hasMore && filteredUsers.length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMoreReactions}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Đang tải...</span>
                  </div>
                ) : (
                  'Hiển thị thêm'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              debugLogger.logButtonClick('Close Reactions Modal', { postId });
              onClose();
            }}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};

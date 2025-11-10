import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { ReactionButton } from './ReactionButton';
import { ReactionType } from './ReactionPicker';
import { ReactionsModal } from './ReactionsModal';
import { Comment, commentService } from '../services/commentService';
import { debugLogger } from '../utils/debugLogger';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
  postId: number;
  currentUserId?: number;
  onDelete: (commentId: number) => void;
  onReact: (commentId: number, reaction: ReactionType) => void;
  onUnreact: (commentId: number) => void;
  onReply: (commentId: number, content: string) => Promise<void>;
  onLoadReplies: (commentId: number, page: number) => Promise<{ content: Comment[]; hasMore: boolean; totalElements: number }>;
  isDeleting?: boolean;
  depth?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  currentUserId,
  onDelete,
  onReact,
  onUnreact,
  onReply,
  onLoadReplies,
  isDeleting,
  depth = 0
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);
  const [repliesPage, setRepliesPage] = useState(0);
  const [totalReplies, setTotalReplies] = useState(comment.repliesCount || 0);
  const [showReactionsModal, setShowReactionsModal] = useState(false);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    debugLogger.log('CommentItem', 'Submitting reply', { commentId: comment.id, content: replyText });
    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setShowReplyForm(false);
      
      // Reload replies to show the new one
      setRepliesPage(0);
      await loadReplies(0, true);
      
      debugLogger.log('CommentItem', 'Reply submitted successfully', { commentId: comment.id });
    } catch (error) {
      debugLogger.log('CommentItem', 'Failed to submit reply', { commentId: comment.id, error });
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const loadReplies = async (page: number, reset: boolean = false) => {
    if (isLoadingReplies) return;
    
    debugLogger.log('CommentItem', 'Loading replies', { commentId: comment.id, page, reset });
    setIsLoadingReplies(true);
    try {
      const result = await onLoadReplies(comment.id, page);
      
      if (reset) {
        setReplies(result.content);
      } else {
        setReplies(prev => [...prev, ...result.content]);
      }
      
      setHasMoreReplies(result.hasMore);
      setTotalReplies(result.totalElements);
      setShowReplies(true);
      setRepliesPage(page);
      
      debugLogger.log('CommentItem', 'Replies loaded', { 
        commentId: comment.id, 
        repliesCount: result.content.length,
        hasMore: result.hasMore,
        totalElements: result.totalElements
      });
    } catch (error) {
      debugLogger.log('CommentItem', 'Failed to load replies', { commentId: comment.id, error });
      console.error('Failed to load replies:', error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      await loadReplies(0, true);
    } else {
      setShowReplies(!showReplies);
    }
  };

  const handleLoadMoreReplies = async () => {
    await loadReplies(repliesPage + 1, false);
  };

  const handleLoadCommentReactions = async (commentId: number, page?: number) => {
    try {
      const reactions = await commentService.getCommentReactions(commentId, page || 0);
      return reactions;
    } catch (error) {
      debugLogger.log('CommentItem', 'Failed to load comment reactions', { commentId, error });
      console.error('Failed to load comment reactions:', error);
      return [];
    }
  };

  // Max depth to prevent too much nesting
  const maxDepth = 3;
  const isMaxDepth = depth >= maxDepth;

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="flex space-x-3">
        <Avatar user={comment.author} size="sm" />
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg px-3 py-2 relative group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-gray-900">
                  {comment.author?.displayName || comment.author?.username || 'Unknown User'}
                </span>
                {comment.author?.isVerified && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Delete button - only show for comment owner */}
              {currentUserId && comment.authorId === currentUserId && (
                <button
                  onClick={() => onDelete(comment.id)}
                  disabled={isDeleting}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700 disabled:opacity-50"
                  title="Xóa"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center space-x-4 mt-2">
            <ReactionButton
              postId={postId}
              currentReaction={comment.userReaction as any}
              onReaction={(reaction) => onReact(comment.id, reaction)}
              onUnreact={() => onUnreact(comment.id)}
              reactionCount={comment.reactionsCount.total}
              className="reaction-button"
              onShowReactions={() => setShowReactionsModal(true)}
            />
            
            {!isMaxDepth && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100 font-medium"
              >
                Trả lời
              </button>
            )}

            {/* Show/Hide Replies Button - only show if comment has children */}
            {comment.hasChild && (
              <button
                onClick={handleToggleReplies}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded hover:bg-blue-50 font-medium flex items-center gap-1"
              >
                {isLoadingReplies ? (
                  <>
                    <div className="w-3 h-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    Đang tải...
                  </>
                ) : (
                  <>
                    {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showReplies ? 'Ẩn' : 'Xem'} {totalReplies > 0 ? totalReplies : ''} phản hồi
                  </>
                )}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3">
              <form onSubmit={handleSubmitReply} className="flex space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Trả lời ${comment.author?.displayName || comment.author?.username}...`}
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isSubmittingReply}
                  autoFocus
                />
                {replyText.trim() && (
                  <>
                    <button
                      type="submit"
                      disabled={isSubmittingReply}
                      className="px-4 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                      {isSubmittingReply ? '...' : 'Gửi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyText('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Hủy
                    </button>
                  </>
                )}
              </form>
            </div>
          )}

          {/* Replies List */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  currentUserId={currentUserId}
                  onDelete={onDelete}
                  onReact={onReact}
                  onUnreact={onUnreact}
                  onReply={onReply}
                  onLoadReplies={onLoadReplies}
                  depth={depth + 1}
                />
              ))}

              {/* Load More Replies */}
              {hasMoreReplies && (
                <button
                  onClick={handleLoadMoreReplies}
                  disabled={isLoadingReplies}
                  className="ml-8 text-xs text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 font-medium disabled:opacity-50"
                >
                  {isLoadingReplies ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      Đang tải...
                    </div>
                  ) : (
                    `Xem thêm phản hồi`
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reactions Modal */}
      <ReactionsModal
        isVisible={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        postId={comment.id}
        onLoadReactions={handleLoadCommentReactions}
      />
    </div>
  );
};

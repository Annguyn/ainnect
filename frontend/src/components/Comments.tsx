import React, { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { CommentItem } from './CommentItem';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';
import { commentService, Comment } from '../services/commentService';
import { debugLogger } from '../utils/debugLogger';

interface CommentsProps {
  postId: number;
  isVisible: boolean;
  initialComments?: any[];
  onCommentAdded?: () => void;
  onCommentCountUpdate?: (count: number) => void;
}

export const Comments: React.FC<CommentsProps> = ({ postId, isVisible, initialComments, onCommentAdded, onCommentCountUpdate }) => {
  const { user } = useAuth();
  const { comments, isLoading, hasMore, totalElements, addComment, deleteComment, reactToComment, unreactComment, loadComments, loadMoreComments } = useComments(postId);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  useEffect(() => {
    if (isVisible && comments.length === 0) {
      debugLogger.log('Comments', 'Component became visible, loading comments', { postId });
      loadComments();
    }
  }, [isVisible, loadComments, postId, comments.length]);

  useEffect(() => {
    debugLogger.log('Comments', 'Comments state changed', { 
      postId, 
      commentsCount: comments.length,
      isLoading,
      hasMore,
      totalElements,
      comments: comments.map(c => ({
        id: c.id,
        author: c.author?.displayName || c.author?.username || 'Unknown',
        content: c.content?.substring(0, 30) + '...'
      }))
    });

    if (totalElements !== undefined && onCommentCountUpdate) {
      onCommentCountUpdate(totalElements);
    }
  }, [comments, isLoading, hasMore, totalElements, postId, onCommentCountUpdate]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    debugLogger.logFormSubmit('Add Comment', { postId, content: commentText.trim() });
    setIsSubmitting(true);
    try {
      await addComment(commentText.trim());
      setCommentText('');
      onCommentAdded?.();
      debugLogger.log('Comments', 'Comment added successfully', { postId });
    } catch (error) {
      debugLogger.log('Comments', 'Failed to add comment', { postId, error });
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }

    setDeletingCommentId(commentId);
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleReply = async (commentId: number, content: string) => {
    debugLogger.log('Comments', 'Replying to comment', { commentId, content });
    try {
      await commentService.replyToComment(commentId, { content });
      // Reload comments to update reply count
      await loadComments();
      debugLogger.log('Comments', 'Reply added successfully', { commentId });
    } catch (error) {
      debugLogger.log('Comments', 'Failed to add reply', { commentId, error });
      throw error;
    }
  };

  const handleLoadReplies = async (commentId: number, page: number): Promise<{ content: Comment[]; hasMore: boolean; totalElements: number }> => {
    debugLogger.log('Comments', 'Loading replies', { commentId, page });
    try {
      const result = await commentService.getReplies(commentId, page, 5);
      debugLogger.log('Comments', 'Replies loaded', { commentId, count: result.content.length });
      return {
        content: result.content,
        hasMore: result.hasNext,
        totalElements: result.totalElements
      };
    } catch (error) {
      debugLogger.log('Comments', 'Failed to load replies', { commentId, error });
      throw error;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="px-4 pb-4 border-t border-gray-100">
      {/* Add Comment Form */}
      <div className="mt-4 flex space-x-3">
        <Avatar 
          user={user || undefined}
          size="md"
        />
        <div className="flex-1">
          <form onSubmit={handleSubmitComment} className="flex space-x-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            {commentText.trim() && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? '...' : 'Gửi'}
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Comments List */}
      {isLoading && comments.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
          <div className="animate-pulse">Đang tải bình luận...</div>
        </div>
      )}

      {comments.length > 0 && (
        <div className="mt-4 space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={user?.id}
              onDelete={handleDeleteComment}
              onReact={reactToComment}
              onUnreact={unreactComment}
              onReply={handleReply}
              onLoadReplies={handleLoadReplies}
              isDeleting={deletingCommentId === comment.id}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && comments.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {comments.length} / {totalElements || 0} bình luận
          </div>
          
          {hasMore && (
            <button
              onClick={loadMoreComments}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Đang tải...</span>
                </div>
              ) : (
                `Hiển thị thêm 3 bình luận (${totalElements - comments.length} còn lại)`
              )}
            </button>
          )}
        </div>
      )}

      {!isLoading && comments.length === 0 && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';
import { ReactionButton } from './ReactionButton';
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
        <div className="mt-4 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar 
                user={comment.author}
                size="sm"
              />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg px-3 py-2 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.author?.displayName || comment.author?.username || `User ${comment.authorId}` || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    {/* Delete button - only show for comment owner */}
                    {user && comment.authorId === user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700 disabled:opacity-50"
                        title="Xóa bình luận"
                      >
                        {deletingCommentId === comment.id ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-800">{comment.content}</p>
                </div>
                
                {/* Comment Actions */}
                <div className="flex items-center space-x-4 mt-2">
                  <ReactionButton
                    postId={comment.postId} // Added postId prop
                    currentReaction={comment.userReaction as any}
                    onReaction={(reaction) => reactToComment(comment.id, reaction)}
                    onUnreact={() => unreactComment(comment.id)}
                    reactionCount={comment.reactionsCount.total} // Extracted total count
                    className="reaction-button"
                  />
                  <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100">
                    Trả lời
                  </button>
                </div>
              </div>
            </div>
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

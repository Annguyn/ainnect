import { useState, useCallback } from 'react';
import { commentService, Comment, CreateCommentRequest } from '../services/commentService';
import { useAuth } from './useAuth';
import { debugLogger } from '../utils/debugLogger';


export const useComments = (postId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const { user } = useAuth();

  // Set initial comments (for preview comments from PostCard)
  const setInitialComments = useCallback((initialComments: Comment[], totalCount: number) => {
    setComments(initialComments);
    setTotalElements(totalCount);
    setCurrentPage(0);
    setHasMore(initialComments.length < totalCount);
    debugLogger.log('useComments', 'Set initial comments', { 
      postId, 
      initialCount: initialComments.length,
      totalCount,
      hasMore: initialComments.length < totalCount
    });
  }, [postId]);

  // Load initial comments for a post
  const loadComments = useCallback(async () => {
    debugLogger.log('useComments', 'Loading initial comments', { postId });
    setIsLoading(true);
    setError(null);
    setCurrentPage(0);
    
    try {
      const response = await commentService.getCommentsByPost(postId, 0, 3);
      setComments(response.content || []);
      setTotalElements(response.totalElements || 0);
      setHasMore(response.hasNext || false);
      
      debugLogger.log('useComments', 'Initial comments loaded successfully', { 
        postId, 
        count: response.content?.length || 0,
        totalElements: response.totalElements || 0,
        hasMore: response.hasNext || false,
        comments: response.content?.map(c => ({
          id: c.id,
          author: c.author?.displayName || c.author?.username || 'Unknown',
          content: c.content?.substring(0, 30) + '...'
        }))
      });
    } catch (err: any) {
      debugLogger.log('useComments', 'Failed to load initial comments', { postId, error: err });
      setError(err.message || 'Failed to load comments');
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  // Load more comments (pagination)
  const loadMoreComments = useCallback(async () => {
    if (!hasMore || isLoading) return;
    
    debugLogger.log('useComments', 'Loading more comments', { postId, currentPage: currentPage + 1 });
    setIsLoading(true);
    
    try {
      const nextPage = currentPage + 1;
      const response = await commentService.getCommentsByPost(postId, nextPage, 3);
      
      setComments(prev => [...prev, ...(response.content || [])]);
      setCurrentPage(nextPage);
      setHasMore(response.hasNext || false);
      
      debugLogger.log('useComments', 'More comments loaded successfully', { 
        postId, 
        newCount: response.content?.length || 0,
        totalComments: comments.length + (response.content?.length || 0),
        hasMore: response.content && response.content.length >= 3
      });
    } catch (err: any) {
      debugLogger.log('useComments', 'Failed to load more comments', { postId, error: err });
      setError(err.message || 'Failed to load more comments');
      console.error('Error loading more comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postId, currentPage, hasMore, isLoading, comments.length]);

  // Add a comment
  const addComment = useCallback(async (content: string, parentId?: number) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const commentData: CreateCommentRequest = {
      content,
      parentId
    };

    try {
      const commentId = await commentService.addCommentToPost(postId, commentData);
      console.log(`Successfully added comment ${commentId} to post ${postId}`);
      
      // Reload comments to get the new one with proper author data
      await loadComments();
      
      return commentId;
    } catch (err: any) {
      console.error('Failed to add comment via API:', err);
      setError(err.message || 'Failed to add comment');
      throw err; // Re-throw the error so the UI can handle it
    }
  }, [user, postId, loadComments]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: number) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    debugLogger.logButtonClick('Delete Comment', { commentId, postId });
    
    try {
      await commentService.deleteComment(commentId);
      
      // Remove comment from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      debugLogger.log('useComments', 'Comment deleted successfully', { commentId, postId });
      console.log(`Successfully deleted comment ${commentId}`);
    } catch (err: any) {
      debugLogger.log('useComments', 'Failed to delete comment', { commentId, postId, error: err });
      setError(err.message || 'Failed to delete comment');
      console.error('Error deleting comment:', err);
      throw err;
    }
  }, [user, postId]);

  // React to comment
  const reactToComment = useCallback(async (commentId: number, reactionType: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') => {
    if (!user) return;

    debugLogger.logButtonClick('React to Comment', { commentId, postId, reactionType });

    try {
      await commentService.reactToComment(commentId, { type: reactionType });
      
      // Update the comment in local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const currentReactions = comment.reactionsCount || { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0, total: 0 };
          const oldReaction = comment.userReaction as keyof typeof currentReactions;
          
          // Create new reaction counts
          const newReactions = { ...currentReactions };
          
          // Remove old reaction if exists
          if (oldReaction && oldReaction in newReactions) {
            newReactions[oldReaction] = Math.max(0, newReactions[oldReaction] - 1);
            newReactions.total = Math.max(0, newReactions.total - 1);
          }
          
          // Add new reaction
          if (reactionType in newReactions) {
            newReactions[reactionType as keyof typeof newReactions] = (newReactions[reactionType as keyof typeof newReactions] || 0) + 1;
            newReactions.total = newReactions.total + 1;
          }
          
          return {
            ...comment,
            userReaction: reactionType,
            reactionsCount: newReactions
          };
        }
        return comment;
      }));
      
      debugLogger.log('useComments', 'Comment reaction added successfully', { commentId, postId, reactionType });
    } catch (err: any) {
      debugLogger.log('useComments', 'Failed to react to comment', { commentId, postId, reactionType, error: err });
      setError(err.message || 'Failed to react to comment');
      console.error('Error reacting to comment:', err);
    }
  }, [user, postId]);

  // Remove reaction from comment
  const unreactComment = useCallback(async (commentId: number) => {
    if (!user) return;

    debugLogger.logButtonClick('Unreact Comment', { commentId, postId });

    try {
      await commentService.unreactComment(commentId);
      
      // Update the comment in local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const currentReactions = comment.reactionsCount || { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0, total: 0 };
          const oldReaction = comment.userReaction as keyof typeof currentReactions;
          
          // Create new reaction counts
          const newReactions = { ...currentReactions };
          
          // Remove old reaction if exists
          if (oldReaction && oldReaction in newReactions) {
            newReactions[oldReaction] = Math.max(0, newReactions[oldReaction] - 1);
            newReactions.total = Math.max(0, newReactions.total - 1);
          }
          
          return {
            ...comment,
            userReaction: null,
            reactionsCount: newReactions
          };
        }
        return comment;
      }));
      
      debugLogger.log('useComments', 'Comment reaction removed successfully', { commentId, postId });
    } catch (err: any) {
      debugLogger.log('useComments', 'Failed to remove comment reaction', { commentId, postId, error: err });
      setError(err.message || 'Failed to remove comment reaction');
      console.error('Error removing comment reaction:', err);
    }
  }, [user, postId]);

  // Toggle like on comment (legacy method for backward compatibility)
  const toggleCommentLike = useCallback(async (commentId: number) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment?.userReaction === 'like') {
      await unreactComment(commentId);
    } else {
      await reactToComment(commentId, 'like');
    }
  }, [comments, reactToComment, unreactComment]);

  return {
    comments,
    isLoading,
    error,
    hasMore,
    totalElements,
    loadComments,
    loadMoreComments,
    setInitialComments,
    addComment,
    deleteComment,
    reactToComment,
    unreactComment,
    toggleCommentLike,
    clearError: () => setError(null)
  };
};

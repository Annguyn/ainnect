import React, { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PostCard } from '../PostCard';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { Post, postService } from '../../services/postService';
import { PostSkeleton } from '../PostSkeleton';
import { EmptyState } from '../EmptyState';
import type { ReactionType } from '../ReactionPicker';
import { websocketService } from '../../services/websocketService';
import { debugLogger } from '../../utils/debugLogger';
import { authService as apiAuthService } from '../../services/api';
import { apiClient } from '../../services/apiClient';

interface UserFeedProps {
  className?: string;
  posts?: Post[]; // Allow external posts
  onDeletePost?: (postId: number) => void; // Callback for post deletion
  onTokenValidationFailed?: () => void; // Callback when token validation fails
}

export const UserFeed: React.FC<UserFeedProps> = ({
  className = '',
  posts: externalPosts,
  onDeletePost,
  onTokenValidationFailed
}) => {
  const { isAuthenticated, user } = useAuth();
  const [internalPosts, setInternalPosts] = useState<Post[]>([]);
  const posts = (externalPosts && Array.isArray(externalPosts)) ? externalPosts : internalPosts;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [pendingPosts, setPendingPosts] = useState<Set<number>>(new Set());
  const [tokenValidated, setTokenValidated] = useState<boolean | null>(null);
  
  const isLoadingRef = React.useRef(false);
  const hasInitialLoadedRef = React.useRef(false);
  const tokenValidationRef = React.useRef(false);

  const loadPosts = useCallback(async (pageToLoad: number, isRetry = false) => {
    // Guard against multiple simultaneous loads
    // Only load if token is validated as true (strict check)
    if (!isAuthenticated || isLoadingRef.current || externalPosts || tokenValidated !== true) {
      debugLogger.log('UserFeed', '⏭️ Skipping loadPosts', { 
        isAuthenticated, 
        isLoading: isLoadingRef.current, 
        hasExternalPosts: !!externalPosts, 
        tokenValidated 
      });
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    debugLogger.log('UserFeed', '📥 Loading user feed posts from /api/posts/feed/user', { page: pageToLoad, tokenValidated });
    
    if (!isRetry) {
      setError(null);
    }

    try {
      const response = await postService.getFeedPosts(pageToLoad, 5);
      
      // Validate response structure
      if (!response || !response.content || !Array.isArray(response.content)) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
      
      setInternalPosts(prev => {
        const existingIds = new Set(prev.map(post => post.id));
        const newPosts = response.content.filter(post => !existingIds.has(post.id));
        
        if (newPosts.length !== response.content.length) {
          console.warn(`Filtered out ${response.content.length - newPosts.length} duplicate posts on page ${pageToLoad}`);
        }
        
        return [...prev, ...newPosts];
      });
      
      const newHasMore = response.page?.number < response.page?.totalPages - 1;
      setPage(pageToLoad);
      setHasMore(newHasMore);
      setInitialLoadDone(true);
      hasInitialLoadedRef.current = true;
      
      setRetryCount(0);
      setIsRetrying(false);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      setRetryCount(0);
      setInitialLoadDone(true);
      hasInitialLoadedRef.current = true;
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated, externalPosts]);

  const loadMorePosts = useCallback(() => {
    if (!isLoadingRef.current && hasMore && !externalPosts) {
      loadPosts(page + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, page, externalPosts]); // loadPosts intentionally excluded to prevent infinite loop

  // Validate token before loading posts
  React.useEffect(() => {
    const validateToken = async () => {
      if (tokenValidationRef.current || externalPosts || !isAuthenticated) {
        debugLogger.log('UserFeed', 'Skipping token validation', { 
          alreadyValidated: tokenValidationRef.current, 
          hasExternalPosts: !!externalPosts, 
          isAuthenticated 
        });
        return;
      }

      tokenValidationRef.current = true;
      debugLogger.log('UserFeed', '🔐 Starting token validation: POST /api/auth/validate');
      
      try {
        const isValid = await apiAuthService.validateToken();
        debugLogger.log('UserFeed', isValid ? '✅ Token validation SUCCESS' : '❌ Token validation FAILED', { isValid });
        setTokenValidated(isValid);
        
        if (!isValid) {
          debugLogger.log('UserFeed', '⚠️ Token invalid - clearing tokens and switching to public feed');
          // Clear invalid token from both memory and localStorage
          apiClient.clearTokens();
          
          // Notify parent component that token validation failed
          if (onTokenValidationFailed) {
            debugLogger.log('UserFeed', '📢 Notifying parent: token validation failed');
            onTokenValidationFailed();
          }
        } else {
          debugLogger.log('UserFeed', '🎉 Token validated successfully - ready to load user feed');
        }
      } catch (error) {
        debugLogger.log('UserFeed', '💥 Token validation error (network/API issue):', error);
        setTokenValidated(false);
        
        // Clear tokens on validation error from both memory and localStorage
        apiClient.clearTokens();
        
        // Notify parent component that token validation failed
        if (onTokenValidationFailed) {
          debugLogger.log('UserFeed', '📢 Notifying parent: token validation error');
          onTokenValidationFailed();
        }
      }
    };

    validateToken();
  }, [isAuthenticated, externalPosts, onTokenValidationFailed]);

  React.useEffect(() => {
    if (isAuthenticated && tokenValidated === true && !hasInitialLoadedRef.current && !externalPosts) {
      debugLogger.log('UserFeed', '🚀 Triggering initial load: GET /api/posts/feed/user (after token validation success)');
      loadPosts(0);
    } else {
      debugLogger.log('UserFeed', 'Waiting for conditions before loading posts', { 
        isAuthenticated, 
        tokenValidated, 
        hasInitialLoaded: hasInitialLoadedRef.current, 
        hasExternalPosts: !!externalPosts 
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, tokenValidated, externalPosts]); // loadPosts intentionally excluded

  React.useEffect(() => {
    if (!user || !isAuthenticated) {
      return;
    }

    const handlePostUpdate = (message: any) => {
      debugLogger.log('UserFeed', 'Received post update via WebSocket:', message);

      if (message.type === 'POST_UPDATED') {
        const updatedPost = message.data;
        debugLogger.log('UserFeed', 'Post updated successfully:', updatedPost);

        setInternalPosts(prev => {
          // Check if post already exists
          const existingIndex = prev.findIndex(p => p.id === updatedPost.id);
          
          if (existingIndex >= 0) {
            // Update existing post
            const newPosts = [...prev];
            newPosts[existingIndex] = updatedPost;
            return newPosts;
          } else {
            // Add new post to the top
            return [updatedPost, ...prev];
          }
        });

        // Remove from pending
        setPendingPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(message.postId);
          return newSet;
        });
      } else if (message.type === 'POST_UPDATE_FAILED') {
        debugLogger.log('UserFeed', 'Post update failed:', message);
        
        // Mark post as failed
        setInternalPosts(prev => prev.map(p => 
          p.id === message.postId ? { ...p, createFailed: true, isPending: false } : p
        ));

        // Remove from pending
        setPendingPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(message.postId);
          return newSet;
        });
      }
    };

    // Subscribe to user's post updates
    websocketService.subscribeToUserPosts(user.id, handlePostUpdate);

    return () => {
      websocketService.unsubscribeFromUserPosts(user.id);
    };
  }, [user, isAuthenticated]);

  // Mark as loaded if using external posts
  React.useEffect(() => {
    if (externalPosts) {
      setInitialLoadDone(true);
    }
  }, [externalPosts]);



  useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMorePosts,
    threshold: 200
  });

  const handleReaction = async (postId: number, reaction: ReactionType) => {
    try {
      await postService.reactToPost(postId, { type: reaction });
      setInternalPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const updatedPost = { ...post };
          if (!updatedPost.reactions) {
            updatedPost.reactions = {
              totalCount: 0,
              reactionCounts: [],
              recentReactions: [],
              currentUserReacted: false,
              currentUserReactionType: null
            };
          }
          updatedPost.reactions.totalCount = (updatedPost.reactions.totalCount || 0) + 1;
          updatedPost.reactions.currentUserReacted = true;
          updatedPost.reactions.currentUserReactionType = reaction;
          return updatedPost;
        }
        return post;
      }));
    } catch (err) {
      console.error('Error reacting to post:', err);
    }
  };

  const handleUnreact = async (postId: number) => {
    try {
      await postService.unreactPost(postId);
      setInternalPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const updatedPost = { ...post };
          if (!updatedPost.reactions) {
            updatedPost.reactions = {
              totalCount: 0,
              reactionCounts: [],
              recentReactions: [],
              currentUserReacted: false,
              currentUserReactionType: null
            };
          }
          updatedPost.reactions.totalCount = Math.max((updatedPost.reactions.totalCount || 0) - 1, 0);
          updatedPost.reactions.currentUserReacted = false;
          updatedPost.reactions.currentUserReactionType = null;
          return updatedPost;
        }
        return post;
      }));
    } catch (err) {
      console.error('Error unreacting to post:', err);
    }
  };

  const handleComment = async (postId: number, content: string) => {
    try {
      setInternalPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            commentCount: post.commentCount + 1
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error commenting on post:', err);
    }
  };

  const handleShare = async (postId: number) => {
    try {
      await postService.sharePost(postId, {});
      setInternalPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            shareCount: post.shareCount + 1
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error sharing post:', err);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    setPage(0);
    setInternalPosts([]);
    setHasMore(true);
    setInitialLoadDone(false);
    hasInitialLoadedRef.current = false;
    isLoadingRef.current = false;
    loadPosts(0);
  };

  const handleDelete = (postId: number) => {
    if (onDeletePost) {
      onDeletePost(postId);
    } else {
      setInternalPosts((prev) => prev.filter((post) => post.id !== postId));
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải bài viết</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // If token validation failed, return null to let parent component handle (show public posts)
  if (tokenValidated === false) {
    return null;
  }

  if (!isLoading && !initialLoadDone) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isLoading && (!posts || posts.length === 0) && initialLoadDone && tokenValidated === true) {
    return (
      <EmptyState
        type="empty"
        title="Chưa có bài viết nào"
        description="Hãy theo dõi người khác hoặc tham gia nhóm để xem bài viết trong feed của bạn"
      />
    );
  }

  return (
    <div className={className}>
      {posts && Array.isArray(posts) && posts.map((post, index) => (
        <PostCard
          key={`feed-post-${post.id}-${index}`}
          post={post}
          onReaction={handleReaction}
          onUnreact={handleUnreact}
          onComment={handleComment}
          onShare={handleShare}
          onDelete={() => handleDelete(post.id)}
        />
      ))}
      {hasMore && !isLoading && (
        <div className="text-center py-4">
          <button
            onClick={loadMorePosts}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Tải thêm bài viết
          </button>
        </div>
      )}
      
      {isLoading && (
        <>
          {isRetrying && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-yellow-800">Đang thử lại... ({retryCount + 1}/3)</span>
              </div>
            </div>
          )}
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}
    </div>
  );
};

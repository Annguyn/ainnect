import React, { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PostCard } from '../PostCard';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { Post, postService } from '../../services/postService';
import { PostSkeleton } from '../PostSkeleton';
import { EmptyState } from '../EmptyState';
import type { ReactionType } from '../ReactionPicker';

interface UserFeedProps {
  className?: string;
  posts?: Post[]; // Allow external posts
  onDeletePost?: (postId: number) => void; // Callback for post deletion
}

export const UserFeed: React.FC<UserFeedProps> = ({
  className = '',
  posts: externalPosts,
  onDeletePost
}) => {
  const { isAuthenticated } = useAuth();
  const [internalPosts, setInternalPosts] = useState<Post[]>([]);
  const posts = externalPosts || internalPosts; // Use external posts if provided
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const loadPosts = useCallback(async (pageToLoad: number, isRetry = false) => {
    if (!isAuthenticated) {
      return;
    }
    console.log('loadPosts called:', { isLoading, hasMore, page: pageToLoad, isRetry });
    
    if (isLoading) {
      console.log('Skipping loadPosts - isLoading:', isLoading);
      return;
    }

    console.log('Loading posts for page:', pageToLoad, isRetry ? `(retry ${retryCount + 1}/3)` : '');
    setIsLoading(true);
    if (!isRetry) {
      setError(null);
    }

    try {
      const response = await postService.getFeedPosts(pageToLoad, 5);
      console.log('Got response:', {
        content: response.content.length,
        totalPages: response.page.totalPages,
        currentPage: response.page.number,
        fullResponse: response
      });
      
      setInternalPosts(prev => {
        const existingIds = new Set(prev.map(post => post.id));
        const newPosts = response.content.filter(post => !existingIds.has(post.id));
        
        if (newPosts.length !== response.content.length) {
          console.warn(`Filtered out ${response.content.length - newPosts.length} duplicate posts on page ${pageToLoad}`);
        }
        
        return [...prev, ...newPosts];
      });
      
      const newHasMore = response.page.number < response.page.totalPages - 1;
      console.log('Pagination debug:', {
        currentPage: response.page.number,
        totalPages: response.page.totalPages,
        hasMore: newHasMore,
        nextPage: pageToLoad + 1
      });
      setPage(pageToLoad);
      setHasMore(newHasMore);
      setInitialLoadDone(true);
      
      setRetryCount(0);
    } catch (err) {
      console.error('Error loading posts:', err);
      
      if (retryCount < 2) {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        setIsRetrying(true);
        
        console.log(`Retrying load posts (attempt ${newRetryCount + 1}/3) in 2 seconds...`);
        
        setTimeout(() => {
          setIsRetrying(false);
          loadPosts(pageToLoad, true);
        }, 2000);
      } else {
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
        setRetryCount(0);
        setInitialLoadDone(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, retryCount, isAuthenticated]);

  const loadMorePosts = useCallback(() => {
    console.log('loadMorePosts called:', { isLoading, hasMore, page });
    if (!isLoading && hasMore) {
      loadPosts(page + 1);
    }
  }, [isLoading, hasMore, page, loadPosts]);

  React.useEffect(() => {
    if (isAuthenticated && !initialLoadDone && !isLoading) {
      loadPosts(0);
    }
  }, [isAuthenticated, initialLoadDone, isLoading, loadPosts]);

  React.useEffect(() => {
    const logScrollPosition = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 200;
      
      console.log('Scroll debug:', {
        scrollTop,
        windowHeight,
        documentHeight,
        isNearBottom,
        hasMore,
        isLoading,
        threshold: 200
      });
    };

    window.addEventListener('scroll', logScrollPosition);
    return () => window.removeEventListener('scroll', logScrollPosition);
  }, [hasMore, isLoading]);

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

  if (!isLoading && !initialLoadDone) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isLoading && posts.length === 0 && initialLoadDone) {
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
      {posts.map((post, index) => (
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

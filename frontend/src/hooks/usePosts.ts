import { useState, useEffect, useCallback } from 'react';
import { postService, Post, CreatePostRequest } from '../services/postService';
import { commentService, CreateCommentRequest } from '../services/commentService';
import { useAuth } from './useAuth';
import { debugLogger } from '../utils/debugLogger';
import { transformPost } from '../utils/postUtils';


export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const { user } = useAuth();

  const loadPosts = useCallback(async (page = 0, reset = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try multiple approaches to get posts
      let response;
      let posts: any[] = [];
      
      try {
        // Try getting posts from personalized feed endpoint
        response = await postService.getFeedPosts(page, 5);
        posts = (response.content || []).map(transformPost);
        console.log('Loaded posts from personalized feed endpoint');
        
        // Debug: Check first post reaction state after transformation
        if (posts.length > 0) {
          const firstPost = posts[0];
          debugLogger.log('usePosts', 'First post after transformation', {
            postId: firstPost.id,
            userReaction: firstPost.userReaction,
            reactions: firstPost.reactions,
            currentUserReacted: firstPost.reactions?.currentUserReacted,
            currentUserReactionType: firstPost.reactions?.currentUserReactionType
          });
        }
      } catch (feedError) {
        console.warn('Personalized feed endpoint not available, trying user-specific posts');
        
        try {
          // Try getting posts by current user first
          if (user) {
            response = await postService.getPostsByAuthor(user.id, page, 5);
            posts = (response.content || []).map(transformPost);
            console.log(`Loaded posts for user ${user.id}`);
          } else {
            throw new Error('No user available');
          }
        } catch (userPostsError) {
          console.warn('User posts not available, trying other users');
          
          try {
            // Try getting posts by other users (fallback to simulate feed)
            const userIds = [1, 2, 3]; // Try multiple users
            let allPosts: any[] = [];
            
            for (const userId of userIds) {
              try {
                const userResponse = await postService.getPostsByAuthor(userId, 0, 1);
                allPosts = [...allPosts, ...(userResponse.content || [])];
              } catch (e) {
                console.warn(`Failed to load posts for user ${userId}`);
              }
            }
            
            if (allPosts.length > 0) {
              posts = allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              response = {
                content: posts,
                totalElements: posts.length,
                totalPages: 1,
                size: 10,
                number: 0
              };
              console.log('Loaded posts from multiple users');
            } else {
              throw new Error('No posts from any user');
            }
          } catch (fallbackError) {
            console.error('All API methods failed');
            // No mock data - just set empty posts and let UI handle empty state
            posts = [];
            response = {
              content: [],
              totalElements: 0,
              totalPages: 0,
              size: 10,
              number: 0
            };
            throw new Error('Unable to load posts from any source');
          }
        }
      }
      
      // Debug logging to see the actual post structure
      console.log('Posts received from API:', posts);
      if (posts.length > 0) {
        console.log('First post structure:', posts[0]);
        console.log('First post author:', posts[0].author);
      }
      
      if (reset || page === 0) {
        setPosts(posts);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(post => post.id));
          const newPosts = posts.filter(post => !existingIds.has(post.id));
          return [...prev, ...newPosts];
        });
      }
      
      setHasMore(response && response.page ? response.page.number < response.page.totalPages - 1 : false);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, user]);

  const loadMorePosts = useCallback(() => {
    if (hasMore && !isLoading) {
      loadPosts(currentPage + 1, false);
    }
  }, [hasMore, isLoading, currentPage, loadPosts]);

  const refreshPosts = useCallback(() => {
    loadPosts(0, true);
  }, [loadPosts]);

  const createPost = useCallback(async (content: string, visibility: 'public_' | 'friends' | 'private' = 'public_', mediaFiles?: File[]) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const postData: CreatePostRequest = {
      content,
      visibility,
      groupId: null,
      mediaFiles: mediaFiles || []
    };

    try {
      const newPost = await postService.createPost(postData);
      console.log(`Successfully created post ${newPost.id} by user ${user.id}`);
      
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.message || 'Failed to create post');
      throw err;
    }
  }, [user]);

  const reactToPost = useCallback(async (postId: number, reactionType: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') => {
    debugLogger.log('usePosts', 'reactToPost called', { postId, reactionType, userId: user?.id });
    
    if (!user) {
      debugLogger.log('usePosts', 'Cannot react to post: user not authenticated');
      console.warn('Cannot react to post: user not authenticated');
      return;
    }

    try {
      await postService.reactToPost(postId, { type: reactionType });
      debugLogger.log('usePosts', 'Successfully reacted to post', { postId, reactionType });
      console.log(`Successfully reacted to post ${postId} with ${reactionType}`);
      
      await loadPosts(0, true);
      debugLogger.log('usePosts', 'Posts refreshed after reaction', { postId, reactionType });
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const currentReactions = post.reactionsCount || { like: 0, love: 0, wow: 0, sad: 0, angry: 0, haha: 0, total: 0 };
          const oldReaction = post.userReaction as keyof typeof currentReactions;
          
          const newReactions = { ...currentReactions };
          
          if (oldReaction && oldReaction in newReactions) {
            newReactions[oldReaction] = Math.max(0, newReactions[oldReaction] - 1);
            newReactions.total = Math.max(0, newReactions.total - 1);
          }
          
          if (reactionType in newReactions) {
            newReactions[reactionType as keyof typeof newReactions] = (newReactions[reactionType as keyof typeof newReactions] || 0) + 1;
            newReactions.total = newReactions.total + 1;
          }
          
          return {
            ...post,
            userReaction: reactionType,
            reactionsCount: newReactions,
            reactions: {
              ...post.reactions,
              currentUserReacted: true,
              currentUserReactionType: reactionType,
              totalCount: newReactions.total,
              reactionCounts: post.reactions?.reactionCounts || []
            }
          };
        }
        return post;
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to react to post');
      console.error('Error reacting to post:', err);
    }
  }, [user]);

  const unreactToPost = useCallback(async (postId: number) => {
    debugLogger.log('usePosts', 'unreactToPost called', { postId, userId: user?.id });
    
    if (!user) {
      debugLogger.log('usePosts', 'Cannot unreact to post: user not authenticated');
      console.warn('Cannot unreact to post: user not authenticated');
      return;
    }

    try {
      await postService.unreactPost(postId);
      debugLogger.log('usePosts', 'Successfully unreacted to post', { postId });
      console.log(`Successfully removed reaction from post ${postId}`);
      
      await loadPosts(0, true);
      debugLogger.log('usePosts', 'Posts refreshed after unreaction', { postId });
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const currentReactions = post.reactionsCount || { like: 0, love: 0, wow: 0, sad: 0, angry: 0, haha: 0, total: 0 };
          const oldReaction = post.userReaction as keyof typeof currentReactions;
          
          const newReactions = { ...currentReactions };
          
          if (oldReaction && oldReaction in newReactions) {
            newReactions[oldReaction] = Math.max(0, newReactions[oldReaction] - 1);
            newReactions.total = Math.max(0, newReactions.total - 1);
          }
          
          return {
            ...post,
            userReaction: null,
            reactionsCount: newReactions,
            reactions: {
              ...post.reactions,
              currentUserReacted: false,
              currentUserReactionType: null,
              totalCount: newReactions.total,
              reactionCounts: post.reactions?.reactionCounts || []
            }
          };
        }
        return post;
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to remove reaction');
      debugLogger.log('usePosts', 'Failed to unreact to post', { postId, error: err });
      console.error('Error removing reaction:', err);
    }
  }, [user]);

  const toggleLike = useCallback(async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post?.userReaction === 'like') {
      await unreactToPost(postId);
    } else {
      await reactToPost(postId, 'like');
    }
  }, [posts, reactToPost, unreactToPost]);

  const addComment = useCallback(async (postId: number, content: string, parentId?: number) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const commentData: CreateCommentRequest = {
      content,
      parentId
    };

    try {
      const commentId = await commentService.addCommentToPost(postId, commentData);
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            commentsCount: (post.commentsCount || post.commentCount || 0) + 1,
            commentCount: (post.commentCount || post.commentsCount || 0) + 1
          };
        }
        return post;
      }));
      
      return commentId;
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
      throw err;
    }
  }, [user]);

  const sharePost = useCallback(async (postId: number, comment?: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const shareId = await postService.sharePost(postId, {
        comment
      });
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            sharesCount: (post.sharesCount || post.shareCount || 0) + 1,
            shareCount: (post.shareCount || post.sharesCount || 0) + 1
          };
        }
        return post;
      }));
      
      return shareId;
    } catch (err: any) {
      setError(err.message || 'Failed to share post');
      throw err;
    }
  }, [user]);

  const deletePost = useCallback(async (postId: number) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await postService.deletePost(postId);
      console.log(`Successfully deleted post ${postId}`);
      
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
      console.error('Error deleting post:', err);
      throw err;
    }
  }, [user]);

  useEffect(() => {
    loadPosts(0, true);
  }, []);

  return {
    posts,
    isLoading,
    error,
    hasMore,
    loadMorePosts,
    refreshPosts,
    createPost,
    toggleLike,
    reactToPost,
    unreactToPost,
    addComment,
    sharePost,
    deletePost,
    clearError: () => setError(null)
  };
};

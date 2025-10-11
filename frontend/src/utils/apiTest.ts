import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { debugLogger } from './debugLogger';

/**
 * Test API response structure for debugging reaction persistence issue
 */
export const testApiResponse = async () => {
  try {
    debugLogger.log('ApiTest', 'Testing API response structure');
    
    // First, get current user profile to check user ID
    const currentUser = await userService.getProfile();
    debugLogger.log('ApiTest', 'Current user profile', {
      userId: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName
    });
    
    // Get posts from API
    const response = await postService.getNewsFeed(0, 5);
    const posts = response.content || [];
    
    debugLogger.log('ApiTest', 'Raw API response', {
      totalPosts: posts.length,
      currentUserId: currentUser.id,
      firstPostRaw: posts[0] ? {
        id: posts[0].id,
        userReaction: posts[0].userReaction,
        reactions: posts[0].reactions,
        // Check all possible reaction fields
        reactionCount: posts[0].reactionCount,
        reactionsCount: posts[0].reactionsCount,
        // Check author fields
        authorId: posts[0].authorId,
        authorUsername: posts[0].authorUsername,
        authorDisplayName: posts[0].authorDisplayName,
        authorAvatarUrl: posts[0].authorAvatarUrl,
        // Check if current user is in recent reactions
        recentReactions: posts[0].reactions?.recentReactions?.map(r => ({
          userId: r.userId,
          username: r.username,
          displayName: r.displayName,
          type: r.type,
          isCurrentUser: r.userId === currentUser.id
        }))
      } : null
    });
    
    // Test transformation
    if (posts.length > 0) {
      const { transformPost } = await import('./postUtils');
      const transformedPost = transformPost(posts[0]);
      
      debugLogger.log('ApiTest', 'After transformation', {
        postId: transformedPost.id,
        userReaction: transformedPost.userReaction,
        reactions: transformedPost.reactions,
        currentUserReacted: transformedPost.reactions?.currentUserReacted,
        currentUserReactionType: transformedPost.reactions?.currentUserReactionType,
        author: transformedPost.author
      });
    }
    
    return {
      success: true,
      postsCount: posts.length,
      firstPost: posts[0] || null
    };
    
  } catch (error) {
    debugLogger.log('ApiTest', 'Test failed', error);
    return {
      success: false,
      error: error
    };
  }
};

/**
 * Test JWT token content
 */
export const testJwtToken = () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      debugLogger.log('ApiTest', 'No JWT token found');
      return null;
    }
    
    // Decode JWT token (without verification)
    const parts = token.split('.');
    if (parts.length !== 3) {
      debugLogger.log('ApiTest', 'Invalid JWT token format');
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    debugLogger.log('ApiTest', 'JWT token payload', {
      userId: payload.userId || payload.sub || payload.id,
      username: payload.username,
      email: payload.email,
      exp: payload.exp,
      iat: payload.iat,
      fullPayload: payload
    });
    
    return payload;
  } catch (error) {
    debugLogger.log('ApiTest', 'Failed to decode JWT token', error);
    return null;
  }
};

/**
 * Test reaction button state calculation
 */
export const testReactionButtonState = (post: any) => {
  const userReaction = post.reactions?.currentUserReactionType || post.userReaction;
  const totalCount = post.reactions?.totalCount || post.reactionCount;
  const hasReacted = post.reactions?.currentUserReacted || !!userReaction;
  
  debugLogger.log('ApiTest', 'ReactionButton state calculation', {
    postId: post.id,
    userReaction,
    totalCount,
    hasReacted,
    currentUserReacted: post.reactions?.currentUserReacted,
    currentUserReactionType: post.reactions?.currentUserReactionType,
    legacyUserReaction: post.userReaction
  });
  
  return {
    userReaction,
    totalCount,
    hasReacted
  };
};

/**
 * Test reaction API directly
 */
export const testReactionApi = async (postId: number) => {
  try {
    debugLogger.log('ApiTest', 'Testing reaction API directly', { postId });
    
    // Get current user
    const currentUser = await userService.getProfile();
    
    // Get post reactions
    const reactions = await postService.getPostReactions(postId, 0, 10);
    
    debugLogger.log('ApiTest', 'Post reactions API response', {
      postId,
      currentUserId: currentUser.id,
      reactions: reactions.content?.map(r => ({
        userId: r.userId,
        username: r.username,
        displayName: r.displayName,
        type: r.type,
        isCurrentUser: r.userId === currentUser.id
      }))
    });
    
    return {
      success: true,
      currentUserId: currentUser.id,
      reactions: reactions.content || []
    };
    
  } catch (error) {
    debugLogger.log('ApiTest', 'Reaction API test failed', error);
    return {
      success: false,
      error: error
    };
  }
};

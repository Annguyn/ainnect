import { Post } from '../services/postService';
import { debugLogger } from './debugLogger';

/**
 * Get current user ID from JWT token
 */
const getCurrentUserId = (): number | null => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.userId || payload.sub || payload.id || null;
  } catch (error) {
    debugLogger.log('PostUtils', 'Failed to get current user ID from JWT', error);
    return null;
  }
};

/**
 * Transform post data from backend to ensure backward compatibility
 * and populate computed properties
 */
export const transformPost = (post: Post): Post => {
  debugLogger.log('PostUtils', 'Transforming post data', {
    postId: post.id,
    hasAuthorData: !!(post.authorUsername || post.authorDisplayName),
    hasLegacyAuthor: !!post.author,
    hasReactions: !!post.reactions,
    hasLegacyReactions: !!post.reactionsCount,
    currentUserReacted: post.reactions?.currentUserReacted,
    currentUserReactionType: post.reactions?.currentUserReactionType,
    legacyUserReaction: post.userReaction,
    // Detailed reaction structure
    reactionsStructure: post.reactions ? {
      totalCount: post.reactions.totalCount,
      currentUserReacted: post.reactions.currentUserReacted,
      currentUserReactionType: post.reactions.currentUserReactionType,
      reactionCounts: post.reactions.reactionCounts,
      recentReactions: post.reactions.recentReactions
    } : null
  });

  // Create author object from flat fields if not already present
  if (!post.author && (post.authorUsername || post.authorDisplayName)) {
    post.author = {
      id: post.authorId,
      username: post.authorUsername || '',
      displayName: post.authorDisplayName || post.authorUsername || '',
      avatarUrl: post.authorAvatarUrl,
      isVerified: false
    };
  }

  // Create reactionsCount from reactions if not already present
  if (!post.reactionsCount && post.reactions) {
    const reactionCounts = post.reactions.reactionCounts || [];
    const getReactionCount = (type: string) => 
      reactionCounts.find(r => r.type === type)?.count || 0;
    
    post.reactionsCount = {
      like: getReactionCount('like'),
      love: getReactionCount('love'),
      wow: getReactionCount('wow'),
      sad: getReactionCount('sad'),
      angry: getReactionCount('angry'),
      haha: getReactionCount('haha'),
      total: post.reactions.totalCount || post.reactionCount || 0
    };
  }

  // Ensure legacy count fields are populated
  if (post.commentsCount === undefined && post.commentCount !== undefined) {
    post.commentsCount = post.commentCount;
  }
  
  if (post.sharesCount === undefined && post.shareCount !== undefined) {
    post.sharesCount = post.shareCount;
  }
  
  // Ensure userReaction is populated from new structure
  if ((post.userReaction === undefined || post.userReaction === null) && post.reactions?.currentUserReactionType !== undefined) {
    post.userReaction = post.reactions.currentUserReactionType;
  }
  
  // Workaround: If backend doesn't recognize user from JWT, check recentReactions
  if ((post.userReaction === undefined || post.userReaction === null) && post.reactions?.recentReactions) {
    // Get current user ID from localStorage or context (we'll need to pass it)
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      const userReaction = post.reactions.recentReactions.find(r => r.userId === currentUserId);
      if (userReaction) {
        post.userReaction = userReaction.type;
        // Also update the reactions object for consistency
        if (post.reactions) {
          post.reactions.currentUserReacted = true;
          post.reactions.currentUserReactionType = userReaction.type;
        }
        debugLogger.log('PostUtils', 'Workaround: Found user reaction in recentReactions', {
          postId: post.id,
          userId: currentUserId,
          reactionType: userReaction.type
        });
      }
    }
  }

  // Fallback for reactions total if not provided
  if (!post.reactionsCount?.total && post.reactionCount !== undefined) {
    post.reactionsCount = {
      ...post.reactionsCount,
      like: post.reactionsCount?.like || 0,
      love: post.reactionsCount?.love || 0,
      wow: post.reactionsCount?.wow || 0,
      sad: post.reactionsCount?.sad || 0,
      angry: post.reactionsCount?.angry || 0,
      haha: post.reactionsCount?.haha || 0,
      total: post.reactionCount
    };
  }

  debugLogger.log('PostUtils', 'Post transformation completed', {
    postId: post.id,
    authorName: post.author?.displayName || post.author?.username,
    reactionTotal: post.reactionsCount?.total || 0,
    commentCount: post.commentsCount || post.commentCount || 0,
    shareCount: post.sharesCount || post.shareCount || 0,
    finalUserReaction: post.userReaction,
    finalCurrentUserReacted: post.reactions?.currentUserReacted,
    // Check if transformation worked correctly
    userReactionTransformed: post.userReaction !== undefined && post.userReaction !== null,
    hasValidReaction: post.userReaction && ['like', 'love', 'haha', 'wow', 'sad', 'angry'].includes(post.userReaction)
  });

  return post;
};

/**
 * Get display name for post author with proper fallback
 */
export const getPostAuthorName = (post: Post): string => {
  // Try new flat fields first
  if (post.authorDisplayName) {
    return post.authorDisplayName;
  }
  
  if (post.authorUsername) {
    return post.authorUsername;
  }

  // Fallback to legacy author object
  if (post.author?.displayName) {
    return post.author.displayName;
  }
  
  if (post.author?.username) {
    return post.author.username;
  }

  // Final fallback
  return `User ${post.authorId}`;
};

/**
 * Get reaction count with proper fallback
 */
export const getReactionCount = (post: Post): number => {
  // Try new ReactionSummary structure first
  if (post.reactions?.totalCount !== undefined) {
    return post.reactions.totalCount;
  }

  if (post.reactionCount !== undefined) {
    return post.reactionCount;
  }

  // Fallback to legacy structure
  if (post.reactionsCount?.total !== undefined) {
    return post.reactionsCount.total;
  }

  return 0;
};

/**
 * Get comment count with proper fallback
 */
export const getCommentCount = (post: Post): number => {
  // Try new structure first
  if (post.commentCount !== undefined) {
    return post.commentCount;
  }

  // Fallback to legacy structure
  if (post.commentsCount !== undefined) {
    return post.commentsCount;
  }

  return 0;
};

/**
 * Get share count with proper fallback
 */
export const getShareCount = (post: Post): number => {
  // Try new structure first
  if (post.shareCount !== undefined) {
    return post.shareCount;
  }

  // Fallback to legacy structure
  if (post.sharesCount !== undefined) {
    return post.sharesCount;
  }

  return 0;
};

/**
 * Get avatar URL for post author
 */
export const getPostAuthorAvatar = (post: Post): string | null => {
  // Try new flat field first
  if (post.authorAvatarUrl !== undefined) {
    return post.authorAvatarUrl;
  }

  // Fallback to legacy author object
  if (post.author?.avatarUrl !== undefined) {
    return post.author.avatarUrl;
  }

  return null;
};

/**
 * Create author object for Avatar component with proper fallback
 */
export const getPostAuthorForAvatar = (post: Post) => {
  const authorName = getPostAuthorName(post);
  const avatarUrl = getPostAuthorAvatar(post);
  
  return {
    userId: post.authorId,
    displayName: authorName,
    username: post.authorUsername || post.author?.username || `user${post.authorId}`,
    avatarUrl: avatarUrl || undefined // Avatar component handles undefined properly
  };
};

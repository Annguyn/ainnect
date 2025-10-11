import { Comment } from '../services/commentService';
import { debugLogger } from './debugLogger';

// Raw API response structure
export interface RawCommentResponse {
  id: number;
  postId: number;
  authorId: number;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId?: number | null;
  reactionCount?: number;
  repliesCount?: number;
  userReaction?: string | null;
}

// Transform raw API response to Comment interface
export const transformComment = (rawComment: RawCommentResponse): Comment => {
  debugLogger.log('CommentUtils', 'Transforming comment', {
    id: rawComment.id,
    author: rawComment.authorUsername,
    content: rawComment.content?.substring(0, 30) + '...'
  });

  const transformed: Comment = {
    id: rawComment.id,
    postId: rawComment.postId,
    authorId: rawComment.authorId,
    parentId: rawComment.parentId,
    content: rawComment.content,
    createdAt: rawComment.createdAt,
    updatedAt: rawComment.updatedAt,
    author: {
      id: rawComment.authorId,
      username: rawComment.authorUsername,
      displayName: rawComment.authorDisplayName,
      avatarUrl: rawComment.authorAvatarUrl,
      isVerified: false // Default value
    },
    reactionsCount: {
      like: rawComment.reactionCount || 0,
      love: 0,
      wow: 0,
      total: rawComment.reactionCount || 0
    },
    repliesCount: rawComment.repliesCount || 0,
    userReaction: rawComment.userReaction,
    replies: []
  };

  debugLogger.log('CommentUtils', 'Comment transformed successfully', {
    id: transformed.id,
    author: transformed.author.username,
    reactionsCount: transformed.reactionsCount.total
  });

  return transformed;
};

// Transform array of raw comments
export const transformComments = (rawComments: RawCommentResponse[]): Comment[] => {
  debugLogger.log('CommentUtils', 'Transforming comments array', {
    count: rawComments.length
  });

  const transformed = rawComments.map(transformComment);
  
  debugLogger.log('CommentUtils', 'Comments array transformed successfully', {
    originalCount: rawComments.length,
    transformedCount: transformed.length
  });

  return transformed;
};

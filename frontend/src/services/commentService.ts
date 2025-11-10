import { apiClient } from './apiClient';
import { debugLogger } from '../utils/debugLogger';
import { transformComments, RawCommentResponse } from '../utils/commentUtils';

// Types for Comments
export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  parentId?: number | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
  };
  reactionsCount: {
    like: number;
    love: number;
    wow: number;
    total: number;
  };
  repliesCount: number;
  userReaction?: string | null;
  hasChild?: boolean;
  replies?: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number | null;
}

export interface CommentReactionRequest {
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
}

export interface CommentsResponse {
  comments: RawCommentResponse[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

class CommentService {
  private baseUrl = '/api/comments';
  private postsUrl = '/api/posts';

  // Add comment to post
  async addCommentToPost(postId: number, commentData: CreateCommentRequest): Promise<number> {
    const endpoint = `${this.postsUrl}/${postId}/comments`;
    debugLogger.logApiCall('POST', endpoint, { postId, commentData });
    try {
      const response = await apiClient.post<number>(endpoint, commentData);
      debugLogger.logApiResponse('POST', endpoint, response);
      
      debugLogger.log('CommentService', `➕ Add Comment API Success`, {
        endpoint,
        postId,
        commentId: response,
        content: commentData.content?.substring(0, 50) + '...',
        parentId: commentData.parentId
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      debugLogger.log('CommentService', `❌ Add Comment API Error`, {
        endpoint,
        postId,
        commentData,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // List comments by post - using the correct endpoint from Postman collection
  async getCommentsByPost(postId: number, page = 0, size = 10): Promise<{ content: Comment[]; totalElements: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }> {
    const endpoint = `${this.baseUrl}/by-post/${postId}`;
    debugLogger.logApiCall('GET', endpoint, { postId, page, size });
    try {
      const response = await apiClient.get<CommentsResponse>(endpoint, {
        params: { page, size }
      });
      debugLogger.logApiResponse('GET', endpoint, response);
      
      // Transform raw comments to Comment interface
      const transformedComments = transformComments(response.comments || []);
      
      debugLogger.log('CommentService', `💬 Get Comments API Success`, {
        endpoint,
        postId,
        page,
        size,
        totalComments: response.totalElements,
        commentsCount: transformedComments.length,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        hasNext: response.hasNext,
        hasPrevious: response.hasPrevious,
        comments: transformedComments.map(c => ({ 
          id: c.id, 
          authorId: c.authorId,
          authorName: c.author.displayName || c.author.username,
          authorUsername: c.author.username,
          content: c.content?.substring(0, 50) + '...',
          reactionsCount: c.reactionsCount?.total || 0,
          repliesCount: c.repliesCount || 0,
          userReaction: c.userReaction,
          createdAt: c.createdAt,
          parentId: c.parentId
        }))
      });
      
      return {
        content: transformedComments,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrevious: response.hasPrevious
      };
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('CommentService', `❌ Get Comments API Error`, {
        endpoint,
        postId,
        page,
        size,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }


  // List replies of a comment
  async getReplies(commentId: number, page = 0, size = 5): Promise<{ content: Comment[]; totalElements: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }> {
    const endpoint = `${this.baseUrl}/${commentId}/replies`;
    debugLogger.logApiCall('GET', endpoint, { commentId, page, size });
    try {
      const response = await apiClient.get<CommentsResponse>(endpoint, {
        params: { page, size }
      });
      debugLogger.logApiResponse('GET', endpoint, response);
      
      // Transform raw comments to Comment interface
      const transformedReplies = transformComments(response.comments || []);
      
      debugLogger.log('CommentService', `💬 Get Replies API Success`, {
        endpoint,
        commentId,
        page,
        size,
        totalReplies: response.totalElements,
        repliesCount: transformedReplies.length,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        hasNext: response.hasNext,
        hasPrevious: response.hasPrevious
      });
      
      return {
        content: transformedReplies,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrevious: response.hasPrevious
      };
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('CommentService', `❌ Get Replies API Error`, {
        endpoint,
        commentId,
        page,
        size,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Reply to a comment
  async replyToComment(commentId: number, replyData: { content: string }): Promise<number> {
    const endpoint = `${this.baseUrl}/${commentId}/replies`;
    debugLogger.logApiCall('POST', endpoint, { commentId, replyData });
    try {
      const response = await apiClient.post<number>(endpoint, replyData);
      debugLogger.logApiResponse('POST', endpoint, response);
      
      debugLogger.log('CommentService', `💬 Reply to Comment API Success`, {
        endpoint,
        commentId,
        replyId: response,
        content: replyData.content?.substring(0, 50) + '...'
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      debugLogger.log('CommentService', `❌ Reply to Comment API Error`, {
        endpoint,
        commentId,
        replyData,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // React to a comment
  async reactToComment(commentId: number, reactionData: CommentReactionRequest): Promise<void> {
    const endpoint = `${this.baseUrl}/${commentId}/reactions`;
    debugLogger.logApiCall('POST', endpoint, { commentId, reactionData });
    try {
      const response = await apiClient.post(endpoint, reactionData);
      debugLogger.logApiResponse('POST', endpoint, response);
      
      debugLogger.log('CommentService', `👍 React to Comment API Success`, {
        endpoint,
        commentId,
        reactionType: reactionData.type,
        response: response
      });
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      debugLogger.log('CommentService', `❌ React to Comment API Error`, {
        endpoint,
        commentId,
        reactionType: reactionData.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Remove reaction from comment
  async unreactComment(commentId: number): Promise<void> {
    const endpoint = `${this.baseUrl}/${commentId}/reactions`;
    debugLogger.logApiCall('DELETE', endpoint, { commentId });
    try {
      const response = await apiClient.delete(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, response);
      
      debugLogger.log('CommentService', `👎 Unreact Comment API Success`, {
        endpoint,
        commentId,
        response: response
      });
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      debugLogger.log('CommentService', `❌ Unreact Comment API Error`, {
        endpoint,
        commentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async deleteComment(commentId: number): Promise<void> {
    const endpoint = `${this.baseUrl}/${commentId}`;
    debugLogger.logApiCall('DELETE', endpoint, { commentId });
    try {
      const response = await apiClient.delete(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, response);
      debugLogger.log('CommentService', `🗑️ Delete Comment API Success`, {
        endpoint,
        commentId,
        response: response
      });
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      debugLogger.log('CommentService', `❌ Delete Comment API Error`, {
        endpoint,
        commentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getCommentReactions(commentId: number, page = 0, size = 20): Promise<any[]> {
    const endpoint = `${this.baseUrl}/${commentId}/reactions`;
    debugLogger.logApiCall('GET', endpoint, { commentId, page, size });
    try {
      const response = await apiClient.get<any[]>(endpoint, {
        params: { page, size }
      });
      debugLogger.logApiResponse('GET', endpoint, response);
      
      debugLogger.log('CommentService', `👥 Get Comment Reactions API Success`, {
        endpoint,
        commentId,
        reactionsCount: response.length
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('CommentService', `❌ Get Comment Reactions API Error`, {
        endpoint,
        commentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async toggleLike(commentId: number): Promise<void> {
    try {
      await this.reactToComment(commentId, { type: 'like' });
    } catch (error: any) {
      if (error.response?.status === 409) {
        await this.unreactComment(commentId);
      } else {
        throw error;
      }
    }
  }
}

export const commentService = new CommentService();

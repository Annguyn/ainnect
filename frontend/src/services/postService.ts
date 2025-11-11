import { apiClient } from './apiClient';
import { debugLogger } from '../utils/debugLogger';

// Types for Posts
export interface Media {
  id: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
}

export interface Post {
  id: number;
  authorId: number;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl?: string | null;
  groupId?: number | null;
  content: string;
  visibility: 'public_' | 'friends' | 'private';
  commentCount: number;
  reactionCount: number;
  shareCount: number;
  reactions?: {
    totalCount: number;
    reactionCounts: Array<{
      type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
      count: number;
    }>;
    recentReactions?: Array<{
      id: number;
      type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
      userId: number;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
      createdAt: string;
    }>;
    currentUserReacted: boolean;
    currentUserReactionType?: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | null;
  };
  createdAt: string;
  updatedAt: string;
  userReaction?: string | null;
  images?: string[];
  media?: Media[]; // Add media property to support images and videos
  
  // Legacy support - computed properties for backward compatibility
  author?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
  };
  reactionsCount?: {
    like: number;
    love: number;
    wow: number;
    sad: number;
    angry: number;
    haha: number;
    total: number;
  };
  commentsCount?: number;
  sharesCount?: number;
}

export interface CreatePostRequest {
  content: string;
  visibility: 'public_' | 'friends' | 'private';
  groupId?: number | null;
  mediaFiles?: File[];
}

export interface UpdatePostRequest {
  content?: string;
  visibility?: 'public_' | 'friends' | 'private';
  mediaFiles?: File[];
}

export interface PostReactionRequest {
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
}

export interface SharePostRequest {
  comment?: string;
}

export interface PostsResponse {
  content: Post[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

class PostService {
  private baseUrl = '/api/posts';

  // Create a new post with FormData
  async createPost(postData: CreatePostRequest): Promise<Post> {
    debugLogger.logApiCall('POST', this.baseUrl, postData);
    try {
      const formData = new FormData();
      formData.append('content', postData.content);
      formData.append('visibility', postData.visibility);
      
      if (postData.groupId) {
        formData.append('groupId', postData.groupId.toString());
      }
      
      if (postData.mediaFiles && postData.mediaFiles.length > 0) {
        postData.mediaFiles.forEach((file) => {
          formData.append('mediaFiles', file);
        });
      }

      const response = await apiClient.post<Post>(this.baseUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('POST', this.baseUrl, response);
      return response;
    } catch (error) {
      debugLogger.logApiResponse('POST', this.baseUrl, null, error);
      throw error;
    }
  }

  // Create Post with Direct Media Upload
  async createPostWithMedia(formData: FormData): Promise<Post> {
    debugLogger.logApiCall('POST', `${this.baseUrl}/with-media`, formData);
    try {
      const response = await apiClient.post<Post>(`${this.baseUrl}/with-media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('POST', `${this.baseUrl}/with-media`, response);
      return response;
    } catch (error) {
      debugLogger.logApiResponse('POST', `${this.baseUrl}/with-media`, null, error);
      throw error;
    }
  }

  // Get a specific post
  async getPost(postId: number): Promise<Post> {
    return await apiClient.get<Post>(`${this.baseUrl}/${postId}`);
  }

  // Update a post with FormData
  async updatePost(postId: number, updateData: UpdatePostRequest): Promise<Post> {
    debugLogger.logApiCall('PUT', `${this.baseUrl}/${postId}`, updateData);
    try {
      const formData = new FormData();
      
      if (updateData.content) {
        formData.append('content', updateData.content);
      }
      
      if (updateData.visibility) {
        formData.append('visibility', updateData.visibility);
      }
      
      if (updateData.mediaFiles && updateData.mediaFiles.length > 0) {
        updateData.mediaFiles.forEach((file) => {
          formData.append('mediaFiles', file);
        });
      }

      const response = await apiClient.put<Post>(`${this.baseUrl}/${postId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('PUT', `${this.baseUrl}/${postId}`, response);
      return response;
    } catch (error) {
      debugLogger.logApiResponse('PUT', `${this.baseUrl}/${postId}`, null, error);
      throw error;
    }
  }

  // Update Post with Direct Media Upload
  async updatePostWithMedia(postId: number, formData: FormData): Promise<Post> {
    debugLogger.logApiCall('PUT', `${this.baseUrl}/${postId}/with-media`, formData);
    try {
      const response = await apiClient.put<Post>(`${this.baseUrl}/${postId}/with-media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('PUT', `${this.baseUrl}/${postId}/with-media`, response);
      return response;
    } catch (error) {
      debugLogger.logApiResponse('PUT', `${this.baseUrl}/${postId}/with-media`, null, error);
      throw error;
    }
  }

  // Delete a post
  async deletePost(postId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${postId}`);
  }

  async getFeedPosts(page = 0, size = 5): Promise<PostsResponse> {
    const endpoint = `${this.baseUrl}/feed/user`;
    debugLogger.logApiCall('GET', endpoint, { page, size });
    try {
      const response = await apiClient.get<any>(endpoint, {
        params: { page, size }
      });
      debugLogger.logApiResponse('GET', endpoint, response);
      
      // Transform response to match PostsResponse interface
      const transformedResponse: PostsResponse = {
        content: response.content || [],
        page: {
          number: response.number || response.pageable?.pageNumber || 0,
          size: response.size || response.pageable?.pageSize || size,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0
        }
      };
      
      debugLogger.log('PostService', 'Personalized feed loaded', {
        postsCount: transformedResponse.content?.length || 0,
        totalElements: transformedResponse.page.totalElements,
        totalPages: transformedResponse.page.totalPages
      });
      return transformedResponse;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  // List posts by author
  async getPostsByAuthor(authorId: number, page = 0, size = 5): Promise<PostsResponse> {
    const endpoint = this.baseUrl;
    debugLogger.logApiCall('GET', endpoint, { authorId, page, size });
    try {
      const response = await apiClient.get<PostsResponse>(endpoint, {
        params: { authorId, page, size }
      });
      debugLogger.logApiResponse('GET', endpoint, response);
      debugLogger.log('PostService', 'Posts by author loaded', {
        authorId,
        postsCount: response.content?.length || 0,
        firstPostReactionInfo: response.content?.[0] ? {
          postId: response.content[0].id,
          userReaction: response.content[0].userReaction,
          hasReactionsObj: !!response.content[0].reactions,
          currentUserReacted: response.content[0].reactions?.currentUserReacted,
          currentUserReactionType: response.content[0].reactions?.currentUserReactionType
        } : null
      });
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  // Get all posts (simulating news feed since no specific feed endpoint exists)
  async getAllPosts(page = 0, size = 5): Promise<PostsResponse> {
    return await apiClient.get<PostsResponse>(this.baseUrl, {
      params: { page, size }
    });
  }

  // Get news feed posts using dedicated feed endpoint
  async getNewsFeed(page = 0, size = 5, sort = 'createdAt,desc'): Promise<PostsResponse> {
    const endpoint = `${this.baseUrl}/feed`;
    debugLogger.logApiCall('GET', endpoint, { page, size, sort });
    try {
      const response = await apiClient.get<PostsResponse>(endpoint, {
        params: { page, size, sort }
      });
      debugLogger.logApiResponse('GET', endpoint, response);
      
      // Enhanced debug logging
      debugLogger.log('PostService', `📰 News Feed API Response`, {
        endpoint,
        page,
        size,
        sort,
        totalPosts: response.content?.length || 0,
        totalElements: response.page.totalElements,
        totalPages: response.page.totalPages,
        currentPage: response.page.number,
        hasNext: response.page.number < response.page.totalPages - 1,
        posts: response.content?.map(p => ({
          id: p.id,
          author: p.authorUsername,
          displayName: p.authorDisplayName,
          content: p.content?.substring(0, 50) + '...',
          reactions: p.reactions?.totalCount || 0,
          comments: p.commentCount || 0,
          shares: p.shareCount || 0,
          visibility: p.visibility,
          createdAt: p.createdAt,
          userReaction: p.userReaction,
          currentUserReacted: p.reactions?.currentUserReacted,
          currentUserReactionType: p.reactions?.currentUserReactionType,
          recentReactionsCount: p.reactions?.recentReactions?.length || 0
        }))
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('PostService', `❌ News Feed API Error`, {
        endpoint,
        page,
        size,
        sort,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getPublicPosts(page = 0, size = 5, sort = 'createdAt,desc'): Promise<PostsResponse> {
    const endpoint = `${this.baseUrl}/feed`;
    debugLogger.logApiCall('GET', endpoint, { page, size, sort });
    try {
      const response = await apiClient.get<PostsResponse>(endpoint, {
        params: { page, size, sort }
      });
      debugLogger.logApiResponse('GET', endpoint, response);
      
      debugLogger.log('PostService', `🌍 Public Posts API Response`, {
        endpoint,
        page,
        size,
        sort,
        totalPosts: response.content?.length || 0,
        totalElements: response.page.totalElements,
        totalPages: response.page.totalPages,
        currentPage: response.page.number,
        hasNext: response.page.number < response.page.totalPages - 1,
        posts: response.content?.map(p => ({
          id: p.id,
          author: p.authorUsername,
          displayName: p.authorDisplayName,
          content: p.content?.substring(0, 50) + '...',
          reactions: p.reactions?.totalCount || 0,
          comments: p.commentCount || 0,
          shares: p.shareCount || 0,
          visibility: p.visibility,
          createdAt: p.createdAt
        }))
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('PostService', `❌ Public Posts API Error`, {
        endpoint,
        page,
        size,
        sort,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fallback to getAllPosts with public filter if public endpoint doesn't exist
      try {
        const fallbackResponse = await this.getAllPosts(page, size);
        // Filter only public posts
        const publicPosts = {
          ...fallbackResponse,
          content: fallbackResponse.content.filter(post => post.visibility === 'public_')
        };
        debugLogger.log('PostService', `🔄 Fallback to filtered public posts`, {
          originalCount: fallbackResponse.content.length,
          publicCount: publicPosts.content.length
        });
        return publicPosts;
      } catch (fallbackError) {
        debugLogger.log('PostService', `❌ Fallback also failed`, {
          error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
        });
        throw error; // Throw original error
      }
    }
  }

  // React to a post
  async reactToPost(postId: number, reactionData: PostReactionRequest): Promise<void> {
    const endpoint = `${this.baseUrl}/${postId}/reactions`;
    debugLogger.logApiCall('POST', endpoint, reactionData);
    try {
      const response = await apiClient.post(endpoint, reactionData);
      debugLogger.logApiResponse('POST', endpoint, response);
      
      debugLogger.log('PostService', `👍 React to Post API Success`, {
        endpoint,
        postId,
        reactionType: reactionData.type,
        response: response
      });
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      debugLogger.log('PostService', `❌ React to Post API Error`, {
        endpoint,
        postId,
        reactionType: reactionData.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Remove reaction from post
  async unreactPost(postId: number): Promise<void> {
    const endpoint = `${this.baseUrl}/${postId}/reactions`;
    debugLogger.logApiCall('DELETE', endpoint);
    try {
      const response = await apiClient.delete(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, response);
      
      debugLogger.log('PostService', `👎 Unreact Post API Success`, {
        endpoint,
        postId,
        response: response
      });
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      debugLogger.log('PostService', `❌ Unreact Post API Error`, {
        endpoint,
        postId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Share a post
  async sharePost(postId: number, shareData: SharePostRequest): Promise<number> {
    return await apiClient.post<number>(`${this.baseUrl}/${postId}/shares`, shareData);
  }

  async getPostReactions(postId: number, page = 0, size = 5): Promise<{
    content: Array<{
      id: number;
      type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
      userId: number;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
      createdAt: string;
    }>;
    totalElements: number;
  }> {
    const endpoint = `${this.baseUrl}/${postId}/reactions`;
    debugLogger.logApiCall('GET', endpoint, { postId, page, size });
    try {
      const response = await apiClient.get<{
        content: Array<{
          id: number;
          type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
          userId: number;
          username: string;
          displayName: string;
          avatarUrl?: string | null;
          createdAt: string;
        }>;
        totalElements: number;
      }>(endpoint, {
        params: { page, size }
      });
      debugLogger.logApiResponse('GET', endpoint, response);
      
      debugLogger.log('PostService', `👥 Get Post Reactions API Success`, {
        endpoint,
        postId,
        page,
        size,
        totalReactions: response.totalElements,
        reactionsCount: response.content?.length || 0,
        reactions: response.content?.map(r => ({
          id: r.id,
          type: r.type,
          userId: r.userId,
          username: r.username,
          displayName: r.displayName,
          createdAt: r.createdAt
        }))
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('PostService', `❌ Get Post Reactions API Error`, {
        endpoint,
        postId,
        page,
        size,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async toggleLike(postId: number): Promise<void> {
    try {
        const post = await this.getPost(postId);
        const currentUserReacted = post.reactions?.currentUserReacted;

        if (currentUserReacted) {
            await this.unreactPost(postId);
        } else {
            await this.reactToPost(postId, { type: 'like' });
        }
    } catch (error) {
        debugLogger.log('PostService', 'Error toggling like', { postId, error });
        throw error;
    }
}
}

export const postService = new PostService();

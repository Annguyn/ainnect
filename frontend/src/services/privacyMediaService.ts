// Privacy and Media Service Implementation

import { apiClient } from './apiClient';

// Types for Privacy and Media APIs
export interface MediaUploadResponse {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data: string | null; // File URL
}

export interface CreatePostRequest {
  content: string;
  visibility: 'public_' | 'friends' | 'private' | 'group' | undefined;
  mediaUrls?: string[];
  groupId?: number;
}

export interface UpdatePostRequest {
  content?: string;
  visibility?: 'public_' | 'friends' | 'private' | 'group' | undefined;
  mediaUrls?: string[];
}

export interface Post {
  id: number;
  content: string;
  visibility: string;
  mediaUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

class PrivacyMediaService {
  private baseUrl = '/api';

  // Media Upload
  async uploadMedia(file: File, category: string): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    return await apiClient.post<MediaUploadResponse>(`${this.baseUrl}/files/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // Create Post
  async createPost(postData: CreatePostRequest): Promise<Post> {
    return await apiClient.post<Post>(`${this.baseUrl}/posts`, postData);
  }

  // Create Post with Direct Media Upload
  async createPostWithMedia(formData: FormData): Promise<Post> {
    return await apiClient.post<Post>(`${this.baseUrl}/posts/with-media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // Update Post
  async updatePost(postId: number, updateData: UpdatePostRequest): Promise<Post> {
    return await apiClient.put<Post>(`${this.baseUrl}/posts/${postId}`, updateData);
  }

  // Update Post with Direct Media Upload
  async updatePostWithMedia(postId: number, formData: FormData): Promise<Post> {
    return await apiClient.put<Post>(`${this.baseUrl}/posts/${postId}/with-media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // Get Public Feed
  async getPublicFeed(page = 0, size = 10): Promise<Post[]> {
    return await apiClient.get<Post[]>(`${this.baseUrl}/posts/feed`, {
      params: { page, size },
    });
  }

  // Get Privacy-Aware Feed
  async getUserFeed(page = 0, size = 10): Promise<Post[]> {
    return await apiClient.get<Post[]>(`${this.baseUrl}/posts/feed/user`, {
      params: { page, size },
    });
  }
}

export const privacyMediaService = new PrivacyMediaService();
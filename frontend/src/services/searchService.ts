import { apiClient } from './apiClient';

export interface SearchResult {
  id: number;
  type: 'user' | 'group' | 'post';
  name?: string; // For users and groups
  content?: string; // For posts
  avatarUrl?: string; // For users and groups
  mediaUrls?: string[]; // For posts
  createdAt: string;
  authorId?: number; // For posts
  authorUsername?: string; // For posts
  authorDisplayName?: string; // For posts
  authorAvatarUrl?: string; // For posts
  visibility?: 'public_' | 'friends' | 'private'; // For posts
  commentCount?: number; // For posts
  reactionCount?: number; // For posts
  shareCount?: number; // For posts
  updatedAt?: string; // For posts
}

export interface SearchResponse {
  content?: SearchResult[];
  data?: {
    posts?: any[];
    users?: any[];
    groups?: any[];
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  currentPage?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  pageSize?: number;
  searchType?: string;
  keyword?: string;
}

class SearchService {
  private baseUrl = '/api/search';

  async searchAll(keyword: string, page = 0, size = 10): Promise<SearchResponse> {
    return await apiClient.get<SearchResponse>(`${this.baseUrl}`, {
      params: { keyword, page, size },
    });
  }

  async searchUsers(keyword: string, page = 0, size = 10): Promise<SearchResponse> {
    return await apiClient.get<SearchResponse>(`${this.baseUrl}/users`, {
      params: { keyword, page, size },
    });
  }

  async searchGroups(keyword: string, page = 0, size = 10): Promise<SearchResponse> {
    return await apiClient.get<SearchResponse>(`${this.baseUrl}/groups`, {
      params: { keyword, page, size },
    });
  }

  async searchPosts(keyword: string, page = 0, size = 10): Promise<SearchResponse> {
    return await apiClient.get<SearchResponse>(`${this.baseUrl}/posts`, {
      params: { keyword, page, size },
    });
  }
}

export const searchService = new SearchService();
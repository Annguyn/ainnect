import { apiClient } from './apiClient';
import { 
  AdminLoginRequest, 
  AdminLoginResponse, 
  AdminDashboardStats, 
  PaginatedUsersResponse, 
  UserDetail,
  PaginatedCommunitiesResponse,
  CommunityDetail,
  PaginatedLogsResponse,
  PaginatedPostsResponse,
  PostDetail
} from '../types/admin';

class AdminService {
  private adminToken: string | null = null;

  // Normalize flat Spring pagination to our { content, page } shape
  private normalizePageResponse<T = any>(raw: any): { content: T[]; page: { size: number; number: number; totalElements: number; totalPages: number } } {
    if (!raw) {
      return { content: [], page: { size: 0, number: 0, totalElements: 0, totalPages: 0 } };
    }

    // Some APIs may already return in the desired shape
    if (raw.page && typeof raw.page.totalElements === 'number' && Array.isArray(raw.content)) {
      return raw as { content: T[]; page: { size: number; number: number; totalElements: number; totalPages: number } };
    }

    const pageable = raw.pageable || {};
    const pageInfo = {
      size: raw.size ?? pageable.pageSize ?? 0,
      number: raw.number ?? pageable.pageNumber ?? 0,
      totalElements: raw.totalElements ?? raw.page?.totalElements ?? 0,
      totalPages: raw.totalPages ?? raw.page?.totalPages ?? 0,
    };

    const content = Array.isArray(raw.content) ? raw.content : [];

    return { content, page: pageInfo };
  }

  async login(data: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await apiClient.post<{ result: string; message: string; data: AdminLoginResponse }>(
      '/api/admin/login',
      data
    );
    
    if (response.data) {
      this.adminToken = response.data.accessToken;
      localStorage.setItem('adminToken', response.data.accessToken);
      localStorage.setItem('adminRefreshToken', response.data.refreshToken);
      localStorage.setItem('adminUser', JSON.stringify({
        userId: response.data.userId,
        username: response.data.username,
        displayName: response.data.displayName,
        role: response.data.role
      }));
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response.data;
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await apiClient.get<{ result: string; message: string; data: AdminDashboardStats }>(
      '/api/admin/dashboard'
    );
    return response.data;
  }

  async getAllUsers(page: number = 0, size: number = 20): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: any }>(
      `/api/admin/users?page=${page}&size=${size}`
    );
    return this.normalizePageResponse(response.data);
  }

  async getActiveUsers(page: number = 0, size: number = 20): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: any }>(
      `/api/admin/users/active?page=${page}&size=${size}`
    );
    return this.normalizePageResponse(response.data);
  }

  async getInactiveUsers(page: number = 0, size: number = 20): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: any }>(
      `/api/admin/users/inactive?page=${page}&size=${size}`
    );
    return this.normalizePageResponse(response.data);
  }

  async searchUsers(keyword: string, page: number = 0, size: number = 20): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: any }>(
      `/api/admin/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
    return this.normalizePageResponse(response.data);
  }

  async getUserById(userId: number): Promise<UserDetail> {
    const response = await apiClient.get<{ result: string; message: string; data: UserDetail }>(
      `/api/admin/users/${userId}`
    );
    return response.data;
  }

  async lockUser(userId: number): Promise<void> {
    await apiClient.post<{ result: string; message: string; data: null }>(
      `/api/admin/users/${userId}/lock`
    );
  }

  async unlockUser(userId: number): Promise<void> {
    await apiClient.post<{ result: string; message: string; data: null }>(
      `/api/admin/users/${userId}/unlock`
    );
  }

  async deleteUser(userId: number): Promise<void> {
    await apiClient.delete<{ result: string; message: string; data: null }>(
      `/api/admin/users/${userId}`
    );
  }

  async getAllCommunities(page: number = 0, size: number = 20): Promise<PaginatedCommunitiesResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: any }>(
      `/api/admin/communities?page=${page}&size=${size}`
    );
    return this.normalizePageResponse(response.data);
  }

  async searchCommunities(keyword: string, page: number = 0, size: number = 20): Promise<PaginatedCommunitiesResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: any }>(
      `/api/admin/communities/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
    return this.normalizePageResponse(response.data);
  }

  async getCommunityById(communityId: number): Promise<CommunityDetail> {
    const response = await apiClient.get<{ result: string; message: string; data: CommunityDetail }>(
      `/api/admin/communities/${communityId}`
    );
    return response.data;
  }

  async deleteCommunity(communityId: number, reason: string): Promise<void> {
    await apiClient.delete<{ result: string; message: string; data: null }>(
      `/api/admin/communities/${communityId}?reason=${encodeURIComponent(reason)}`
    );
  }

  async getAllLogs(page: number = 0, size: number = 50): Promise<PaginatedLogsResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: any }>(
      `/api/admin/logs?page=${page}&size=${size}`
    );
    return this.normalizePageResponse(response.data);
  }

  async getUserLogs(userId: number, page: number = 0, size: number = 50): Promise<PaginatedLogsResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: any }>(
      `/api/admin/logs/user/${userId}?page=${page}&size=${size}`
    );
    return this.normalizePageResponse(response.data);
  }

  async getLogsByAction(action: string, page: number = 0, size: number = 50): Promise<PaginatedLogsResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: any }>(
      `/api/admin/logs/action/${action}?page=${page}&size=${size}`
    );
    return this.normalizePageResponse(response.data);
  }

  async getAllPosts(page: number = 0, size: number = 20): Promise<PaginatedPostsResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: any }>(
      `/api/admin/posts?page=${page}&size=${size}`
    );
    return this.normalizePageResponse(response.data);
  }

  async getUserPosts(userId: number, page: number = 0, size: number = 20): Promise<PaginatedPostsResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: any }>(
      `/api/admin/posts/user/${userId}?page=${page}&size=${size}`
    );
    return this.normalizePageResponse(response.data);
  }

  async getPostById(postId: number): Promise<PostDetail> {
    const response = await apiClient.get<{ result: string; message: string; data: PostDetail }>(
      `/api/admin/posts/${postId}`
    );
    return response.data;
  }

  async deletePost(postId: number, reason: string): Promise<void> {
    await apiClient.delete<{ result: string; message: string; data: null }>(
      `/api/admin/posts/${postId}?reason=${encodeURIComponent(reason)}`
    );
  }

  logout(): void {
    this.adminToken = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    apiClient.clearTokens();
  }

  getAdminToken(): string | null {
    return this.adminToken || localStorage.getItem('adminToken');
  }

  getAdminUser(): any {
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAdminAuthenticated(): boolean {
    return !!this.getAdminToken();
  }
}

export const adminService = new AdminService();


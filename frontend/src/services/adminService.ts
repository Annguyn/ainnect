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
    const response = await apiClient.get<{ result: string; message: string; data: PaginatedUsersResponse }>(
      `/api/admin/users?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getActiveUsers(page: number = 0, size: number = 20): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: PaginatedUsersResponse }>(
      `/api/admin/users/active?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getInactiveUsers(page: number = 0, size: number = 20): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: PaginatedUsersResponse }>(
      `/api/admin/users/inactive?page=${page}&size=${size}`
    );
    return response.data;
  }

  async searchUsers(keyword: string, page: number = 0, size: number = 20): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: PaginatedUsersResponse }>(
      `/api/admin/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
    return response.data;
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
    const response = await apiClient.get<{ result: string; message: string; data: PaginatedCommunitiesResponse }>(
      `/api/admin/communities?page=${page}&size=${size}`
    );
    return response.data;
  }

  async searchCommunities(keyword: string, page: number = 0, size: number = 20): Promise<PaginatedCommunitiesResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: PaginatedCommunitiesResponse }>(
      `/api/admin/communities/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
    return response.data;
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
    const response = await apiClient.get<{ result: string; message: string; data: PaginatedLogsResponse }>(
      `/api/admin/logs?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getUserLogs(userId: number, page: number = 0, size: number = 50): Promise<PaginatedLogsResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: PaginatedLogsResponse }>(
      `/api/admin/logs/user/${userId}?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getLogsByAction(action: string, page: number = 0, size: number = 50): Promise<PaginatedLogsResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: PaginatedLogsResponse }>(
      `/api/admin/logs/action/${action}?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getAllPosts(page: number = 0, size: number = 20): Promise<PaginatedPostsResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: PaginatedPostsResponse }>(
      `/api/admin/posts?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getUserPosts(userId: number, page: number = 0, size: number = 20): Promise<PaginatedPostsResponse> {
    const response = await apiClient.get<{ result: string; message: string; data: PaginatedPostsResponse }>(
      `/api/admin/posts/user/${userId}?page=${page}&size=${size}`
    );
    return response.data;
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


import { apiClient } from './apiClient';
import type { BlockedUsersResponse } from '../types/social';
import type { User } from '../types';

// Types for Social Graph APIs
export interface FollowRequest {
  followeeId: number;
}

export interface FriendRequest {
  friendId: number;
}

export interface AcceptFriendRequest {
  otherUserId: number;
}

export interface RejectFriendRequest {
  otherUserId: number;
}

export interface BlockRequest {
  blockedUserId: number;
  reason: string;
}

export interface ShareRequest {
  postId: number;
  comment?: string;
}

export interface ReportRequest {
  targetId: number;
  reason: 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'INAPPROPRIATE_CONTENT' | 'OTHER';
  description: string;
}

export interface UpdateReportStatusRequest {
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  adminNote?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Friendship {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  requester: User;
  addressee: User;
}

export interface Block {
  id: number;
  blockerId: number;
  blockedUserId: number;
  reason: string;
  createdAt: string;
  blockedUser: User;
}

export interface Share {
  id: number;
  postId: number;
  userId: number;
  comment?: string;
  createdAt: string;
  user: User;
  post: any;
}

export interface Report {
  id: number;
  reporterId: number;
  targetType: 'USER' | 'POST' | 'COMMENT';
  targetId: number;
  reason: string;
  description: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  reporter: User;
}

export interface UserSocialStats {
  userId: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  sharesCount: number;
  canSendFriendRequest: boolean;
  following: boolean;
  friend: boolean;
  blocked: boolean;
}

// User interface is now imported from types/index.ts


export interface Share {
  id: number;
  postId: number;
  userId: number;
  user: User;
  comment?: string;
  createdAt: string;
}

export interface Report {
  id: number;
  reporterId: number;
  reporter: User;
  targetType: 'USER' | 'POST' | 'COMMENT';
  targetId: number;
  reason: string;
  description: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Social Service Class
export class SocialService {
  // Follow/Unfollow APIs
  async followUser(request: FollowRequest): Promise<void> {
    await apiClient.post<void>('/api/social/follow', request);
  }

  async unfollowUser(userId: number): Promise<void> {
    await apiClient.delete<void>(`/api/social/follow/${userId}`);
  }

  async getFollowers(userId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>(`/api/social/followers/${userId}?page=${page}&size=${size}`);
    return response;
  }

  async getFollowing(userId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>(`/api/social/following/${userId}?page=${page}&size=${size}`);
    return response;
  }

  async checkFollowingStatus(userId: number): Promise<boolean> {
    const response = await apiClient.get<boolean>(`/api/social/is-following/${userId}`);
    return response;
  }

  // Friendship APIs
  async sendFriendRequest(request: FriendRequest): Promise<void> {
    await apiClient.post<void>('/api/social/friend-request', request);
  }

  async acceptFriendRequest(request: AcceptFriendRequest): Promise<void> {
    await apiClient.post<void>('/api/social/friend-request/accept', request);
  }

  async acceptFriendRequestByUser(userId: number): Promise<void> {
    await apiClient.post<void>('/api/social/friend-request/accept', { otherUserId: userId } as any);
  }

  async rejectFriendRequest(request: AcceptFriendRequest): Promise<void> {
    await apiClient.post<void>('/api/social/friend-request/reject', request);
  }

  async rejectFriendRequestByUser(userId: number): Promise<void> {
    await apiClient.post<void>('/api/social/friend-request/reject', { otherUserId: userId } as any);
  }

  async removeFriend(friendId: number): Promise<void> {
    await apiClient.delete<void>(`/api/social/friend/${friendId}`);
  }

  async getFriends(userId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<any>(`/api/social/friends/${userId}?page=${page}&size=${size}`);
    const payload = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
    const friendships = payload?.friendships || payload?.content || [];
    const normalized = (friendships as any[]).map((f) => ({
      id: f.id ?? f.userId,
      username: f.username,
      displayName: f.displayName,
      avatarUrl: f.avatarUrl,
      email: f.email || '',
      isActive: true,
      isVerified: f.isVerified || false,
      isPrivate: f.isPrivate || false,
      bio: f.bio || null,
      firstName: f.firstName,
      lastName: f.lastName,
      avatar: f.avatarUrl
    })) as User[];
    return {
      content: normalized,
      currentPage: payload?.currentPage ?? payload?.page ?? page,
      pageSize: payload?.pageSize ?? payload?.size ?? size,
      totalElements: payload?.totalElements ?? normalized.length,
      totalPages: payload?.totalPages ?? 1,
      hasNext: payload?.hasNext ?? false,
      hasPrevious: payload?.hasPrevious ?? false,
    } as PaginatedResponse<User>;
  }

  async getCommonFriends(otherUserId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<any>(`/api/social/common-friends/${otherUserId}?page=${page}&size=${size}`);
    // Unwrap ApiResponse and normalize to PaginatedResponse<User>
    const payload = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
    const commonFriends = payload?.commonFriends || payload?.content || [];
    const normalized = (commonFriends as any[]).map((u) => ({
      id: u.id ?? u.userId,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
    })) as User[];
    return {
      content: normalized,
      currentPage: payload?.currentPage ?? payload?.page ?? page,
      pageSize: payload?.pageSize ?? payload?.size ?? size,
      totalElements: payload?.totalElements ?? normalized.length,
      totalPages: payload?.totalPages ?? 1,
      hasNext: payload?.hasNext ?? false,
      hasPrevious: payload?.hasPrevious ?? false,
    } as PaginatedResponse<User>;
  }

  async getCommonFriendsCount(otherUserId: number): Promise<number> {
    const response = await apiClient.get<any>(`/api/social/common-friends/${otherUserId}/count`);
    if (response && typeof response === 'object' && 'data' in response) {
      return Number((response as any).data) || 0;
    }
    return Number(response) || 0;
  }

  async getFriendRequests(page: number = 0, size: number = 10): Promise<PaginatedResponse<Friendship>> {
    const response = await apiClient.get<PaginatedResponse<Friendship>>(`/api/social/friend-requests?page=${page}&size=${size}`);
    return response;
  }

  async getSentFriendRequests(page: number = 0, size: number = 10): Promise<PaginatedResponse<Friendship>> {
    const response = await apiClient.get<PaginatedResponse<Friendship>>(`/api/social/sent-friend-requests?page=${page}&size=${size}`);
    return response;
  }

  async checkFriendStatus(friendId: number): Promise<boolean> {
    const response = await apiClient.get<any>(`/api/social/is-friend/${friendId}`);
    if (response && typeof response === 'object' && 'data' in response) {
      return Boolean((response as { data: any }).data);
    }
    return Boolean(response);
  }

  // Block/Unblock APIs
  async blockUser(request: BlockRequest): Promise<void> {
    await apiClient.post<void>('/api/social/block', request);
  }

  async unblockUser(blockedUserId: number): Promise<void> {
    await apiClient.delete<void>(`/api/social/block/${blockedUserId}`);
  }

  async getBlockedUsers(page: number = 0, size: number = 10): Promise<BlockedUsersResponse> {
    const response = await apiClient.get<ApiResponse<BlockedUsersResponse>>(`/api/social/blocked-users?page=${page}&size=${size}`);
    return response.data!;
  }

  async checkBlockStatus(blockedId: number): Promise<boolean> {
    const response = await apiClient.get<boolean>(`/api/social/is-blocked/${blockedId}`);
    return response;
  }

  // Share APIs
  async sharePost(request: ShareRequest): Promise<ApiResponse<Share>> {
    const response = await apiClient.post<ApiResponse<Share>>('/api/social/share', request);
    return response;
  }

  async deleteShare(shareId: number): Promise<void> {
    await apiClient.delete<void>(`/api/social/share/${shareId}`);
  }

  async getPostShares(postId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<Share>> {
    const response = await apiClient.get<PaginatedResponse<Share>>(`/api/social/shares/post/${postId}?page=${page}&size=${size}`);
    return response;
  }

  async getUserShares(userId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<Share>> {
    const response = await apiClient.get<PaginatedResponse<Share>>(`/api/social/shares/user/${userId}?page=${page}&size=${size}`);
    return response;
  }

  // Report APIs
  async reportUser(request: ReportRequest): Promise<ApiResponse<Report>> {
    const response = await apiClient.post<ApiResponse<Report>>('/api/social/report/user', request);
    return response;
  }

  async reportPost(request: ReportRequest): Promise<ApiResponse<Report>> {
    const response = await apiClient.post<ApiResponse<Report>>('/api/social/report/post', request);
    return response;
  }

  async reportComment(request: ReportRequest): Promise<ApiResponse<Report>> {
    const response = await apiClient.post<ApiResponse<Report>>('/api/social/report/comment', request);
    return response;
  }

  async getMyReports(page: number = 0, size: number = 10): Promise<PaginatedResponse<Report>> {
    const response = await apiClient.get<PaginatedResponse<Report>>(`/api/social/reports/my?page=${page}&size=${size}`);
    return response;
  }

  async getAllReports(page: number = 0, size: number = 10): Promise<PaginatedResponse<Report>> {
    const response = await apiClient.get<PaginatedResponse<Report>>(`/api/social/reports?page=${page}&size=${size}`);
    return response;
  }

  async getReportById(reportId: number): Promise<Report> {
    const response = await apiClient.get<Report>(`/api/social/reports/${reportId}`);
    return response;
  }

  async updateReportStatus(reportId: number, request: UpdateReportStatusRequest): Promise<ApiResponse<Report>> {
    const response = await apiClient.put<ApiResponse<Report>>(`/api/social/reports/${reportId}/status`, request);
    return response;
  }

  // Social Stats API
  async getSocialStats(userId: number): Promise<UserSocialStats> {
    const response = await apiClient.get<any>(`/api/social/stats/${userId}`);
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: UserSocialStats }).data;
    }
    return response as UserSocialStats;
  }

  // Fetch users
  async fetchUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/api/social/users');
    return response;
  }

  // Fetch activities
  async fetchActivities(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/api/social/activities');
    return response;
  }
}

// Export singleton instance
export const socialService = new SocialService();
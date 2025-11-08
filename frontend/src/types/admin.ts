export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  displayName: string;
  role: 'ADMIN';
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPosts: number;
  totalGroups: number;
  totalReports: number;
  pendingReports: number;
  todayNewUsers: number;
  todayNewPosts: number;
  userGrowthLast7Days: Record<string, number>;
  postGrowthLast7Days: Record<string, number>;
  topActiveUsers: Record<string, number>;
}

export interface AdminUser {
  userId: number;
  username: string;
  displayName: string;
  role: 'ADMIN';
}

export interface UserDetail {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  gender: string | null;
  birthday: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roles: string[];
  totalPosts: number;
  totalFriends: number;
  totalGroups: number;
}

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginatedUsersResponse {
  content: UserDetail[];
  page: PageInfo;
}

export interface CommunityDetail {
  id: number;
  name: string;
  description: string;
  privacy: string;
  coverUrl: string | null;
  creatorId: number;
  creatorName: string;
  totalMembers: number;
  totalPosts: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaginatedCommunitiesResponse {
  content: CommunityDetail[];
  page: PageInfo;
}

export interface AdminLog {
  id: number;
  userId: number;
  username: string;
  action: string;
  entityType: string;
  entityId: number;
  description: string;
  ipAddress: string | null;
  createdAt: string;
}

export interface PaginatedLogsResponse {
  content: AdminLog[];
  page: PageInfo;
}

export interface MediaItem {
  id: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
}

export interface PostDetail {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  content: string;
  visibility: string;
  mediaUrls?: string[];
  media?: MediaItem[];
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalReports: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaginatedPostsResponse {
  content: PostDetail[];
  page: PageInfo;
}


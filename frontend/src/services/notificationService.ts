import { apiClient } from './apiClient';

// Types
export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  REPLY = 'REPLY',
  FOLLOW = 'FOLLOW',
  UNFOLLOW = 'UNFOLLOW',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FRIEND_ACCEPT = 'FRIEND_ACCEPT',
  MENTION = 'MENTION',
  SHARE = 'SHARE',
  MESSAGE = 'MESSAGE',
  GROUP_INVITE = 'GROUP_INVITE',
  GROUP_JOIN = 'GROUP_JOIN',
  SYSTEM = 'SYSTEM'
}

export interface UserBasicInfo {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  profilePictureUrl?: string; 
}

export interface NotificationResponse {
  id: number;
  recipient: UserBasicInfo;
  actor: UserBasicInfo;
  type: NotificationType;
  targetType: string;
  targetId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationStatsDto {
  unreadCount: number;
  totalCount: number;
}

export interface PaginatedNotifications {
  content: NotificationResponse[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Notification Service
export class NotificationService {
  async getUserNotifications(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<PaginatedNotifications> {
    const response = await apiClient.get<any>(
      `/api/notifications?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
    
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as any).data as PaginatedNotifications;
    }
    return response as PaginatedNotifications;
  }

  async getNotificationStats(): Promise<NotificationStatsDto> {
    const response = await apiClient.get<any>('/api/notifications/stats');
    
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as any).data as NotificationStatsDto;
    }
    return response as NotificationStatsDto;
  }

  async markAsRead(notificationId: number): Promise<NotificationResponse> {
    const response = await apiClient.put<any>(`/api/notifications/${notificationId}/read`);
    
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as any).data as NotificationResponse;
    }
    return response as NotificationResponse;
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.put<void>('/api/notifications/read-all');
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await apiClient.delete<void>(`/api/notifications/${notificationId}`);
  }

  async deleteOldNotifications(): Promise<void> {
    await apiClient.delete<void>('/api/notifications/cleanup');
  }
}

export const notificationService = new NotificationService();

package com.ainnect.service;

import com.ainnect.dto.notification.NotificationCreateRequest;
import com.ainnect.dto.notification.NotificationResponse;
import com.ainnect.dto.notification.NotificationStatsDto;
import com.ainnect.dto.notification.NotificationSummaryDto;
import com.ainnect.common.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    
    NotificationResponse createNotification(NotificationCreateRequest request);
    
    Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable);
    
    NotificationStatsDto getNotificationStats(Long userId);
    
    NotificationResponse markAsRead(Long notificationId, Long userId);
    
    void markAllAsRead(Long userId);
    
    void deleteNotification(Long notificationId, Long userId);
    
    void deleteOldNotifications(Long userId);
    
    // Specific notification creation methods for different events
    void createLikeNotification(Long postId, Long actorId, Long recipientId, NotificationType notificationType);
    
    void createCommentNotification(Long postId, Long actorId, Long recipientId);
    
    void createReplyNotification(Long commentId, Long actorId, Long recipientId);
    
    void createFollowNotification(Long actorId, Long recipientId);
    
    void createFriendRequestNotification(Long actorId, Long recipientId);
    
    void createFriendAcceptNotification(Long actorId, Long recipientId);
    
    void createMentionNotification(Long targetId, String targetType, Long actorId, Long recipientId);
    
    void createShareNotification(Long postId, Long actorId, Long recipientId);
    
    void createGroupInviteNotification(Long groupId, Long actorId, Long recipientId);
    
    void createGroupJoinNotification(Long groupId, Long actorId, Long recipientId);
    
    void createSystemNotification(Long recipientId, String message);
}

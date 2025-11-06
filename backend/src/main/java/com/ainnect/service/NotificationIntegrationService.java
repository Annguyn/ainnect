package com.ainnect.service;

import org.springframework.stereotype.Service;

import com.ainnect.common.enums.NotificationType;

@Service
public class NotificationIntegrationService {
    
    private final NotificationService notificationService;
    
    public NotificationIntegrationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    // Post-related notifications
    public void handlePostLike(Long postId, Long actorId, Long postOwnerId, NotificationType notificationType) {
        notificationService.createLikeNotification(postId, actorId, postOwnerId, notificationType);
    }
    
    public void handlePostComment(Long postId, Long actorId, Long postOwnerId) {
        notificationService.createCommentNotification(postId, actorId, postOwnerId);
    }
    
    public void handlePostShare(Long postId, Long actorId, Long postOwnerId) {
        notificationService.createShareNotification(postId, actorId, postOwnerId);
    }
    
    // Comment-related notifications
    public void handleCommentReply(Long commentId, Long actorId, Long commentOwnerId) {
        notificationService.createReplyNotification(commentId, actorId, commentOwnerId);
    }
    
    // Social-related notifications
    public void handleFollow(Long actorId, Long recipientId) {
        notificationService.createFollowNotification(actorId, recipientId);
    }
    
    public void handleFriendRequest(Long actorId, Long recipientId) {
        notificationService.createFriendRequestNotification(actorId, recipientId);
    }
    
    public void handleFriendAccept(Long actorId, Long recipientId) {
        notificationService.createFriendAcceptNotification(actorId, recipientId);
    }
    
    // Group-related notifications
    public void handleGroupInvite(Long groupId, Long actorId, Long recipientId) {
        notificationService.createGroupInviteNotification(groupId, actorId, recipientId);
    }
    
    public void handleGroupJoin(Long groupId, Long actorId, Long groupOwnerId) {
        notificationService.createGroupJoinNotification(groupId, actorId, groupOwnerId);
    }
    
    // Mention notifications
    public void handleMention(Long targetId, String targetType, Long actorId, Long recipientId) {
        notificationService.createMentionNotification(targetId, targetType, actorId, recipientId);
    }
    
    // System notifications
    public void handleSystemNotification(Long recipientId, String message) {
        notificationService.createSystemNotification(recipientId, message);
    }
}

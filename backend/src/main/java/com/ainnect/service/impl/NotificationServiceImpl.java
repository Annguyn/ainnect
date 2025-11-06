package com.ainnect.service.impl;

import com.ainnect.common.enums.NotificationType;
import com.ainnect.dto.notification.NotificationCreateRequest;
import com.ainnect.dto.notification.NotificationResponse;
import com.ainnect.dto.notification.NotificationStatsDto;
import com.ainnect.dto.notification.NotificationSummaryDto;
import com.ainnect.dto.user.UserBasicInfoDto;
import com.ainnect.entity.Notification;
import com.ainnect.entity.User;
import com.ainnect.mapper.UserMapper;
import com.ainnect.repository.NotificationRepository;
import com.ainnect.repository.UserRepository;
import com.ainnect.service.NotificationService;
import com.ainnect.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final WebSocketService webSocketService;
    
    @Override
    public NotificationResponse createNotification(NotificationCreateRequest request) {
        User recipient = userRepository.findById(request.recipientId())
            .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));
        
        User actor = null;
        if (request.actorId() != null) {
            actor = userRepository.findById(request.actorId())
                .orElseThrow(() -> new IllegalArgumentException("Actor not found"));
        }
        
        // Check for duplicate notifications
        if (actor != null && request.targetType() != null && request.targetId() != null) {
            Optional<Notification> existing = notificationRepository.findDuplicateNotification(
                recipient, actor, request.type(), request.targetType(), request.targetId()
            );
            if (existing.isPresent()) {
                log.info("Duplicate notification found, skipping creation");
                return convertToResponse(existing.get());
            }
        }
        
        Notification notification = Notification.builder()
            .recipient(recipient)
            .actor(actor)
            .type(request.type())
            .targetType(request.targetType())
            .targetId(request.targetId())
            .message(request.message())
            .isRead(false)
            .createdAt(LocalDateTime.now())
            .build();
        
        Notification saved = notificationRepository.save(notification);
        log.info("Created notification: {} for user: {}", saved.getId(), recipient.getId());
        
        NotificationResponse response = convertToResponse(saved);
        try {
            String recipientUsername = response.recipient().username();
            webSocketService.sendNotificationToUser(recipientUsername, response);
            Long unreadCount = notificationRepository.countUnreadByRecipient(recipient);
            webSocketService.sendNotificationUnreadCount(recipientUsername, unreadCount);
        } catch (Exception ex) {
            log.warn("Failed to push WS notification for user {}: {}", recipient.getId(), ex.getMessage());
        }
        return response;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Page<Notification> notifications = notificationRepository
            .findByRecipientOrderByCreatedAtDesc(user, pageable);
        
        return notifications.map(this::convertToResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public NotificationStatsDto getNotificationStats(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Long totalCount = notificationRepository.countByRecipient(user);
        Long unreadCount = notificationRepository.countUnreadByRecipient(user);
        Long todayCount = notificationRepository.countTodayByRecipient(user);
        
        return new NotificationStatsDto(totalCount, unreadCount, todayCount);
    }
    
    @Override
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        int updated = notificationRepository.markAsReadByIdAndRecipient(
            notificationId, user, LocalDateTime.now()
        );
        
        if (updated == 0) {
            throw new IllegalArgumentException("Notification not found or already read");
        }
        
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        NotificationResponse response = convertToResponse(notification);
        try {
            String username = response.recipient().username();
            Long unreadCount = notificationRepository.countUnreadByRecipient(user);
            webSocketService.sendNotificationUnreadCount(username, unreadCount);
        } catch (Exception ex) {
            log.warn("Failed to push unread count after markAsRead for user {}: {}", userId, ex.getMessage());
        }
        return response;
    }
    
    @Override
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        int updated = notificationRepository.markAllAsReadByRecipient(user, LocalDateTime.now());
        log.info("Marked {} notifications as read for user: {}", updated, userId);

        try {
            // Need username to send to specific user; fetch again to ensure username exists
            String username = user.getUsername();
            Long unreadCount = notificationRepository.countUnreadByRecipient(user);
            webSocketService.sendNotificationUnreadCount(username, unreadCount);
        } catch (Exception ex) {
            log.warn("Failed to push unread count after markAllAsRead for user {}: {}", userId, ex.getMessage());
        }
    }
    
    @Override
    public void deleteNotification(Long notificationId, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        if (!notification.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to delete this notification");
        }
        
        notificationRepository.delete(notification);
        log.info("Deleted notification: {} for user: {}", notificationId, userId);

        try {
            String username = user.getUsername();
            Long unreadCount = notificationRepository.countUnreadByRecipient(user);
            webSocketService.sendNotificationUnreadCount(username, unreadCount);
        } catch (Exception ex) {
            log.warn("Failed to push unread count after delete for user {}: {}", userId, ex.getMessage());
        }
    }
    
    @Override
    public void deleteOldNotifications(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        int deleted = notificationRepository.deleteOldNotifications(user, cutoffDate);
        log.info("Deleted {} old notifications for user: {}", deleted, userId);
    }
    
    // Specific notification creation methods
    @Override
    public void createLikeNotification(Long postId, Long actorId, Long recipientId, NotificationType notificationType) {
        if (actorId.equals(recipientId)) return; // Don't notify self

        String message = "liked your post";
        NotificationCreateRequest request = new NotificationCreateRequest(
            recipientId, actorId, notificationType, "POST", postId, message
        );
        createNotification(request);
    }
    
    @Override
    public void createCommentNotification(Long postId, Long actorId, Long recipientId) {
        if (actorId.equals(recipientId)) return; // Don't notify self
        
        String message = "commented on your post";
        NotificationCreateRequest request = new NotificationCreateRequest(
            recipientId, actorId, NotificationType.COMMENT, "POST", postId, message
        );
        createNotification(request);
    }
    
    @Override
    public void createReplyNotification(Long commentId, Long actorId, Long recipientId) {
        if (actorId.equals(recipientId)) return; // Don't notify self
        
        String message = "replied to your comment";
        NotificationCreateRequest request = new NotificationCreateRequest(
            recipientId, actorId, NotificationType.REPLY, "COMMENT", commentId, message
        );
        createNotification(request);
    }
    
    @Override
    public void createFollowNotification(Long actorId, Long recipientId) {
        if (actorId.equals(recipientId)) return; // Don't notify self
        
        String message = "started following you";
        NotificationCreateRequest request = new NotificationCreateRequest(
            recipientId, actorId, NotificationType.FOLLOW, null, null, message
        );
        createNotification(request);
    }
    
    @Override
    public void createFriendRequestNotification(Long actorId, Long recipientId) {
        if (actorId.equals(recipientId)) return; // Don't notify self
        
        String message = "sent you a friend request";
        NotificationCreateRequest request = new NotificationCreateRequest(
            recipientId, actorId, NotificationType.FRIEND_REQUEST, null, null, message
        );
        createNotification(request);
    }
    
    @Override
    public void createFriendAcceptNotification(Long actorId, Long recipientId) {
        if (actorId.equals(recipientId)) return; // Don't notify self
        
        String message = "accepted your friend request";
        NotificationCreateRequest request = new NotificationCreateRequest(
            recipientId, actorId, NotificationType.FRIEND_ACCEPT, null, null, message
        );
        createNotification(request);
    }
    
    @Override
    public void createMentionNotification(Long targetId, String targetType, Long actorId, Long recipientId) {
        if (actorId.equals(recipientId)) return; // Don't notify self
        
        String message = "mentioned you in a " + targetType.toLowerCase();
        NotificationCreateRequest request = new NotificationCreateRequest(
            recipientId, actorId, NotificationType.MENTION, targetType, targetId, message
        );
        createNotification(request);
    }
    
    @Override
    public void createShareNotification(Long postId, Long actorId, Long recipientId) {
        if (actorId.equals(recipientId)) return; // Don't notify self
        
        String message = "shared your post";
        NotificationCreateRequest request = new NotificationCreateRequest(
            recipientId, actorId, NotificationType.SHARE, "POST", postId, message
        );
        createNotification(request);
    }
    
    @Override
    public void createGroupInviteNotification(Long groupId, Long actorId, Long recipientId) {
        if (actorId.equals(recipientId)) return; // Don't notify self
        
        String message = "invited you to join a group";
        NotificationCreateRequest request = new NotificationCreateRequest(
            recipientId, actorId, NotificationType.GROUP_INVITE, "GROUP", groupId, message
        );
        createNotification(request);
    }
    
    @Override
    public void createGroupJoinNotification(Long groupId, Long actorId, Long recipientId) {
        if (actorId.equals(recipientId)) return; // Don't notify self
        
        String message = "joined your group";
        NotificationCreateRequest request = new NotificationCreateRequest(
            recipientId, actorId, NotificationType.GROUP_JOIN, "GROUP", groupId, message
        );
        createNotification(request);
    }
    
    @Override
    public void createSystemNotification(Long recipientId, String message) {
        NotificationCreateRequest request = new NotificationCreateRequest(
            recipientId, null, NotificationType.SYSTEM, null, null, message
        );
        createNotification(request);
    }
    
    private NotificationResponse convertToResponse(Notification notification) {
        UserBasicInfoDto recipient = userMapper.toBasicInfoDto(notification.getRecipient());
        UserBasicInfoDto actor = notification.getActor() != null ? 
            userMapper.toBasicInfoDto(notification.getActor()) : null;
        
        return new NotificationResponse(
            notification.getId(),
            recipient,
            actor,
            notification.getType(),
            notification.getTargetType(),
            notification.getTargetId(),
            notification.getMessage(),
            notification.getIsRead(),
            notification.getCreatedAt(),
            notification.getReadAt()
        );
    }
}

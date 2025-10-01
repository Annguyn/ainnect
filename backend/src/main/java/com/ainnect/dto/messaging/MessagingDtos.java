package com.ainnect.dto.messaging;

import com.ainnect.common.enums.ConversationMemberRole;
import com.ainnect.common.enums.ConversationType;
import com.ainnect.common.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class MessagingDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateConversationRequest {
        private ConversationType type;
        private String title;
        private List<Long> participantIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendMessageRequest {
        private Long conversationId;
        private String content;
        private MessageType messageType;
        private List<String> attachmentUrls;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddMemberRequest {
        private Long conversationId;
        private List<Long> userIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RemoveMemberRequest {
        private Long conversationId;
        private Long userId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateMemberRoleRequest {
        private Long conversationId;
        private Long userId;
        private ConversationMemberRole role;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkAsReadRequest {
        private Long conversationId;
        private Long messageId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationResponse {
        private Long id;
        private ConversationType type;
        private String title;
        private Long createdById;
        private String createdByUsername;
        private String createdByDisplayName;
        private String createdByAvatarUrl;
        private int memberCount;
        private int unreadCount;
        private MessageResponse lastMessage;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private boolean isMember;
        private ConversationMemberRole userRole;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageResponse {
        private Long id;
        private Long conversationId;
        private Long senderId;
        private String senderUsername;
        private String senderDisplayName;
        private String senderAvatarUrl;
        private String content;
        private MessageType messageType;
        private List<MessageAttachmentResponse> attachments;
        private LocalDateTime createdAt;
        private LocalDateTime deletedAt;
        private boolean isRead;
        private boolean isEdited;
        private LocalDateTime editedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageAttachmentResponse {
        private Long id;
        private String fileName;
        private String fileUrl;
        private String fileType;
        private Long fileSize;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationMemberResponse {
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
        private ConversationMemberRole role;
        private LocalDateTime joinedAt;
        private Long lastReadMessageId;
        private boolean isOnline;
        private LocalDateTime lastSeenAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationListResponse {
        private List<ConversationResponse> conversations;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageListResponse {
        private List<MessageResponse> messages;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationMemberListResponse {
        private List<ConversationMemberResponse> members;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WebSocketMessage {
        private String type;
        private Object data;
        private Long conversationId;
        private Long senderId;
        private LocalDateTime timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationResponse {
        private Long id;
        private String type;
        private String title;
        private String content;
        private Long senderId;
        private String senderUsername;
        private String senderAvatarUrl;
        private Long targetId;
        private String targetType;
        private boolean isRead;
        private LocalDateTime createdAt;
        private LocalDateTime readAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationListResponse {
        private List<NotificationResponse> notifications;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
        private int unreadCount;
    }
}

package com.ainnect.service;

import com.ainnect.common.enums.ConversationMemberRole;
import com.ainnect.dto.messaging.MessagingDtos;
import org.springframework.data.domain.Pageable;

public interface MessageService {

    // Conversation management
    MessagingDtos.ConversationResponse createConversation(MessagingDtos.CreateConversationRequest request, Long creatorId);
    MessagingDtos.ConversationResponse getConversationById(Long conversationId, Long userId);
    MessagingDtos.ConversationListResponse getUserConversations(Long userId, Pageable pageable);
    MessagingDtos.ConversationListResponse getDirectConversations(Long userId, Pageable pageable);
    MessagingDtos.ConversationListResponse getGroupConversations(Long userId, Pageable pageable);
    void deleteConversation(Long conversationId, Long userId);

    // Message operations
    MessagingDtos.MessageResponse sendMessage(MessagingDtos.SendMessageRequest request, Long senderId);
    MessagingDtos.MessageListResponse getConversationMessages(Long conversationId, Long userId, Pageable pageable);
    MessagingDtos.MessageResponse getMessageById(Long messageId, Long userId);

    void reactToMessage(Long messageId, String type, Long userId);

    void removeReactionFromMessage(Long messageId, Long userId);
    MessagingDtos.MessageResponse editMessage(Long messageId, String newContent, Long userId);
    void deleteMessage(Long messageId, Long userId);

    // Member management
    MessagingDtos.ConversationMemberListResponse getConversationMembers(Long conversationId, Long userId, Pageable pageable);
    void addMembers(MessagingDtos.AddMemberRequest request, Long userId);
    void removeMember(MessagingDtos.RemoveMemberRequest request, Long userId);
    void updateMemberRole(MessagingDtos.UpdateMemberRoleRequest request, Long userId);
    void leaveConversation(Long conversationId, Long userId);

    // Read status
    void markAsRead(MessagingDtos.MarkAsReadRequest request, Long userId);
    int getUnreadCount(Long conversationId, Long userId);
    int getTotalUnreadCount(Long userId);

    // Utility methods
    boolean isMember(Long conversationId, Long userId);
    boolean isAdmin(Long conversationId, Long userId);
    MessagingDtos.ConversationResponse getOrCreateDirectConversation(Long userId1, Long userId2);
}

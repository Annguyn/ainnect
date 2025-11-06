package com.ainnect.service.impl;

import com.ainnect.common.enums.ConversationMemberRole;
import com.ainnect.common.enums.ConversationType;
import com.ainnect.common.enums.MessageType;
import com.ainnect.dto.messaging.MessagingDtos;
import com.ainnect.entity.*;
import com.ainnect.repository.*;
import com.ainnect.service.MessageService;
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
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final MessageRepository messageRepository;
    private final MessageAttachmentRepository messageAttachmentRepository;
    private final UserRepository userRepository;
    private final WebSocketService webSocketService;
    private final MessageReactionRepository messageReactionRepository;

    @Override
    @Transactional
    public MessagingDtos.ConversationResponse createConversation(MessagingDtos.CreateConversationRequest request, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getType() == ConversationType.direct) {
            if (request.getParticipantIds() == null || request.getParticipantIds().isEmpty()) {
                throw new IllegalArgumentException("Direct conversation requires one participant");
            }
            Long otherUserId = request.getParticipantIds().get(0);
            if (otherUserId.equals(creatorId)) {
                throw new IllegalArgumentException("Cannot create direct conversation with yourself");
            }
            List<Conversation> existingList = conversationRepository.findDirectConversationBetweenUsers(
                    creatorId, otherUserId, org.springframework.data.domain.PageRequest.of(0, 1));
            if (!existingList.isEmpty()) {
                return toConversationResponse(existingList.get(0), creatorId);
            }
        }

        Conversation conversation = Conversation.builder()
                .type(request.getType())
                .title(request.getTitle())
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Conversation savedConversation = conversationRepository.save(conversation);

        ConversationMemberId creatorMemberId = new ConversationMemberId(savedConversation.getId(), creatorId);
        ConversationMember creatorMember = ConversationMember.builder()
                .id(creatorMemberId)
                .conversation(savedConversation)
                .user(creator)
                .role(ConversationMemberRole.admin)
                .joinedAt(LocalDateTime.now())
                .build();

        conversationMemberRepository.save(creatorMember);

        if (request.getParticipantIds() != null && !request.getParticipantIds().isEmpty()) {
            List<Long> uniqueIds = request.getParticipantIds().stream().distinct().collect(Collectors.toList());
            for (Long participantId : uniqueIds) {
                if (!participantId.equals(creatorId)) {
                    User participant = userRepository.findById(participantId)
                            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

                    if (!conversationMemberRepository.existsByConversationIdAndUserId(savedConversation.getId(), participantId)) {
                        ConversationMemberId memberId = new ConversationMemberId(savedConversation.getId(), participantId);
                        ConversationMember member = ConversationMember.builder()
                                .id(memberId)
                                .conversation(savedConversation)
                                .user(participant)
                                .role(ConversationMemberRole.member)
                                .joinedAt(LocalDateTime.now())
                                .build();

                        conversationMemberRepository.save(member);
                    }
                }
            }
        }

        MessagingDtos.ConversationResponse response = toConversationResponse(savedConversation, creatorId);

        try {
            MessagingDtos.WebSocketMessage wsMessage = MessagingDtos.WebSocketMessage.builder()
                    .type("NEW_CONVERSATION")
                    .data(response)
                    .conversationId(savedConversation.getId())
                    .senderId(creatorId)
                    .timestamp(LocalDateTime.now())
                    .build();
            
            webSocketService.sendMessageToConversation(savedConversation.getId(), wsMessage);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for new conversation: {}", e.getMessage());
        }

        return response;
    }

    @Override
    public MessagingDtos.ConversationResponse getConversationById(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!isMember(conversationId, userId)) {
            throw new IllegalArgumentException("You are not a member of this conversation");
        }

        return toConversationResponse(conversation, userId);
    }

    @Override
    public MessagingDtos.ConversationListResponse getUserConversations(Long userId, Pageable pageable) {
        Page<Conversation> conversationPage = conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId, pageable);
        List<MessagingDtos.ConversationResponse> conversations = conversationPage.getContent().stream()
                .map(conversation -> toConversationResponse(conversation, userId))
                .collect(Collectors.toList());

        return MessagingDtos.ConversationListResponse.builder()
                .conversations(conversations)
                .currentPage(conversationPage.getNumber())
                .pageSize(conversationPage.getSize())
                .totalElements(conversationPage.getTotalElements())
                .totalPages(conversationPage.getTotalPages())
                .hasNext(conversationPage.hasNext())
                .hasPrevious(conversationPage.hasPrevious())
                .build();
    }

    @Override
    public MessagingDtos.ConversationListResponse getDirectConversations(Long userId, Pageable pageable) {
        List<Conversation> conversations = conversationRepository.findByTypeAndUserId(ConversationType.direct, userId);
        
        int start = pageable.getPageNumber() * pageable.getPageSize();
        int end = Math.min(start + pageable.getPageSize(), conversations.size());
        List<Conversation> pageConversations = conversations.subList(start, end);

        List<MessagingDtos.ConversationResponse> conversationResponses = pageConversations.stream()
                .map(conversation -> toConversationResponse(conversation, userId))
                .collect(Collectors.toList());

        return MessagingDtos.ConversationListResponse.builder()
                .conversations(conversationResponses)
                .currentPage(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .totalElements((long) conversations.size())
                .totalPages((int) Math.ceil((double) conversations.size() / pageable.getPageSize()))
                .hasNext(end < conversations.size())
                .hasPrevious(pageable.getPageNumber() > 0)
                .build();
    }

    @Override
    public MessagingDtos.ConversationListResponse getGroupConversations(Long userId, Pageable pageable) {
        List<Conversation> conversations = conversationRepository.findByTypeAndUserId(ConversationType.group, userId);
        
        int start = pageable.getPageNumber() * pageable.getPageSize();
        int end = Math.min(start + pageable.getPageSize(), conversations.size());
        List<Conversation> pageConversations = conversations.subList(start, end);

        List<MessagingDtos.ConversationResponse> conversationResponses = pageConversations.stream()
                .map(conversation -> toConversationResponse(conversation, userId))
                .collect(Collectors.toList());

        return MessagingDtos.ConversationListResponse.builder()
                .conversations(conversationResponses)
                .currentPage(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .totalElements((long) conversations.size())
                .totalPages((int) Math.ceil((double) conversations.size() / pageable.getPageSize()))
                .hasNext(end < conversations.size())
                .hasPrevious(pageable.getPageNumber() > 0)
                .build();
    }

    @Override
    @Transactional
    public void deleteConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!isAdmin(conversationId, userId)) {
            throw new IllegalArgumentException("Only admins can delete conversations");
        }

        conversationRepository.delete(conversation);
    }

    @Override
    @Transactional
    public MessagingDtos.MessageResponse sendMessage(MessagingDtos.SendMessageRequest request, Long senderId) {
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!isMember(request.getConversationId(), senderId)) {
            throw new IllegalArgumentException("You are not a member of this conversation");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .messageType(request.getMessageType() != null ? request.getMessageType() : MessageType.text)
                .createdAt(LocalDateTime.now())
                .build();

        if (request.getReplyToMessageId() != null) {
            Message parent = messageRepository.findByIdAndDeletedAtIsNull(request.getReplyToMessageId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent message not found"));
            if (!parent.getConversation().getId().equals(request.getConversationId())) {
                throw new IllegalArgumentException("Parent message does not belong to this conversation");
            }
            message.setParent(parent);
        }

        Message savedMessage = messageRepository.save(message);

        if (request.getAttachmentUrls() != null && !request.getAttachmentUrls().isEmpty()) {
            for (String attachmentUrl : request.getAttachmentUrls()) {
                MessageAttachment attachment = MessageAttachment.builder()
                        .message(savedMessage)
                        .fileUrl(attachmentUrl)
                        .createdAt(LocalDateTime.now())
                        .build();

                messageAttachmentRepository.save(attachment);
            }
        }

        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessagingDtos.MessageResponse messageResponse = toMessageResponse(savedMessage, senderId);

        try {
            MessagingDtos.WebSocketMessage wsMessage = MessagingDtos.WebSocketMessage.builder()
                    .type("NEW_MESSAGE")
                    .data(messageResponse)
                    .conversationId(request.getConversationId())
                    .senderId(senderId)
                    .timestamp(messageResponse.getCreatedAt())
                    .build();
            
            webSocketService.sendMessageToConversation(request.getConversationId(), wsMessage);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for message: {}", e.getMessage());
        }

        return messageResponse;
    }

    @Override
    public MessagingDtos.MessageListResponse getConversationMessages(Long conversationId, Long userId, Pageable pageable) {
        if (!isMember(conversationId, userId)) {
            throw new IllegalArgumentException("You are not a member of this conversation");
        }

        Page<Message> messagePage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);
        List<MessagingDtos.MessageResponse> messages = messagePage.getContent().stream()
                .map(message -> toMessageResponseWithReactions(message, userId))
                .collect(Collectors.toList());

        return MessagingDtos.MessageListResponse.builder()
                .messages(messages)
                .currentPage(messagePage.getNumber())
                .pageSize(messagePage.getSize())
                .totalElements(messagePage.getTotalElements())
                .totalPages(messagePage.getTotalPages())
                .hasNext(messagePage.hasNext())
                .hasPrevious(messagePage.hasPrevious())
                .build();
    }

    @Override
    public MessagingDtos.MessageResponse getMessageById(Long messageId, Long userId) {
        Message message = messageRepository.findByIdAndDeletedAtIsNull(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!isMember(message.getConversation().getId(), userId)) {
            throw new IllegalArgumentException("You are not a member of this conversation");
        }

        return toMessageResponseWithReactions(message, userId);
    }

    @Override
    @Transactional
    public void reactToMessage(Long messageId, String type, Long userId) {
        Message message = messageRepository.findByIdAndDeletedAtIsNull(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        if (!isMember(message.getConversation().getId(), userId)) {
            throw new IllegalArgumentException("You are not a member of this conversation");
        }
        com.ainnect.common.enums.ReactionType reactionType;
        try {
            reactionType = com.ainnect.common.enums.ReactionType.valueOf(type.toLowerCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid reaction type");
        }
        var existing = messageReactionRepository.findByMessageIdAndUserId(messageId, userId);
        if (existing.isPresent()) {
            MessageReaction mr = existing.get();
            mr.setType(reactionType);
            messageReactionRepository.save(mr);
        } else {
            User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
            MessageReaction mr = MessageReaction.builder()
                    .message(message)
                    .user(user)
                    .type(reactionType)
                    .createdAt(LocalDateTime.now())
                    .build();
            messageReactionRepository.save(mr);
        }

        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("messageId", messageId);
        java.util.Map<String, Long> counts = new java.util.HashMap<>();
        for (var rt : com.ainnect.common.enums.ReactionType.values()) {
            counts.put(rt.name(), messageReactionRepository.countByMessageIdAndType(messageId, rt));
        }
        payload.put("reactionCounts", counts);
        payload.put("userId", userId);
        payload.put("currentUserReaction", reactionType.name());

        try {
            MessagingDtos.WebSocketMessage ws = MessagingDtos.WebSocketMessage.builder()
                    .type("MESSAGE_REACTION")
                    .data(payload)
                    .conversationId(message.getConversation().getId())
                    .senderId(userId)
                    .timestamp(LocalDateTime.now())
                    .build();
            webSocketService.sendMessageToConversation(message.getConversation().getId(), ws);
        } catch (Exception ignored) { }
    }

    @Override
    @Transactional
    public void removeReactionFromMessage(Long messageId, Long userId) {
        var existing = messageReactionRepository.findByMessageIdAndUserId(messageId, userId);
        if (existing.isPresent()) {
            MessageReaction mr = existing.get();
            Message message = mr.getMessage();
            messageReactionRepository.delete(mr);

            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("messageId", messageId);
            java.util.Map<String, Long> counts = new java.util.HashMap<>();
            for (var rt : com.ainnect.common.enums.ReactionType.values()) {
                counts.put(rt.name(), messageReactionRepository.countByMessageIdAndType(messageId, rt));
            }
            payload.put("reactionCounts", counts);
            payload.put("userId", userId);
            payload.put("currentUserReaction", null);

            try {
                MessagingDtos.WebSocketMessage ws = MessagingDtos.WebSocketMessage.builder()
                        .type("MESSAGE_REACTION")
                        .data(payload)
                        .conversationId(message.getConversation().getId())
                        .senderId(userId)
                        .timestamp(LocalDateTime.now())
                        .build();
                webSocketService.sendMessageToConversation(message.getConversation().getId(), ws);
            } catch (Exception ignored) { }
        }
    }

    @Override
    @Transactional
    public MessagingDtos.MessageResponse editMessage(Long messageId, String newContent, Long userId) {
        Message message = messageRepository.findByIdAndDeletedAtIsNull(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only edit your own messages");
        }

        message.setContent(newContent);
        Message updatedMessage = messageRepository.save(message);

        return toMessageResponse(updatedMessage, userId);
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findByIdAndDeletedAtIsNull(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!message.getSender().getId().equals(userId) && !isAdmin(message.getConversation().getId(), userId)) {
            throw new IllegalArgumentException("You can only delete your own messages or be an admin");
        }

        message.setDeletedAt(LocalDateTime.now());
        messageRepository.save(message);
    }

    @Override
    public MessagingDtos.ConversationMemberListResponse getConversationMembers(Long conversationId, Long userId, Pageable pageable) {
        if (!isMember(conversationId, userId)) {
            throw new IllegalArgumentException("You are not a member of this conversation");
        }

        Page<ConversationMember> memberPage = conversationMemberRepository.findByConversationId(conversationId, pageable);
        List<MessagingDtos.ConversationMemberResponse> members = memberPage.getContent().stream()
                .map(this::toConversationMemberResponse)
                .collect(Collectors.toList());

        return MessagingDtos.ConversationMemberListResponse.builder()
                .members(members)
                .currentPage(memberPage.getNumber())
                .pageSize(memberPage.getSize())
                .totalElements(memberPage.getTotalElements())
                .totalPages(memberPage.getTotalPages())
                .hasNext(memberPage.hasNext())
                .hasPrevious(memberPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional
    public void addMembers(MessagingDtos.AddMemberRequest request, Long userId) {
        if (!isAdmin(request.getConversationId(), userId)) {
            throw new IllegalArgumentException("Only admins can add members");
        }

        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        for (Long memberId : request.getUserIds()) {
            if (!conversationMemberRepository.existsByConversationIdAndUserId(request.getConversationId(), memberId)) {
                User member = userRepository.findById(memberId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found: " + memberId));

                ConversationMemberId memberIdObj = new ConversationMemberId(request.getConversationId(), memberId);
                ConversationMember memberObj = ConversationMember.builder()
                        .id(memberIdObj)
                        .conversation(conversation)
                        .user(member)
                        .role(ConversationMemberRole.member)
                        .joinedAt(LocalDateTime.now())
                        .build();

                conversationMemberRepository.save(memberObj);
            }
        }

        try {
            MessagingDtos.WebSocketMessage wsMessage = MessagingDtos.WebSocketMessage.builder()
                    .type("MEMBER_ADDED")
                    .data(request.getUserIds())
                    .conversationId(request.getConversationId())
                    .senderId(userId)
                    .timestamp(LocalDateTime.now())
                    .build();
            
            webSocketService.sendMessageToConversation(request.getConversationId(), wsMessage);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for added members: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void removeMember(MessagingDtos.RemoveMemberRequest request, Long userId) {
        if (!isAdmin(request.getConversationId(), userId)) {
            throw new IllegalArgumentException("Only admins can remove members");
        }

        conversationMemberRepository.deleteByConversationIdAndUserId(request.getConversationId(), request.getUserId());
    }

    @Override
    @Transactional
    public void updateMemberRole(MessagingDtos.UpdateMemberRoleRequest request, Long userId) {
        if (!isAdmin(request.getConversationId(), userId)) {
            throw new IllegalArgumentException("Only admins can update member roles");
        }

        ConversationMember member = conversationMemberRepository.findByConversationIdAndUserId(request.getConversationId(), request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        member.setRole(request.getRole());
        conversationMemberRepository.save(member);
    }

    @Override
    @Transactional
    public void leaveConversation(Long conversationId, Long userId) {
        if (!isMember(conversationId, userId)) {
            throw new IllegalArgumentException("You are not a member of this conversation");
        }

        conversationMemberRepository.deleteByConversationIdAndUserId(conversationId, userId);
    }

    @Override
    @Transactional
    public void markAsRead(MessagingDtos.MarkAsReadRequest request, Long userId) {
        ConversationMember member = conversationMemberRepository.findByConversationIdAndUserId(request.getConversationId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this conversation"));

        member.setLastReadMessageId(request.getMessageId());
        conversationMemberRepository.save(member);

        try {
            webSocketService.sendReadReceipt(request.getConversationId(), request);
        } catch (Exception e) {
            log.error("Failed to send WebSocket read receipt notification: {}", e.getMessage());
        }
    }

    @Override
    public int getUnreadCount(Long conversationId, Long userId) {
        ConversationMember member = conversationMemberRepository.findByConversationIdAndUserId(conversationId, userId)
                .orElse(null);

        if (member == null || member.getLastReadMessageId() == null) {
            return (int) messageRepository.countByConversationId(conversationId);
        }

        List<Message> unreadMessages = messageRepository.findUnreadMessages(conversationId, member.getLastReadMessageId());
        return unreadMessages.size();
    }

    @Override
    public int getTotalUnreadCount(Long userId) {
        List<Conversation> conversations = conversationRepository.findUserConversations(userId);
        int totalUnread = 0;

        for (Conversation conversation : conversations) {
            totalUnread += getUnreadCount(conversation.getId(), userId);
        }

        return totalUnread;
    }

    @Override
    public boolean isMember(Long conversationId, Long userId) {
        return conversationMemberRepository.existsByConversationIdAndUserId(conversationId, userId);
    }

    @Override
    public boolean isAdmin(Long conversationId, Long userId) {
        return conversationMemberRepository.existsByConversationIdAndUserIdAndRole(conversationId, userId, ConversationMemberRole.admin);
    }

    @Override
    @Transactional
    public MessagingDtos.ConversationResponse getOrCreateDirectConversation(Long userId1, Long userId2) {
        List<Conversation> existingList = conversationRepository.findDirectConversationBetweenUsers(
                userId1, userId2, org.springframework.data.domain.PageRequest.of(0, 1));
        if (!existingList.isEmpty()) {
            return toConversationResponse(existingList.get(0), userId1);
        }

        MessagingDtos.CreateConversationRequest request = MessagingDtos.CreateConversationRequest.builder()
                .type(ConversationType.direct)
                .participantIds(List.of(userId2))
                .build();

        return createConversation(request, userId1);
    }

    private MessagingDtos.ConversationResponse toConversationResponse(Conversation conversation, Long currentUserId) {
        int memberCount = (int) conversationMemberRepository.countByConversationId(conversation.getId());
        int unreadCount = getUnreadCount(conversation.getId(), currentUserId);
        
        Optional<Message> lastMessage = messageRepository.findLatestMessageByConversationId(conversation.getId());
        MessagingDtos.MessageResponse lastMessageResponse = lastMessage.map(message -> toMessageResponse(message, currentUserId)).orElse(null);

        ConversationMember member = conversationMemberRepository.findByConversationIdAndUserId(conversation.getId(), currentUserId).orElse(null);
        ConversationMemberRole userRole = member != null ? member.getRole() : null;

        MessagingDtos.ConversationResponse.ConversationResponseBuilder builder = MessagingDtos.ConversationResponse.builder()
                .id(conversation.getId())
                .type(conversation.getType())
                .title(conversation.getTitle())
                .createdById(conversation.getCreatedBy().getId())
                .createdByUsername(conversation.getCreatedBy().getUsername())
                .createdByDisplayName(conversation.getCreatedBy().getDisplayName())
                .createdByAvatarUrl(conversation.getCreatedBy().getAvatarUrl())
                .memberCount(memberCount)
                .unreadCount(unreadCount)
                .lastMessage(lastMessageResponse)
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .isMember(isMember(conversation.getId(), currentUserId))
                .userRole(userRole);

        if (conversation.getType() == ConversationType.direct) {
            List<ConversationMember> allMembers = conversationMemberRepository.findByConversationId(conversation.getId());
            Optional<ConversationMember> otherParticipant = allMembers.stream()
                    .filter(m -> !m.getUser().getId().equals(currentUserId))
                    .findFirst();
            
            if (otherParticipant.isPresent()) {
                User otherUser = otherParticipant.get().getUser();
                builder.otherParticipantId(otherUser.getId())
                        .otherParticipantUsername(otherUser.getUsername())
                        .otherParticipantDisplayName(otherUser.getDisplayName())
                        .otherParticipantAvatarUrl(otherUser.getAvatarUrl())
                        .otherParticipantIsOnline(false)
                        .otherParticipantLastSeenAt(null);
            }
        }
        
        if (conversation.getType() == ConversationType.group) {
            List<ConversationMember> allMembers = conversationMemberRepository.findByConversationId(conversation.getId());
            List<MessagingDtos.ConversationMemberResponse> memberResponses = allMembers.stream()
                    .map(this::toConversationMemberResponse)
                    .collect(Collectors.toList());
            builder.members(memberResponses);
        }

        return builder.build();
    }

    private MessagingDtos.MessageResponse toMessageResponse(Message message, Long currentUserId) {
        List<MessageAttachment> attachments = messageAttachmentRepository.findByMessageId(message.getId());
        List<MessagingDtos.MessageAttachmentResponse> attachmentResponses = attachments.stream()
                .map(this::toMessageAttachmentResponse)
                .collect(Collectors.toList());

        ConversationMember member = conversationMemberRepository.findByConversationIdAndUserId(message.getConversation().getId(), currentUserId).orElse(null);
        boolean isRead = member != null && member.getLastReadMessageId() != null && member.getLastReadMessageId() >= message.getId();

        MessagingDtos.MessageResponse resp = MessagingDtos.MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderUsername(message.getSender().getUsername())
                .senderDisplayName(message.getSender().getDisplayName())
                .senderAvatarUrl(message.getSender().getAvatarUrl())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .attachments(attachmentResponses)
                .createdAt(message.getCreatedAt())
                .deletedAt(message.getDeletedAt())
                .isRead(isRead)
                .isEdited(false) 
                .editedAt(null)
                .build();

        if (message.getParent() != null) {
            Message parent = message.getParent();
            MessagingDtos.ParentMessageInfo p = MessagingDtos.ParentMessageInfo.builder()
                    .id(parent.getId())
                    .senderId(parent.getSender().getId())
                    .senderUsername(parent.getSender().getUsername())
                    .contentPreview(parent.getContent() != null && parent.getContent().length() > 120 ? parent.getContent().substring(0, 120) : parent.getContent())
                    .messageType(parent.getMessageType())
                    .createdAt(parent.getCreatedAt())
                    .build();
            resp.setReplyTo(p);
        }
        return resp;
    }

    private MessagingDtos.MessageResponse toMessageResponseWithReactions(Message message, Long currentUserId) {
        MessagingDtos.MessageResponse base = toMessageResponse(message, currentUserId);
        java.util.Map<String, Long> counts = new java.util.HashMap<>();
        for (var rt : com.ainnect.common.enums.ReactionType.values()) {
            counts.put(rt.name(), messageReactionRepository.countByMessageIdAndType(message.getId(), rt));
        }
        var current = messageReactionRepository.findByMessageIdAndUserId(message.getId(), currentUserId)
                .map(mr -> mr.getType().name())
                .orElse(null);
        base.setReactionCounts(counts);
        base.setCurrentUserReaction(current);
        return base;
    }

    private MessagingDtos.MessageAttachmentResponse toMessageAttachmentResponse(MessageAttachment attachment) {
        return MessagingDtos.MessageAttachmentResponse.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileUrl(attachment.getFileUrl())
                .fileType(attachment.getFileType())
                .fileSize(attachment.getFileSize())
                .createdAt(attachment.getCreatedAt())
                .build();
    }

    private MessagingDtos.ConversationMemberResponse toConversationMemberResponse(ConversationMember member) {
        return MessagingDtos.ConversationMemberResponse.builder()
                .userId(member.getUser().getId())
                .username(member.getUser().getUsername())
                .displayName(member.getUser().getDisplayName())
                .avatarUrl(member.getUser().getAvatarUrl())
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .lastReadMessageId(member.getLastReadMessageId())
                .isOnline(false) 
                .lastSeenAt(null)
                .build();
    }
}

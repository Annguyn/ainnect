package com.ainnect.service.impl;

import com.ainnect.common.enums.ConversationMemberRole;
import com.ainnect.common.enums.ConversationType;
import com.ainnect.common.enums.MessageType;
import com.ainnect.dto.messaging.MessagingDtos;
import com.ainnect.entity.*;
import com.ainnect.repository.*;
import com.ainnect.service.MessageService;
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

    @Override
    @Transactional
    public MessagingDtos.ConversationResponse createConversation(MessagingDtos.CreateConversationRequest request, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Conversation conversation = Conversation.builder()
                .type(request.getType())
                .title(request.getTitle())
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Conversation savedConversation = conversationRepository.save(conversation);

        // Add creator as member
        ConversationMemberId creatorMemberId = new ConversationMemberId(savedConversation.getId(), creatorId);
        ConversationMember creatorMember = ConversationMember.builder()
                .id(creatorMemberId)
                .conversation(savedConversation)
                .user(creator)
                .role(ConversationMemberRole.admin)
                .joinedAt(LocalDateTime.now())
                .build();

        conversationMemberRepository.save(creatorMember);

        // Add other participants
        if (request.getParticipantIds() != null && !request.getParticipantIds().isEmpty()) {
            for (Long participantId : request.getParticipantIds()) {
                if (!participantId.equals(creatorId)) {
                    User participant = userRepository.findById(participantId)
                            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

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

        return toConversationResponse(savedConversation, creatorId);
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

        Message savedMessage = messageRepository.save(message);

        // Save attachments if any
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

        // Update conversation timestamp
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return toMessageResponse(savedMessage, senderId);
    }

    @Override
    public MessagingDtos.MessageListResponse getConversationMessages(Long conversationId, Long userId, Pageable pageable) {
        if (!isMember(conversationId, userId)) {
            throw new IllegalArgumentException("You are not a member of this conversation");
        }

        Page<Message> messagePage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);
        List<MessagingDtos.MessageResponse> messages = messagePage.getContent().stream()
                .map(message -> toMessageResponse(message, userId))
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

        return toMessageResponse(message, userId);
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
        Optional<Conversation> existingConversation = conversationRepository.findDirectConversationBetweenUsers(userId1, userId2);
        
        if (existingConversation.isPresent()) {
            return toConversationResponse(existingConversation.get(), userId1);
        }

        // Create new direct conversation
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

        return MessagingDtos.ConversationResponse.builder()
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
                .userRole(userRole)
                .build();
    }

    private MessagingDtos.MessageResponse toMessageResponse(Message message, Long currentUserId) {
        List<MessageAttachment> attachments = messageAttachmentRepository.findByMessageId(message.getId());
        List<MessagingDtos.MessageAttachmentResponse> attachmentResponses = attachments.stream()
                .map(this::toMessageAttachmentResponse)
                .collect(Collectors.toList());

        ConversationMember member = conversationMemberRepository.findByConversationIdAndUserId(message.getConversation().getId(), currentUserId).orElse(null);
        boolean isRead = member != null && member.getLastReadMessageId() != null && member.getLastReadMessageId() >= message.getId();

        return MessagingDtos.MessageResponse.builder()
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
                .isEdited(false) // TODO: Implement message editing tracking
                .editedAt(null)
                .build();
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
                .isOnline(false) // TODO: Implement online status tracking
                .lastSeenAt(null)
                .build();
    }
}

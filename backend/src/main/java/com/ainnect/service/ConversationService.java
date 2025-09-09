package com.ainnect.service;

import com.ainnect.entity.Conversation;

import java.util.Optional;

public interface ConversationService {
	Conversation create(Long createdById, String title, com.ainnect.common.enums.ConversationType type, java.util.List<Long> memberIds);
	Conversation addMember(Long conversationId, Long userId, com.ainnect.common.enums.ConversationMemberRole role);
	Optional<Conversation> findById(Long id);
}

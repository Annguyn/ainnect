package com.ainnect.service.impl;

import com.ainnect.common.enums.ConversationMemberRole;
import com.ainnect.common.enums.ConversationType;
import com.ainnect.entity.*;
import com.ainnect.repository.ConversationMemberRepository;
import com.ainnect.repository.ConversationRepository;
import com.ainnect.repository.UserRepository;
import com.ainnect.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {
	private final ConversationRepository conversationRepository;
	private final ConversationMemberRepository conversationMemberRepository;
	private final UserRepository userRepository;

	@Override
	public Conversation create(Long createdById, String title, ConversationType type, List<Long> memberIds) {
		User creator = userRepository.findById(createdById).orElseThrow();
		Conversation conv = new Conversation();
		conv.setType(type);
		conv.setCreatedBy(creator);
		conv.setTitle(title);
		conv.setCreatedAt(LocalDateTime.now());
		conv.setUpdatedAt(LocalDateTime.now());
		Conversation saved = conversationRepository.save(conv);

		// add creator as admin
		ConversationMember cmCreator = new ConversationMember();
		cmCreator.setId(new ConversationMemberId(saved.getId(), createdById));
		cmCreator.setConversation(saved);
		cmCreator.setUser(creator);
		cmCreator.setRole(ConversationMemberRole.admin);
		cmCreator.setJoinedAt(LocalDateTime.now());
		conversationMemberRepository.save(cmCreator);

		// add other members as member
		for (Long uid : memberIds) {
			if (uid.equals(createdById)) continue;
			User u = userRepository.findById(uid).orElseThrow();
			ConversationMember cm = new ConversationMember();
			cm.setId(new ConversationMemberId(saved.getId(), uid));
			cm.setConversation(saved);
			cm.setUser(u);
			cm.setRole(ConversationMemberRole.member);
			cm.setJoinedAt(LocalDateTime.now());
			conversationMemberRepository.save(cm);
		}
		return saved;
	}

	@Override
	public Conversation addMember(Long conversationId, Long userId, ConversationMemberRole role) {
		Conversation conv = conversationRepository.findById(conversationId).orElseThrow();
		User user = userRepository.findById(userId).orElseThrow();
		ConversationMember cm = new ConversationMember();
		cm.setId(new ConversationMemberId(conversationId, userId));
		cm.setConversation(conv);
		cm.setUser(user);
		cm.setRole(role);
		cm.setJoinedAt(LocalDateTime.now());
		conversationMemberRepository.save(cm);
		return conv;
	}

	@Override
	public Optional<Conversation> findById(Long id) {
		return conversationRepository.findById(id);
	}
}

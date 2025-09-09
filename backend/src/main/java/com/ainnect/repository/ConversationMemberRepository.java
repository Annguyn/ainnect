package com.ainnect.repository;

import com.ainnect.entity.ConversationMember;
import com.ainnect.entity.ConversationMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, ConversationMemberId> {
	List<ConversationMember> findByConversation_Id(Long conversationId);
	List<ConversationMember> findByUser_Id(Long userId);
}

package com.ainnect.repository;

import com.ainnect.entity.Conversation;
import com.ainnect.common.enums.ConversationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
	
	@Query("SELECT c FROM Conversation c WHERE c.id IN " +
		   "(SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId) " +
		   "ORDER BY c.updatedAt DESC")
	Page<Conversation> findByUserIdOrderByUpdatedAtDesc(@Param("userId") Long userId, Pageable pageable);
	
	@Query("SELECT c FROM Conversation c WHERE c.id IN " +
		   "(SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId) " +
		   "ORDER BY c.updatedAt DESC")
	List<Conversation> findUserConversations(@Param("userId") Long userId);
	
	@Query("SELECT c FROM Conversation c WHERE c.type = :type AND c.id IN " +
		   "(SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId) " +
		   "ORDER BY c.updatedAt DESC")
	List<Conversation> findByTypeAndUserId(@Param("type") ConversationType type, @Param("userId") Long userId);
	
	@Query("SELECT c FROM Conversation c WHERE c.type = 'direct' AND c.id IN " +
		   "(SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId1) " +
		   "AND c.id IN (SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId2)")
	Optional<Conversation> findDirectConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
	
	@Query("SELECT c FROM Conversation c WHERE c.createdBy.id = :userId ORDER BY c.createdAt DESC")
	List<Conversation> findByCreatedById(@Param("userId") Long userId);
	
	@Query("SELECT COUNT(c) FROM Conversation c WHERE c.id IN " +
		   "(SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId)")
	long countByUserId(@Param("userId") Long userId);
}


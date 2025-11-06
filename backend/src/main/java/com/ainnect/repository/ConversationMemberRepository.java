package com.ainnect.repository;

import com.ainnect.entity.ConversationMember;
import com.ainnect.entity.ConversationMemberId;
import com.ainnect.common.enums.ConversationMemberRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, ConversationMemberId> {
	
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT cm FROM ConversationMember cm WHERE cm.conversation.id = :conversationId ORDER BY cm.joinedAt ASC")
    Page<ConversationMember> findByConversationId(@Param("conversationId") Long conversationId, Pageable pageable);
	
	@EntityGraph(attributePaths = {"user"})
	@Query("SELECT cm FROM ConversationMember cm WHERE cm.conversation.id = :conversationId ORDER BY cm.joinedAt ASC")
	List<ConversationMember> findByConversationId(@Param("conversationId") Long conversationId);
	
	@Query("SELECT cm FROM ConversationMember cm WHERE cm.user.id = :userId ORDER BY cm.joinedAt DESC")
	List<ConversationMember> findByUserId(@Param("userId") Long userId);
	
	@Query("SELECT cm FROM ConversationMember cm WHERE cm.conversation.id = :conversationId AND cm.user.id = :userId")
	Optional<ConversationMember> findByConversationIdAndUserId(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
	
	@Query("SELECT COUNT(cm) FROM ConversationMember cm WHERE cm.conversation.id = :conversationId")
	long countByConversationId(@Param("conversationId") Long conversationId);
	
	@Query("SELECT COUNT(cm) FROM ConversationMember cm WHERE cm.user.id = :userId")
	long countByUserId(@Param("userId") Long userId);
	
	@Query("SELECT cm FROM ConversationMember cm WHERE cm.conversation.id = :conversationId AND cm.role = :role")
	List<ConversationMember> findByConversationIdAndRole(@Param("conversationId") Long conversationId, @Param("role") ConversationMemberRole role);
	
	@Query("SELECT CASE WHEN COUNT(cm) > 0 THEN true ELSE false END FROM ConversationMember cm WHERE cm.conversation.id = :conversationId AND cm.user.id = :userId")
	boolean existsByConversationIdAndUserId(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
	
	@Query("SELECT CASE WHEN COUNT(cm) > 0 THEN true ELSE false END FROM ConversationMember cm WHERE cm.conversation.id = :conversationId AND cm.user.id = :userId AND cm.role = :role")
	boolean existsByConversationIdAndUserIdAndRole(@Param("conversationId") Long conversationId, @Param("userId") Long userId, @Param("role") ConversationMemberRole role);
	
	@Query("DELETE FROM ConversationMember cm WHERE cm.conversation.id = :conversationId AND cm.user.id = :userId")
	void deleteByConversationIdAndUserId(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}


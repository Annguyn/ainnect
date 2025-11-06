package com.ainnect.repository;

import com.ainnect.entity.Conversation;
import com.ainnect.common.enums.ConversationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
	
    @EntityGraph(attributePaths = {"createdBy"})
    @Query(value = "SELECT DISTINCT c FROM Conversation c WHERE c.id IN " +
           "(SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId) " +
           "ORDER BY c.updatedAt DESC",
           countQuery = "SELECT COUNT(DISTINCT c.id) FROM Conversation c WHERE c.id IN " +
           "(SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId)")
    Page<Conversation> findByUserIdOrderByUpdatedAtDesc(@Param("userId") Long userId, Pageable pageable);
	
    @EntityGraph(attributePaths = {"createdBy"})
    @Query("SELECT DISTINCT c FROM Conversation c WHERE c.id IN " +
           "(SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId) " +
           "ORDER BY c.updatedAt DESC")
    List<Conversation> findUserConversations(@Param("userId") Long userId);
	
    @EntityGraph(attributePaths = {"createdBy"})
    @Query("SELECT DISTINCT c FROM Conversation c WHERE c.type = :type AND c.id IN " +
           "(SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId) " +
           "ORDER BY c.updatedAt DESC")
    List<Conversation> findByTypeAndUserId(@Param("type") ConversationType type, @Param("userId") Long userId);

    @EntityGraph(attributePaths = {"createdBy"})
    @Query("SELECT DISTINCT c FROM Conversation c WHERE c.type = 'direct' AND c.id IN " +
           "(SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId1) " +
           "AND c.id IN (SELECT cm.conversation.id FROM ConversationMember cm WHERE cm.user.id = :userId2) " +
           "ORDER BY c.updatedAt DESC")
    java.util.List<Conversation> findDirectConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2, org.springframework.data.domain.Pageable pageable);

	@EntityGraph(attributePaths = {"createdBy"})
	Optional<Conversation> findById(Long id);
}
package com.ainnect.repository;

import com.ainnect.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {
	
	@Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
	Page<Message> findByConversationIdOrderByCreatedAtDesc(@Param("conversationId") Long conversationId, Pageable pageable);
	
	@Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
	List<Message> findLatestMessagesByConversationId(@Param("conversationId") Long conversationId, Pageable pageable);
	
	@Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.deletedAt IS NULL ORDER BY m.createdAt ASC")
	List<Message> findByConversationIdOrderByCreatedAtAsc(@Param("conversationId") Long conversationId);
	
	@Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.deletedAt IS NULL")
	long countByConversationId(@Param("conversationId") Long conversationId);
	
	@Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.id > :lastReadMessageId AND m.deletedAt IS NULL ORDER BY m.createdAt ASC")
	List<Message> findUnreadMessages(@Param("conversationId") Long conversationId, @Param("lastReadMessageId") Long lastReadMessageId);
	
	@Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.sender.id = :senderId AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
	List<Message> findByConversationIdAndSenderId(@Param("conversationId") Long conversationId, @Param("senderId") Long senderId);
	
	@Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.createdAt > :since AND m.deletedAt IS NULL ORDER BY m.createdAt ASC")
	List<Message> findMessagesSince(@Param("conversationId") Long conversationId, @Param("since") LocalDateTime since);
	
	Optional<Message> findByIdAndDeletedAtIsNull(Long id);
	
	@Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
	Optional<Message> findLatestMessageByConversationId(@Param("conversationId") Long conversationId);
}


package com.ainnect.repository;

import com.ainnect.entity.MessageReaction;
import com.ainnect.common.enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {

    @Query("SELECT mr FROM MessageReaction mr WHERE mr.message.id = :messageId AND mr.user.id = :userId")
    Optional<MessageReaction> findByMessageIdAndUserId(@Param("messageId") Long messageId, @Param("userId") Long userId);

    @Query("SELECT mr FROM MessageReaction mr WHERE mr.message.id = :messageId")
    List<MessageReaction> findByMessageId(@Param("messageId") Long messageId);

    @Query("SELECT COUNT(mr) FROM MessageReaction mr WHERE mr.message.id = :messageId AND mr.type = :type")
    long countByMessageIdAndType(@Param("messageId") Long messageId, @Param("type") ReactionType type);
}



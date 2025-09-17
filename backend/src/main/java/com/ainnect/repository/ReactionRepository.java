package com.ainnect.repository;

import com.ainnect.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {
	List<Reaction> findByTargetTypeAndTargetId(com.ainnect.common.enums.ReactionTargetType targetType, Long targetId);
	boolean existsByTargetTypeAndTargetIdAndUser_IdAndType(com.ainnect.common.enums.ReactionTargetType targetType, Long targetId, Long userId, com.ainnect.common.enums.ReactionType type);
}


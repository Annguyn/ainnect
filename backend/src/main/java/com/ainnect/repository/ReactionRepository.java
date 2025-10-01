package com.ainnect.repository;

import com.ainnect.common.enums.ReactionTargetType;
import com.ainnect.entity.Reaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {
	@EntityGraph(attributePaths = {"user"})
	List<Reaction> findByTargetTypeAndTargetId(ReactionTargetType targetType, Long targetId);
	
	@EntityGraph(attributePaths = {"user"})
	List<Reaction> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(ReactionTargetType targetType, Long targetId);
	
	@EntityGraph(attributePaths = {"user"})
	Page<Reaction> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(ReactionTargetType targetType, Long targetId, Pageable pageable);
	
	boolean existsByTargetTypeAndTargetIdAndUser_Id(ReactionTargetType targetType, Long targetId, Long userId);
	
	Optional<Reaction> findByTargetTypeAndTargetIdAndUser_Id(ReactionTargetType targetType, Long targetId, Long userId);
	
	@Query("SELECT r FROM Reaction r WHERE r.targetType = :targetType AND r.targetId = :targetId AND r.user.id = :userId ORDER BY r.createdAt DESC")
	List<Reaction> findAllByTargetTypeAndTargetIdAndUser_Id(@Param("targetType") ReactionTargetType targetType, @Param("targetId") Long targetId, @Param("userId") Long userId);
	
	@Query("SELECT r.type, COUNT(r) FROM Reaction r WHERE r.targetType = :targetType AND r.targetId = :targetId GROUP BY r.type")
	List<Object[]> countReactionsByType(@Param("targetType") ReactionTargetType targetType, @Param("targetId") Long targetId);
	
	long countByTargetTypeAndTargetId(ReactionTargetType targetType, Long targetId);
}


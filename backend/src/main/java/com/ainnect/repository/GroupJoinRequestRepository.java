package com.ainnect.repository;

import com.ainnect.common.enums.GroupJoinRequestStatus;
import com.ainnect.entity.GroupJoinRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupJoinRequestRepository extends JpaRepository<GroupJoinRequest, Long> {
	
	@EntityGraph(attributePaths = {"user", "group"})
	@Query("SELECT jr FROM GroupJoinRequest jr WHERE jr.group.id = :groupId AND jr.status = :status ORDER BY jr.createdAt DESC")
	Page<GroupJoinRequest> findByGroupIdAndStatus(@Param("groupId") Long groupId, @Param("status") GroupJoinRequestStatus status, Pageable pageable);
	
	@EntityGraph(attributePaths = {"user", "group"})
	@Query("SELECT jr FROM GroupJoinRequest jr WHERE jr.group.id = :groupId AND jr.user.id = :userId")
	Optional<GroupJoinRequest> findByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId);
	
	@EntityGraph(attributePaths = {"user", "group"})
	@Query("SELECT jr FROM GroupJoinRequest jr WHERE jr.user.id = :userId AND jr.status = :status ORDER BY jr.createdAt DESC")
	Page<GroupJoinRequest> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") GroupJoinRequestStatus status, Pageable pageable);
	
	boolean existsByGroupIdAndUserIdAndStatus(Long groupId, Long userId, GroupJoinRequestStatus status);
}


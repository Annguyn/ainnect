package com.ainnect.repository;

import com.ainnect.entity.User;
import com.ainnect.entity.UserBlock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBlockRepository extends JpaRepository<UserBlock, Long> {
	
	boolean existsByBlockerAndBlocked(User blocker, User blocked);
	
	Page<UserBlock> findByBlockerOrderByCreatedAtDesc(User blocker, Pageable pageable);
	
	List<UserBlock> findByBlocked(User blocked);
	
	Optional<UserBlock> findByBlockerAndBlocked(User blocker, User blocked);
	
	@Query("SELECT ub.blocked.id FROM UserBlock ub WHERE ub.blocker = :blocker")
	List<Long> findBlockedUserIdsByBlocker(@Param("blocker") User blocker);
	
	@Query("SELECT ub.blocker.id FROM UserBlock ub WHERE ub.blocked = :blocked")
	List<Long> findBlockerUserIdsByBlocked(@Param("blocked") User blocked);
	
	boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
}

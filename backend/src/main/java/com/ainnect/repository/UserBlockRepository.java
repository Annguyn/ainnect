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
	
	// Kiểm tra xem user A có block user B không
	boolean existsByBlockerAndBlocked(User blocker, User blocked);
	
	// Lấy danh sách người dùng bị block bởi một user
	Page<UserBlock> findByBlockerOrderByCreatedAtDesc(User blocker, Pageable pageable);
	
	// Lấy danh sách người dùng đã block một user cụ thể
	List<UserBlock> findByBlocked(User blocked);
	
	// Tìm block relationship giữa 2 user
	Optional<UserBlock> findByBlockerAndBlocked(User blocker, User blocked);
	
	// Lấy danh sách ID của những người bị block bởi user
	@Query("SELECT ub.blocked.id FROM UserBlock ub WHERE ub.blocker = :blocker")
	List<Long> findBlockedUserIdsByBlocker(@Param("blocker") User blocker);
	
	// Lấy danh sách ID của những người đã block user này
	@Query("SELECT ub.blocker.id FROM UserBlock ub WHERE ub.blocked = :blocked")
	List<Long> findBlockerUserIdsByBlocked(@Param("blocked") User blocked);
}

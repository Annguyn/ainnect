package com.ainnect.repository;

import com.ainnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
	@EntityGraph(attributePaths = {"userRoles", "userRoles.role"})
	Optional<User> findById(Long id);
	
	@EntityGraph(attributePaths = {"userRoles", "userRoles.role"})
	Optional<User> findByUsername(String username);
	
	Optional<User> findByEmail(String email);
	boolean existsByUsername(String username);
	boolean existsByEmail(String email);
	
	@EntityGraph(attributePaths = {"userRoles", "userRoles.role"})
	@Query("SELECT u FROM User u WHERE " +
		   "(LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
		   "LOWER(u.displayName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
		   "LOWER(u.bio) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
		   "u.deletedAt IS NULL")
	Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
	
	@EntityGraph(attributePaths = {"userRoles", "userRoles.role"})
	Page<User> findAllByOrderByCreatedAtDesc(Pageable pageable);
	
	@EntityGraph(attributePaths = {"userRoles", "userRoles.role"})
	Page<User> findByIsActiveOrderByCreatedAtDesc(Boolean isActive, Pageable pageable);
	
	@Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true AND u.deletedAt IS NULL")
	Long countActiveUsers();
	
	@Query("SELECT COUNT(u) FROM User u WHERE u.isActive = false AND u.deletedAt IS NULL")
	Long countInactiveUsers();
	
	@Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since AND u.deletedAt IS NULL")
	Long countNewUsersSince(@Param("since") LocalDateTime since);
	
	@Query("SELECT DATE(u.createdAt) as date, COUNT(u) as count FROM User u " +
		   "WHERE u.createdAt >= :since AND u.deletedAt IS NULL " +
		   "GROUP BY DATE(u.createdAt) " +
		   "ORDER BY DATE(u.createdAt)")
	java.util.List<Object[]> getUserGrowthStats(@Param("since") LocalDateTime since);
}

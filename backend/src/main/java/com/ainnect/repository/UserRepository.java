package com.ainnect.repository;

import com.ainnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByUsername(String username);
	Optional<User> findByEmail(String email);
	boolean existsByUsername(String username);
	boolean existsByEmail(String email);
	
	/**
	 * Search users by username, display name, or bio
	 */
	@Query("SELECT u FROM User u WHERE " +
		   "(LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
		   "LOWER(u.displayName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
		   "LOWER(u.bio) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
		   "u.deletedAt IS NULL")
	Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
}

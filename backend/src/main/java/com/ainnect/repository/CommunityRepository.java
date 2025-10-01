package com.ainnect.repository;

import com.ainnect.entity.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommunityRepository extends JpaRepository<Community, Long> {
	
	/**
	 * Search communities by name or description
	 */
	@Query("SELECT c FROM Community c WHERE " +
		   "(LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
		   "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
		   "c.deletedAt IS NULL")
	Page<Community> searchCommunities(@Param("keyword") String keyword, Pageable pageable);
	
	/**
	 * Get all active communities
	 */
	@Query("SELECT c FROM Community c WHERE c.deletedAt IS NULL ORDER BY c.createdAt DESC")
	Page<Community> findAllActiveCommunities(Pageable pageable);
	
	/**
	 * Get communities by owner
	 */
	@Query("SELECT c FROM Community c WHERE c.owner.id = :ownerId AND c.deletedAt IS NULL ORDER BY c.createdAt DESC")
	Page<Community> findByOwnerId(@Param("ownerId") Long ownerId, Pageable pageable);
	
	/**
	 * Get communities where user is a member
	 */
	@Query("SELECT c FROM Community c JOIN GroupMember gm ON c.id = gm.group.id WHERE gm.user.id = :userId AND c.deletedAt IS NULL ORDER BY c.createdAt DESC")
	Page<Community> findByMemberId(@Param("userId") Long userId, Pageable pageable);
}


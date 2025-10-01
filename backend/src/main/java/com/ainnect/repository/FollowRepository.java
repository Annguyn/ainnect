package com.ainnect.repository;

import com.ainnect.entity.Follow;
import com.ainnect.entity.FollowId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, FollowId> {
	List<Follow> findByFollower_Id(Long followerId);
	List<Follow> findByFollowee_Id(Long followeeId);
	boolean existsByFollowerIdAndFolloweeId(Long followerId, Long followeeId);
	
	// Additional methods for profile
	List<Follow> findByFollowee_IdOrderByCreatedAtDesc(Long followeeId);
	List<Follow> findByFollower_IdOrderByCreatedAtDesc(Long followerId);
	long countByFollowee_Id(Long followeeId);
	long countByFollower_Id(Long followerId);
}

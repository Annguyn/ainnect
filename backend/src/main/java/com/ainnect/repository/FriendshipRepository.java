package com.ainnect.repository;

import com.ainnect.common.enums.FriendshipStatus;
import com.ainnect.entity.Friendship;
import com.ainnect.entity.FriendshipId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendshipRepository extends JpaRepository<Friendship, FriendshipId> {
	List<Friendship> findByUserLow_IdOrUserHigh_Id(Long userIdLow, Long userIdHigh);
	boolean existsByUserLow_IdAndUserHigh_IdAndStatus(Long userIdLow, Long userIdHigh, FriendshipStatus status);
	
	// Additional methods for profile
	List<Friendship> findByUserLow_IdOrUserHigh_IdAndStatus(Long userId1, Long userId2, FriendshipStatus status);
	long countByUserLow_IdOrUserHigh_IdAndStatus(Long userId1, Long userId2, FriendshipStatus status);
}

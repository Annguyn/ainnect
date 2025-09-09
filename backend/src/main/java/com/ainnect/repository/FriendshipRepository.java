package com.ainnect.repository;

import com.ainnect.entity.Friendship;
import com.ainnect.entity.FriendshipId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendshipRepository extends JpaRepository<Friendship, FriendshipId> {
	List<Friendship> findByUserLow_IdOrUserHigh_Id(Long userIdLow, Long userIdHigh);
}

package com.ainnect.service;

import com.ainnect.entity.Friendship;

import java.util.List;

public interface FriendshipService {
	Friendship request(Long requesterId, Long otherUserId);
	Friendship accept(Long userIdA, Long userIdB);
	Friendship block(Long userIdA, Long userIdB);
	List<Friendship> listForUser(Long userId);
}

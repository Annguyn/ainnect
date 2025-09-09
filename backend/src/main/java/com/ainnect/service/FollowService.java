package com.ainnect.service;

import com.ainnect.entity.Follow;

import java.util.List;

public interface FollowService {
	Follow follow(Long followerId, Long followeeId);
	void unfollow(Long followerId, Long followeeId);
	List<Follow> followersOf(Long userId);
	List<Follow> followeesOf(Long userId);
}

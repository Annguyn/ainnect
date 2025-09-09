package com.ainnect.service.impl;

import com.ainnect.entity.*;
import com.ainnect.repository.FollowRepository;
import com.ainnect.repository.UserRepository;
import com.ainnect.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService {
	private final FollowRepository followRepository;
	private final UserRepository userRepository;

	@Override
	public Follow follow(Long followerId, Long followeeId) {
		if (followerId.equals(followeeId)) {
			throw new IllegalArgumentException("Cannot follow yourself");
		}
		FollowId id = new FollowId(followerId, followeeId);
		Follow entity = followRepository.findById(id).orElseGet(() -> {
			User follower = userRepository.findById(followerId).orElseThrow();
			User followee = userRepository.findById(followeeId).orElseThrow();
			Follow f = new Follow();
			f.setId(id);
			f.setFollower(follower);
			f.setFollowee(followee);
			f.setCreatedAt(LocalDateTime.now());
			return f;
		});
		return followRepository.save(entity);
	}

	@Override
	public void unfollow(Long followerId, Long followeeId) {
		followRepository.deleteById(new FollowId(followerId, followeeId));
	}

	@Override
	public List<Follow> followersOf(Long userId) {
		return followRepository.findByFollowee_Id(userId);
	}

	@Override
	public List<Follow> followeesOf(Long userId) {
		return followRepository.findByFollower_Id(userId);
	}
}

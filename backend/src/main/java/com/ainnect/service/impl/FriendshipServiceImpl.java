package com.ainnect.service.impl;

import com.ainnect.common.enums.FriendshipStatus;
import com.ainnect.entity.*;
import com.ainnect.repository.FriendshipRepository;
import com.ainnect.repository.UserRepository;
import com.ainnect.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendshipServiceImpl implements FriendshipService {
	private final FriendshipRepository friendshipRepository;
	private final UserRepository userRepository;

	@Override
	public Friendship request(Long requesterId, Long otherUserId) {
		if (requesterId.equals(otherUserId)) {
			throw new IllegalArgumentException("Cannot friend yourself");
		}
		Long low = Math.min(requesterId, otherUserId);
		Long high = Math.max(requesterId, otherUserId);
		FriendshipId id = new FriendshipId(low, high);
		User lowUser = userRepository.findById(low).orElseThrow();
		User highUser = userRepository.findById(high).orElseThrow();
		User requester = userRepository.findById(requesterId).orElseThrow();

		Friendship entity = friendshipRepository.findById(id).orElseGet(() -> {
			Friendship f = new Friendship();
			f.setId(id);
			f.setUserLow(lowUser);
			f.setUserHigh(highUser);
			f.setCreatedAt(LocalDateTime.now());
			return f;
		});
		entity.setRequestedBy(requester);
		entity.setStatus(FriendshipStatus.pending);
		entity.setUpdatedAt(LocalDateTime.now());
		entity.setRespondedAt(null);
		return friendshipRepository.save(entity);
	}

	@Override
	public Friendship accept(Long userIdA, Long userIdB) {
		Long low = Math.min(userIdA, userIdB);
		Long high = Math.max(userIdA, userIdB);
		Friendship entity = friendshipRepository.findById(new FriendshipId(low, high)).orElseThrow();
		entity.setStatus(FriendshipStatus.accepted);
		entity.setRespondedAt(LocalDateTime.now());
		entity.setUpdatedAt(LocalDateTime.now());
		return friendshipRepository.save(entity);
	}

	@Override
	public Friendship block(Long userIdA, Long userIdB) {
		Long low = Math.min(userIdA, userIdB);
		Long high = Math.max(userIdA, userIdB);
		Friendship entity = friendshipRepository.findById(new FriendshipId(low, high)).orElseGet(() -> {
			User lowUser = userRepository.findById(low).orElseThrow();
			User highUser = userRepository.findById(high).orElseThrow();
			Friendship f = new Friendship();
			f.setId(new FriendshipId(low, high));
			f.setUserLow(lowUser);
			f.setUserHigh(highUser);
			f.setCreatedAt(LocalDateTime.now());
			return f;
		});
		entity.setStatus(FriendshipStatus.blocked);
		entity.setUpdatedAt(LocalDateTime.now());
		return friendshipRepository.save(entity);
	}

	@Override
	public List<Friendship> listForUser(Long userId) {
		return friendshipRepository.findByUserLow_IdOrUserHigh_Id(userId, userId)
				.stream()
				.sorted(Comparator.comparing(Friendship::getUpdatedAt).reversed())
				.toList();
	}
}

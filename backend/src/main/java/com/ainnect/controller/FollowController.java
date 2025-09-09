package com.ainnect.controller;

import com.ainnect.dto.social.FollowDtos;
import com.ainnect.entity.Follow;
import com.ainnect.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {
	private final FollowService followService;

	@PostMapping
	public ResponseEntity<FollowDtos.FollowResponse> follow(@Validated @RequestBody FollowDtos.FollowRequest req) {
		Follow f = followService.follow(req.getFollowerId(), req.getFolloweeId());
		return ResponseEntity.ok(new FollowDtos.FollowResponse(
				f.getId().getFollowerId(),
				f.getId().getFolloweeId()
		));
	}

	@DeleteMapping
	public ResponseEntity<Void> unfollow(@RequestParam Long followerId, @RequestParam Long followeeId) {
		followService.unfollow(followerId, followeeId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/followers")
	public ResponseEntity<List<FollowDtos.FollowResponse>> followers(@RequestParam Long userId) {
		List<FollowDtos.FollowResponse> res = followService.followersOf(userId).stream()
				.map(f -> new FollowDtos.FollowResponse(f.getId().getFollowerId(), f.getId().getFolloweeId()))
				.collect(Collectors.toList());
		return ResponseEntity.ok(res);
	}

	@GetMapping("/followees")
	public ResponseEntity<List<FollowDtos.FollowResponse>> followees(@RequestParam Long userId) {
		List<FollowDtos.FollowResponse> res = followService.followeesOf(userId).stream()
				.map(f -> new FollowDtos.FollowResponse(f.getId().getFollowerId(), f.getId().getFolloweeId()))
				.collect(Collectors.toList());
		return ResponseEntity.ok(res);
	}
}

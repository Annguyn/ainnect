package com.ainnect.controller;

import com.ainnect.dto.social.FriendshipDtos;
import com.ainnect.entity.Friendship;
import com.ainnect.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friendships")
@RequiredArgsConstructor
public class FriendshipController {
	private final FriendshipService friendshipService;

	@PostMapping("/request")
	public ResponseEntity<FriendshipDtos.FriendshipResponse> request(@Validated @RequestBody FriendshipDtos.RequestFriendshipRequest req) {
		Friendship f = friendshipService.request(req.getRequesterId(), req.getOtherUserId());
		return ResponseEntity.ok(new FriendshipDtos.FriendshipResponse(
				f.getId().getUserIdLow(),
				f.getId().getUserIdHigh(),
				f.getStatus(),
				f.getRequestedBy().getId()
		));
	}

	@PostMapping("/accept")
	public ResponseEntity<FriendshipDtos.FriendshipResponse> accept(@RequestParam Long userIdA, @RequestParam Long userIdB) {
		Friendship f = friendshipService.accept(userIdA, userIdB);
		return ResponseEntity.ok(new FriendshipDtos.FriendshipResponse(
				f.getId().getUserIdLow(),
				f.getId().getUserIdHigh(),
				f.getStatus(),
				f.getRequestedBy().getId()
		));
	}

	@PostMapping("/block")
	public ResponseEntity<FriendshipDtos.FriendshipResponse> block(@RequestParam Long userIdA, @RequestParam Long userIdB) {
		Friendship f = friendshipService.block(userIdA, userIdB);
		return ResponseEntity.ok(new FriendshipDtos.FriendshipResponse(
				f.getId().getUserIdLow(),
				f.getId().getUserIdHigh(),
				f.getStatus(),
				f.getRequestedBy() != null ? f.getRequestedBy().getId() : null
		));
	}

	@GetMapping
	public ResponseEntity<List<FriendshipDtos.FriendshipResponse>> list(@RequestParam Long userId) {
		List<FriendshipDtos.FriendshipResponse> res = friendshipService.listForUser(userId).stream()
				.map(f -> new FriendshipDtos.FriendshipResponse(
						f.getId().getUserIdLow(),
						f.getId().getUserIdHigh(),
						f.getStatus(),
						f.getRequestedBy() != null ? f.getRequestedBy().getId() : null
				))
				.collect(Collectors.toList());
		return ResponseEntity.ok(res);
	}
}

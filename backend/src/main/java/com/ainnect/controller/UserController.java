package com.ainnect.controller;

import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;
import com.ainnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
	private final UserService userService;

	@PostMapping
	public ResponseEntity<UserDtos.Response> create(@Validated @RequestBody UserDtos.CreateRequest req) {
		User user = User.builder()
				.username(req.getUsername())
				.email(req.getEmail())
				.phone(req.getPhone())
				.passwordHash(req.getPassword())
				.displayName(req.getDisplayName())
				.avatarUrl(req.getAvatarUrl())
				.bio(req.getBio())
				.gender(req.getGender())
				.birthday(req.getBirthday())
				.location(req.getLocation())
				.build();
		User saved = userService.create(user);
		UserDtos.Response res = UserDtos.Response.builder()
				.id(saved.getId())
				.username(saved.getUsername())
				.email(saved.getEmail())
				.phone(saved.getPhone())
				.displayName(saved.getDisplayName())
				.avatarUrl(saved.getAvatarUrl())
				.bio(saved.getBio())
				.gender(saved.getGender())
				.birthday(saved.getBirthday())
				.location(saved.getLocation())
				.isActive(saved.getIsActive())
				.build();
		return ResponseEntity.ok(res);
	}

	@GetMapping("/{id}")
	public ResponseEntity<UserDtos.Response> get(@PathVariable Long id) {
		return userService.findById(id)
				.map(u -> ResponseEntity.ok(UserDtos.Response.builder()
						.id(u.getId())
						.username(u.getUsername())
						.email(u.getEmail())
						.phone(u.getPhone())
						.displayName(u.getDisplayName())
						.avatarUrl(u.getAvatarUrl())
						.bio(u.getBio())
						.gender(u.getGender())
						.birthday(u.getBirthday())
						.location(u.getLocation())
						.isActive(u.getIsActive())
						.build()))
				.orElseGet(() -> ResponseEntity.notFound().build());
	}
}

package com.ainnect.controller;

import com.ainnect.dto.session.SessionDtos;
import com.ainnect.entity.Session;
import com.ainnect.entity.User;
import com.ainnect.service.SessionService;
import com.ainnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {
	private final SessionService sessionService;
	private final UserService userService;

	@PostMapping
	public ResponseEntity<SessionDtos.Response> create(@Validated @RequestBody SessionDtos.CreateRequest req) {
		User user = userService.findById(req.getUserId()).orElseThrow();
		Session s = Session.builder()
				.user(user)
				.refreshTokenHash(req.getRefreshTokenHash())
				.userAgent(req.getUserAgent())
				.ip(req.getIp())
				.expiresAt(req.getExpiresAt())
				.build();
		Session saved = sessionService.create(s);
		return ResponseEntity.ok(SessionDtos.Response.builder()
				.id(saved.getId())
				.userId(saved.getUser().getId())
				.refreshTokenHash(saved.getRefreshTokenHash())
				.userAgent(saved.getUserAgent())
				.ip(saved.getIp())
				.expiresAt(saved.getExpiresAt())
				.build());
	}
}

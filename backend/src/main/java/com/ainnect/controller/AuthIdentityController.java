package com.ainnect.controller;

import com.ainnect.dto.auth.AuthIdentityDtos;
import com.ainnect.entity.AuthIdentity;
import com.ainnect.entity.User;
import com.ainnect.service.AuthIdentityService;
import com.ainnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth-identities")
@RequiredArgsConstructor
public class AuthIdentityController {
	private final AuthIdentityService authIdentityService;
	private final UserService userService;

	@PostMapping
	public ResponseEntity<AuthIdentityDtos.Response> create(@Validated @RequestBody AuthIdentityDtos.CreateRequest req) {
		User user = userService.findById(req.getUserId()).orElseThrow();
		AuthIdentity ai = AuthIdentity.builder()
				.user(user)
				.provider(req.getProvider())
				.providerUid(req.getProviderUid())
				.metaJson(req.getMetaJson())
				.build();
		AuthIdentity saved = authIdentityService.create(ai);
		return ResponseEntity.ok(AuthIdentityDtos.Response.builder()
				.id(saved.getId())
				.userId(saved.getUser().getId())
				.provider(saved.getProvider())
				.providerUid(saved.getProviderUid())
				.metaJson(saved.getMetaJson())
				.build());
	}
}

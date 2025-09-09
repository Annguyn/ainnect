package com.ainnect.controller;

import com.ainnect.dto.role.RoleDtos;
import com.ainnect.entity.Role;
import com.ainnect.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {
	private final RoleService roleService;

	@PostMapping
	public ResponseEntity<RoleDtos.Response> create(@Validated @RequestBody RoleDtos.CreateOrUpdateRequest req) {
		Role role = Role.builder().code(req.getCode()).name(req.getName()).build();
		Role saved = roleService.create(role);
		return ResponseEntity.ok(new RoleDtos.Response(saved.getId(), saved.getCode(), saved.getName()));
	}

	@GetMapping
	public ResponseEntity<List<RoleDtos.Response>> list() {
		List<RoleDtos.Response> res = roleService.findAll().stream()
				.map(r -> new RoleDtos.Response(r.getId(), r.getCode(), r.getName()))
				.collect(Collectors.toList());
		return ResponseEntity.ok(res);
	}
}

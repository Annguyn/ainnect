package com.ainnect.service.impl;

import com.ainnect.entity.Role;
import com.ainnect.repository.RoleRepository;
import com.ainnect.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
	private final RoleRepository roleRepository;

	@Override
	public Role create(Role role) {
		return roleRepository.save(role);
	}

	@Override
	public List<Role> findAll() {
		return roleRepository.findAll();
	}

	@Override
	public Optional<Role> findById(Short id) {
		return roleRepository.findById(id);
	}

	@Override
	public Optional<Role> findByCode(String code) {
		return roleRepository.findByCode(code);
	}
}

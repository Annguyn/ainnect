package com.ainnect.service;

import com.ainnect.entity.Role;

import java.util.List;
import java.util.Optional;

public interface RoleService {
	Role create(Role role);
	List<Role> findAll();
	Optional<Role> findById(Short id);
	Optional<Role> findByCode(String code);
}

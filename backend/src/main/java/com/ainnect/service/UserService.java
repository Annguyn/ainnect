package com.ainnect.service;

import com.ainnect.entity.User;

import java.util.Optional;

public interface UserService {
	User create(User user);
	Optional<User> findById(Long id);
	Optional<User> findByUsername(String username);
	Optional<User> findByEmail(String email);
}

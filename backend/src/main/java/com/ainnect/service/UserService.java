package com.ainnect.service;

import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;

import java.util.Optional;

public interface UserService {
    

    User createUser(UserDtos.CreateRequest request);
    

    Optional<User> findById(Long id);
    

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsernameOrEmail(String usernameOrEmail);
    
   
    UserDtos.Response updateUser(Long userId, UserDtos.UpdateRequest request);
    

    void changePassword(Long userId, UserDtos.ChangePasswordRequest request);
    

    void deactivateAccount(Long userId);

    void activateAccount(Long userId);
    

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}




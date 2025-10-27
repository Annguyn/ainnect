package com.ainnect.mapper;

import com.ainnect.dto.user.UserBasicInfoDto;
import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;

public interface UserMapper {
    
    /**
     * Convert CreateRequest DTO to User entity
     */
    User toEntity(UserDtos.CreateRequest request, PasswordEncoder passwordEncoder);
    
    /**
     * Convert User entity to Response DTO
     */
    UserDtos.Response toDto(User user);
    
    /**
     * Convert User entity to BasicInfo DTO
     */
    UserBasicInfoDto toBasicInfoDto(User user);
    
    /**
     * Update User entity with UpdateRequest DTO
     */
    void updateEntity(User user, UserDtos.UpdateRequest request);
}
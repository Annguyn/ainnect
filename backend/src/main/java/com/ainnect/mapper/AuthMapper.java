package com.ainnect.mapper;

import com.ainnect.dto.auth.AuthIdentityDtos;
import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;

public interface AuthMapper {
    
    /**
     * Convert RegisterRequest to CreateRequest for user creation
     */
    UserDtos.CreateRequest toCreateRequest(AuthIdentityDtos.RegisterRequest registerRequest);
    
    /**
     * Build UserInfo from User entity
     */
    AuthIdentityDtos.UserInfo buildUserInfo(User user);
}
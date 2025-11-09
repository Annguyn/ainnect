package com.ainnect.mapper;

import com.ainnect.dto.auth.AuthIdentityDtos;
import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;

public interface AuthMapper {
    
   
    UserDtos.CreateRequest toCreateRequest(AuthIdentityDtos.RegisterRequest registerRequest);
    

    AuthIdentityDtos.UserInfo buildUserInfo(User user);
}
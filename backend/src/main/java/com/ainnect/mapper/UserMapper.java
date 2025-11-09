package com.ainnect.mapper;

import com.ainnect.dto.user.UserBasicInfoDto;
import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;

public interface UserMapper {
    
  
    User toEntity(UserDtos.CreateRequest request, PasswordEncoder passwordEncoder);
    
 
    UserDtos.Response toDto(User user);
    

    UserBasicInfoDto toBasicInfoDto(User user);
    
   
    void updateEntity(User user, UserDtos.UpdateRequest request);
}
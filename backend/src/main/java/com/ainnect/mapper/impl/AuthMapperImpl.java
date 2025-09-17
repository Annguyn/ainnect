package com.ainnect.mapper.impl;

import com.ainnect.dto.auth.AuthIdentityDtos;
import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;
import com.ainnect.mapper.AuthMapper;
import org.springframework.stereotype.Component;

@Component
public class AuthMapperImpl implements AuthMapper {

    @Override
    public UserDtos.CreateRequest toCreateRequest(AuthIdentityDtos.RegisterRequest registerRequest) {
        UserDtos.CreateRequest createRequest = new UserDtos.CreateRequest();
        
        try {
            setField(createRequest, "username", getField(registerRequest, "username"));
            setField(createRequest, "email", getField(registerRequest, "email"));
            setField(createRequest, "phone", getField(registerRequest, "phone"));
            setField(createRequest, "password", getField(registerRequest, "password"));
            setField(createRequest, "displayName", getField(registerRequest, "displayName"));
        } catch (Exception e) {
            throw new RuntimeException("Error mapping RegisterRequest to CreateRequest", e);
        }
        
        return createRequest;
    }

    @Override
    public AuthIdentityDtos.UserInfo buildUserInfo(User user) {
        try {
            return AuthIdentityDtos.UserInfo.builder()
                    .id(getUserId(user))
                    .username(getUserUsername(user))
                    .email(getUserEmail(user))
                    .displayName(getUserDisplayName(user))
                    .avatarUrl(getUserAvatarUrl(user))
                    .isActive(getUserIsActive(user))
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error building UserInfo from User entity", e);
        }
    }
    
    private Object getField(Object obj, String fieldName) throws Exception {
        java.lang.reflect.Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        return field.get(obj);
    }
    
    private void setField(Object obj, String fieldName, Object value) throws Exception {
        java.lang.reflect.Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }
    
    private Long getUserId(User user) {
        try {
            java.lang.reflect.Field field = user.getClass().getDeclaredField("id");
            field.setAccessible(true);
            return (Long) field.get(user);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getUserUsername(User user) {
        try {
            java.lang.reflect.Field field = user.getClass().getDeclaredField("username");
            field.setAccessible(true);
            return (String) field.get(user);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getUserEmail(User user) {
        try {
            java.lang.reflect.Field field = user.getClass().getDeclaredField("email");
            field.setAccessible(true);
            return (String) field.get(user);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getUserDisplayName(User user) {
        try {
            java.lang.reflect.Field field = user.getClass().getDeclaredField("displayName");
            field.setAccessible(true);
            return (String) field.get(user);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getUserAvatarUrl(User user) {
        try {
            java.lang.reflect.Field field = user.getClass().getDeclaredField("avatarUrl");
            field.setAccessible(true);
            return (String) field.get(user);
        } catch (Exception e) {
            return null;
        }
    }
    
    private Boolean getUserIsActive(User user) {
        try {
            java.lang.reflect.Field field = user.getClass().getDeclaredField("isActive");
            field.setAccessible(true);
            return (Boolean) field.get(user);
        } catch (Exception e) {
            return null;
        }
    }
}
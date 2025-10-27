package com.ainnect.mapper.impl;

import com.ainnect.dto.user.UserBasicInfoDto;
import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;
import com.ainnect.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(UserDtos.CreateRequest request, PasswordEncoder passwordEncoder) {

        
        return User.builder()
                .username(getUsername(request))
                .email(getEmail(request))
                .phone(getPhone(request))
                .passwordHash(passwordEncoder.encode(getPassword(request)))
                .displayName(getDisplayName(request))
                .avatarUrl(getAvatarUrl(request))
                .coverUrl(getCoverUrl(request))
                .bio(getBio(request))
                .gender(getGender(request))
                .birthday(getBirthday(request))
                .location(getLocation(request))
                .isActive(true)
                .build();
    }

    @Override
    public UserDtos.Response toDto(User user) {
        return UserDtos.Response.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .coverUrl(user.getCoverUrl())
                .bio(user.getBio())
                .gender(user.getGender())
                .birthday(user.getBirthday())
                .location(user.getLocation())
                .isActive(user.getIsActive())
                .build();
    }

    @Override
    public UserBasicInfoDto toBasicInfoDto(User user) {
        return new UserBasicInfoDto(
            user.getId(),
            user.getUsername(),
            user.getDisplayName() != null ? user.getDisplayName().split(" ")[0] : null,
            user.getDisplayName() != null && user.getDisplayName().split(" ").length > 1 ? 
                user.getDisplayName().substring(user.getDisplayName().indexOf(" ") + 1) : null,
            user.getAvatarUrl(),
            user.getEmail()
        );
    }

    @Override
    public void updateEntity(User user, UserDtos.UpdateRequest request) {
        if (getDisplayNameFromUpdate(request) != null) {
            user.setDisplayName(getDisplayNameFromUpdate(request));
        }
        if (getPhoneFromUpdate(request) != null) {
            user.setPhone(getPhoneFromUpdate(request));
        }
        if (getAvatarUrlFromUpdate(request) != null) {
            user.setAvatarUrl(getAvatarUrlFromUpdate(request));
        }
        if (getCoverUrlFromUpdate(request) != null) {
            user.setCoverUrl(getCoverUrlFromUpdate(request));
        }
        if (getBioFromUpdate(request) != null) {
            user.setBio(getBioFromUpdate(request));
        }
        if (getGenderFromUpdate(request) != null) {
            user.setGender(getGenderFromUpdate(request));
        }
        if (getBirthdayFromUpdate(request) != null) {
            user.setBirthday(getBirthdayFromUpdate(request));
        }
        if (getLocationFromUpdate(request) != null) {
            user.setLocation(getLocationFromUpdate(request));
        }
    }
    
    // Helper methods using reflection to access fields
    private String getUsername(UserDtos.CreateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("username");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getEmail(UserDtos.CreateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("email");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getPhone(UserDtos.CreateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("phone");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getPassword(UserDtos.CreateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("password");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getDisplayName(UserDtos.CreateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("displayName");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getAvatarUrl(UserDtos.CreateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("avatarUrl");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getCoverUrl(UserDtos.CreateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("coverUrl");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getBio(UserDtos.CreateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("bio");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private com.ainnect.common.enums.Gender getGender(UserDtos.CreateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("gender");
            field.setAccessible(true);
            return (com.ainnect.common.enums.Gender) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private java.time.LocalDate getBirthday(UserDtos.CreateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("birthday");
            field.setAccessible(true);
            return (java.time.LocalDate) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getLocation(UserDtos.CreateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("location");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    // Helper methods for UpdateRequest
    private String getDisplayNameFromUpdate(UserDtos.UpdateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("displayName");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getPhoneFromUpdate(UserDtos.UpdateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("phone");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getAvatarUrlFromUpdate(UserDtos.UpdateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("avatarUrl");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getCoverUrlFromUpdate(UserDtos.UpdateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("coverUrl");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getBioFromUpdate(UserDtos.UpdateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("bio");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private com.ainnect.common.enums.Gender getGenderFromUpdate(UserDtos.UpdateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("gender");
            field.setAccessible(true);
            return (com.ainnect.common.enums.Gender) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private java.time.LocalDate getBirthdayFromUpdate(UserDtos.UpdateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("birthday");
            field.setAccessible(true);
            return (java.time.LocalDate) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getLocationFromUpdate(UserDtos.UpdateRequest request) {
        try {
            java.lang.reflect.Field field = request.getClass().getDeclaredField("location");
            field.setAccessible(true);
            return (String) field.get(request);
        } catch (Exception e) {
            return null;
        }
    }
}
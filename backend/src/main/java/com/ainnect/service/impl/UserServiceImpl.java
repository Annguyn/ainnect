package com.ainnect.service.impl;

import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;
import com.ainnect.mapper.UserMapper;
import com.ainnect.repository.UserRepository;
import com.ainnect.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public User createUser(UserDtos.CreateRequest request) {
        String username = getFieldValue(request, "username", String.class);
        String email = getFieldValue(request, "email", String.class);
        if (email != null) {
            email = email.trim().toLowerCase(java.util.Locale.ROOT);
        }
        
        if (existsByUsername(username)) {
            throw new RuntimeException("Username đã tồn tại: " + username);
        }
        if (existsByEmail(email)) {
            throw new RuntimeException("Email đã tồn tại: " + email);
        }

        User user = userMapper.toEntity(request, passwordEncoder);
        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        String input = usernameOrEmail == null ? null : usernameOrEmail.trim();
        if (input != null && input.contains("@")) {
            return findByEmail(input.toLowerCase(java.util.Locale.ROOT));
        } else {
            return findByUsername(input);
        }
    }

    @Override
    public UserDtos.Response updateUser(Long userId, UserDtos.UpdateRequest request) {
        User user = findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + userId));

        userMapper.updateEntity(user, request);

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    public void changePassword(Long userId, UserDtos.ChangePasswordRequest request) {
        User user = findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + userId));

        String oldPassword = getFieldValue(request, "oldPassword", String.class);
        String userPasswordHash = getFieldValue(user, "passwordHash", String.class);
        
        if (!passwordEncoder.matches(oldPassword, userPasswordHash)) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }

        String newPassword = getFieldValue(request, "newPassword", String.class);
        String confirmPassword = getFieldValue(request, "confirmPassword", String.class);
        
        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        setFieldValue(user, "passwordHash", passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public void deactivateAccount(Long userId) {
        User user = findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + userId));

        setFieldValue(user, "isActive", false);
        setFieldValue(user, "deletedAt", LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    public void activateAccount(Long userId) {
        User user = findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + userId));

        setFieldValue(user, "isActive", true);
        setFieldValue(user, "deletedAt", null);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    
    @SuppressWarnings("unchecked")
    private <T> T getFieldValue(Object obj, String fieldName, Class<T> type) {
        try {
            java.lang.reflect.Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return (T) field.get(obj);
        } catch (Exception e) {
            return null;
        }
    }
    
    private void setFieldValue(Object obj, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (Exception e) {
            throw new RuntimeException("Error setting field " + fieldName, e);
        }
    }
}




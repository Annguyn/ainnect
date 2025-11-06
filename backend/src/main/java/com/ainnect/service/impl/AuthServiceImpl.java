package com.ainnect.service.impl;

import com.ainnect.config.JwtAuthenticationFilter;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.auth.AuthIdentityDtos;
import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;
import com.ainnect.mapper.AuthMapper;
import com.ainnect.service.AuthService;
import com.ainnect.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthMapper authMapper;

    @Override
    public AuthIdentityDtos.AuthResponse register(AuthIdentityDtos.RegisterRequest request) {
        UserDtos.CreateRequest createRequest = authMapper.toCreateRequest(request);

        User user = userService.createUser(createRequest);

        String accessToken = jwtUtil.generateToken(getUserUsername(user), getUserId(user));
        String refreshToken = jwtUtil.generateRefreshToken(getUserUsername(user), getUserId(user));

        return AuthIdentityDtos.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .userInfo(authMapper.buildUserInfo(user))
                .build();
    }

    @Override
    public AuthIdentityDtos.AuthResponse login(AuthIdentityDtos.LoginRequest request) {
        String identifier = request.getUsernameOrEmail();
        if (identifier != null && identifier.contains("@")) {
            identifier = identifier.trim().toLowerCase(java.util.Locale.ROOT);
        }
        User user = userService.findByUsernameOrEmail(identifier)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        if (!user.getIsActive()) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }

        String rawPassword = request.getPassword();
        boolean primaryMatch = passwordEncoder.matches(rawPassword, user.getPasswordHash());
        if (!primaryMatch) {
            String inverted = invertCase(rawPassword);
            if (!passwordEncoder.matches(inverted, user.getPasswordHash())) {
                throw new RuntimeException("Mật khẩu không đúng");
            }
        }

        String accessToken = jwtUtil.generateToken(user.getUsername(), user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername(), user.getId());

        return AuthIdentityDtos.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .userInfo(authMapper.buildUserInfo(user))
                .build();
    }

    private String invertCase(String input) {
        if (input == null) return null;
        StringBuilder sb = new StringBuilder(input.length());
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (Character.isUpperCase(c)) {
                sb.append(Character.toLowerCase(c));
            } else if (Character.isLowerCase(c)) {
                sb.append(Character.toUpperCase(c));
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    @Override
    public AuthIdentityDtos.AuthResponse refreshToken(String refreshToken) {
        try {
            if (JwtAuthenticationFilter.isBlacklisted(refreshToken)) {
                throw new RuntimeException("Token đã bị vô hiệu hóa");
            }

            if (!jwtUtil.isRefreshToken(refreshToken)) {
                throw new RuntimeException("Token không hợp lệ");
            }

            String username = jwtUtil.extractUsername(refreshToken);
            Long userId = jwtUtil.extractUserId(refreshToken);

            if (!jwtUtil.validateToken(refreshToken, username)) {
                throw new RuntimeException("Token đã hết hạn hoặc không hợp lệ");
            }

            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

            if (!user.getIsActive()) {
                throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
            }

            String newAccessToken = jwtUtil.generateToken(username, userId);
            String newRefreshToken = jwtUtil.generateRefreshToken(username, userId);

            JwtAuthenticationFilter.addToBlacklist(refreshToken);

            return AuthIdentityDtos.AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400L)
                    .userInfo(authMapper.buildUserInfo(user))
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Token không hợp lệ: " + e.getMessage());
        }
    }

    @Override
    public void logout(String token) {
        if (token != null && !token.isEmpty()) {
            JwtAuthenticationFilter.addToBlacklist(token);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        try {
            if (JwtAuthenticationFilter.isBlacklisted(token)) {
                return false;
            }

            String username = jwtUtil.extractUsername(token);
            return jwtUtil.validateToken(token, username);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AuthIdentityDtos.UserInfo getUserInfoFromToken(String token) {
        try {
            if (JwtAuthenticationFilter.isBlacklisted(token)) {
                throw new RuntimeException("Token đã bị vô hiệu hóa");
            }

            String username = jwtUtil.extractUsername(token);
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

            return authMapper.buildUserInfo(user);
        } catch (Exception e) {
            throw new RuntimeException("Token không hợp lệ: " + e.getMessage());
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
    
    private Long getUserId(User user) {
        try {
            java.lang.reflect.Field field = user.getClass().getDeclaredField("id");
            field.setAccessible(true);
            return (Long) field.get(user);
        } catch (Exception e) {
            return null;
        }
    }
}

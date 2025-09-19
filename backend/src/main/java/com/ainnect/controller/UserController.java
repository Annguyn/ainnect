package com.ainnect.controller;

import com.ainnect.config.JwtUtil;
import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;
import com.ainnect.mapper.UserMapper;
import com.ainnect.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "API quản lý thông tin người dùng")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public UserController(UserService userService, JwtUtil jwtUtil, UserMapper userMapper) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    @GetMapping("/profile")
    @Operation(summary = "Xem thông tin cá nhân")
    public ResponseEntity<UserDtos.Response> getProfile(
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
            
            UserDtos.Response response = userMapper.toDto(user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Không thể lấy thông tin cá nhân: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem thông tin user theo ID")
    public ResponseEntity<UserDtos.Response> getUserById(@PathVariable("id") Long id) {
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + id));
            
            UserDtos.Response response = userMapper.toDto(user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Không thể lấy thông tin user: " + e.getMessage());
        }
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật thông tin cá nhân")
    public ResponseEntity<UserDtos.Response> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UserDtos.UpdateRequest request) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            UserDtos.Response response = userService.updateUser(userId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Cập nhật thông tin thất bại: " + e.getMessage());
        }
    }

    @PutMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu")
    public ResponseEntity<String> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UserDtos.ChangePasswordRequest request) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            userService.changePassword(userId, request);
            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (Exception e) {
            throw new RuntimeException("Đổi mật khẩu thất bại: " + e.getMessage());
        }
    }

    @PutMapping("/deactivate")
    @Operation(summary = "Vô hiệu hóa tài khoản")
    public ResponseEntity<String> deactivateAccount(
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            userService.deactivateAccount(userId);
            return ResponseEntity.ok("Vô hiệu hóa tài khoản thành công");
        } catch (Exception e) {
            throw new RuntimeException("Vô hiệu hóa tài khoản thất bại: " + e.getMessage());
        }
    }

    @PutMapping("/activate")
    @Operation(summary = "Kích hoạt tài khoản")
    public ResponseEntity<String> activateAccount(
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            userService.activateAccount(userId);
            return ResponseEntity.ok("Kích hoạt tài khoản thành công");
        } catch (Exception e) {
            throw new RuntimeException("Kích hoạt tài khoản thất bại: " + e.getMessage());
        }
    }

    @GetMapping("/check-username/{username}")
    @Operation(summary = "Kiểm tra username có tồn tại không")
    public ResponseEntity<Boolean> checkUsernameExists(@PathVariable("username") String username) {
        boolean exists = userService.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/check-email/{email}")
    @Operation(summary = "Kiểm tra email có tồn tại không")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable("email") String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Token không hợp lệ");
    }
}




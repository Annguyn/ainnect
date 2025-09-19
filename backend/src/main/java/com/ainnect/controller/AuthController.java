package com.ainnect.controller;

import com.ainnect.dto.auth.AuthIdentityDtos;
import com.ainnect.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API xác thực người dùng")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthIdentityDtos.AuthResponse> register(
            @Valid @RequestBody AuthIdentityDtos.RegisterRequest request) {
        try {
            AuthIdentityDtos.AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            throw new RuntimeException("Đăng ký thất bại: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthIdentityDtos.AuthResponse> login(
            @Valid @RequestBody AuthIdentityDtos.LoginRequest request) {
        try {
            AuthIdentityDtos.AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Đăng nhập thất bại: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthIdentityDtos.AuthResponse> refreshToken(
            @RequestParam("refreshToken") String refreshToken) {
        try {
            AuthIdentityDtos.AuthResponse response = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Làm mới token thất bại: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất")
    public ResponseEntity<String> logout(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            authService.logout(token);
            return ResponseEntity.ok("Đăng xuất thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Đăng xuất thất bại: " + e.getMessage());
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            boolean isValid = authService.validateToken(token);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthIdentityDtos.UserInfo> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            AuthIdentityDtos.UserInfo userInfo = authService.getUserInfoFromToken(token);
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            throw new RuntimeException("Không thể lấy thông tin user: " + e.getMessage());
        }
    }

    private String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new RuntimeException("Token không hợp lệ");
    }
}

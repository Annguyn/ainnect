package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.user.UserDtos;
import com.ainnect.entity.User;
import com.ainnect.mapper.UserMapper;
import com.ainnect.service.FileStorageService;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "API quản lý thông tin người dùng")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final FileStorageService fileStorageService;

    public UserController(UserService userService, JwtUtil jwtUtil, UserMapper userMapper, FileStorageService fileStorageService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
        this.fileStorageService = fileStorageService;
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

    @PutMapping(value = "/profile", consumes = "multipart/form-data")
    @Operation(summary = "Cập nhật thông tin cá nhân với form data")
    public ResponseEntity<ApiResponse<UserDtos.Response>> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "displayName", required = false) String displayName,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "birthday", required = false) String birthday,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            @RequestParam(value = "cover", required = false) MultipartFile cover) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            UserDtos.UpdateRequest request = new UserDtos.UpdateRequest();
            request.setDisplayName(displayName);
            request.setPhone(phone);
            request.setBio(bio);
            if (gender != null && !gender.isEmpty()) {
                request.setGender(com.ainnect.common.enums.Gender.valueOf(gender));
            }
            if (birthday != null && !birthday.isEmpty()) {
                request.setBirthday(java.time.LocalDate.parse(birthday));
            }
            request.setLocation(location);
            
            // Handle avatar upload if provided
            if (avatar != null && !avatar.isEmpty()) {
                String avatarUrl = fileStorageService.storeAvatarFile(avatar, userId);
                request.setAvatarUrl(avatarUrl);
            }
            
            // Handle cover image upload if provided
            if (cover != null && !cover.isEmpty()) {
                String coverUrl = fileStorageService.storeCoverFile(cover, userId);
                request.setCoverUrl(coverUrl);
            }
            
            UserDtos.Response response = userService.updateUser(userId, request);
            ApiResponse<UserDtos.Response> apiResponse = new ApiResponse<>("SUCCESS", "Cập nhật thông tin thành công", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<UserDtos.Response> response = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            ApiResponse<UserDtos.Response> response = new ApiResponse<>("ERROR", "Cập nhật thông tin thất bại: " + e.getMessage(), null);
            return ResponseEntity.status(500).body(response);
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

    @PostMapping("/upload-avatar")
    @Operation(summary = "Upload avatar")
    public ResponseEntity<ApiResponse<UserDtos.Response>> uploadAvatar(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("avatar") MultipartFile file) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            // Upload file và lấy URL
            String avatarUrl = fileStorageService.storeAvatarFile(file, userId);
            
            // Cập nhật avatar URL trong database
            UserDtos.UpdateRequest updateRequest = new UserDtos.UpdateRequest();
            updateRequest.setAvatarUrl(avatarUrl);
            UserDtos.Response response = userService.updateUser(userId, updateRequest);
            
            ApiResponse<UserDtos.Response> apiResponse = new ApiResponse<>("SUCCESS", "Upload avatar thành công", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<UserDtos.Response> response = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            ApiResponse<UserDtos.Response> response = new ApiResponse<>("ERROR", "Upload avatar thất bại: " + e.getMessage(), null);
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/upload-cover")
    @Operation(summary = "Upload cover image")
    public ResponseEntity<ApiResponse<UserDtos.Response>> uploadCover(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("cover") MultipartFile file) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            // Upload file và lấy URL
            String coverUrl = fileStorageService.storeCoverFile(file, userId);
            
            // Cập nhật cover URL trong database
            UserDtos.UpdateRequest updateRequest = new UserDtos.UpdateRequest();
            updateRequest.setCoverUrl(coverUrl);
            UserDtos.Response response = userService.updateUser(userId, updateRequest);
            
            ApiResponse<UserDtos.Response> apiResponse = new ApiResponse<>("SUCCESS", "Upload cover thành công", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<UserDtos.Response> response = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            ApiResponse<UserDtos.Response> response = new ApiResponse<>("ERROR", "Upload cover thất bại: " + e.getMessage(), null);
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping(value = "/profile", consumes = "multipart/form-data")
    @Operation(summary = "Tạo profile với form data")
    public ResponseEntity<ApiResponse<UserDtos.Response>> createProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "displayName", required = false) String displayName,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "birthday", required = false) String birthday,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            @RequestParam(value = "cover", required = false) MultipartFile cover) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            UserDtos.UpdateRequest request = new UserDtos.UpdateRequest();
            request.setDisplayName(displayName);
            request.setPhone(phone);
            request.setBio(bio);
            if (gender != null && !gender.isEmpty()) {
                request.setGender(com.ainnect.common.enums.Gender.valueOf(gender));
            }
            if (birthday != null && !birthday.isEmpty()) {
                request.setBirthday(java.time.LocalDate.parse(birthday));
            }
            request.setLocation(location);
            
            // Handle avatar upload if provided
            if (avatar != null && !avatar.isEmpty()) {
                String avatarUrl = fileStorageService.storeAvatarFile(avatar, userId);
                request.setAvatarUrl(avatarUrl);
            }
            
            // Handle cover image upload if provided
            if (cover != null && !cover.isEmpty()) {
                String coverUrl = fileStorageService.storeCoverFile(cover, userId);
                request.setCoverUrl(coverUrl);
            }
            
            UserDtos.Response response = userService.updateUser(userId, request);
            ApiResponse<UserDtos.Response> apiResponse = new ApiResponse<>("SUCCESS", "Tạo profile thành công", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<UserDtos.Response> response = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            ApiResponse<UserDtos.Response> response = new ApiResponse<>("ERROR", "Tạo profile thất bại: " + e.getMessage(), null);
            return ResponseEntity.status(500).body(response);
        }
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Token không hợp lệ");
    }
}




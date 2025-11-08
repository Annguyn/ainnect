package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.apkversion.ApkVersionDtos;
import com.ainnect.service.ApkVersionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/apk-versions")
@Slf4j
public class ApkVersionController {
    
    @Autowired
    private ApkVersionService apkVersionService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ApkVersionDtos.Response>> createVersion(
            @Valid @RequestBody ApkVersionDtos.CreateRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long adminId = getAdminIdFromRequest(httpRequest);
            ApkVersionDtos.Response response = apkVersionService.createVersion(request, adminId);
            return ResponseEntity.ok(ApiResponse.<ApkVersionDtos.Response>builder()
                    .result("SUCCESS")
                    .message("APK version created successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error creating APK version: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ApkVersionDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to create APK version: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    @PutMapping("/{versionId}")
    public ResponseEntity<ApiResponse<ApkVersionDtos.Response>> updateVersion(
            @PathVariable Long versionId,
            @Valid @RequestBody ApkVersionDtos.UpdateRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long adminId = getAdminIdFromRequest(httpRequest);
            ApkVersionDtos.Response response = apkVersionService.updateVersion(versionId, request, adminId);
            return ResponseEntity.ok(ApiResponse.<ApkVersionDtos.Response>builder()
                    .result("SUCCESS")
                    .message("APK version updated successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error updating APK version: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ApkVersionDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to update APK version: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    @DeleteMapping("/{versionId}")
    public ResponseEntity<ApiResponse<String>> deleteVersion(
            @PathVariable Long versionId,
            HttpServletRequest httpRequest) {
        try {
            Long adminId = getAdminIdFromRequest(httpRequest);
            apkVersionService.deleteVersion(versionId, adminId);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .result("SUCCESS")
                    .message("APK version deleted successfully")
                    .data("Deleted")
                    .build());
        } catch (Exception e) {
            log.error("Error deleting APK version: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                    .result("ERROR")
                    .message("Failed to delete APK version: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    @GetMapping("/{versionId}")
    public ResponseEntity<ApiResponse<ApkVersionDtos.Response>> getVersionById(
            @PathVariable Long versionId) {
        try {
            ApkVersionDtos.Response response = apkVersionService.getVersionById(versionId);
            return ResponseEntity.ok(ApiResponse.<ApkVersionDtos.Response>builder()
                    .result("SUCCESS")
                    .message("APK version retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting APK version: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ApkVersionDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to get APK version: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<ApkVersionDtos.Response>> getActiveVersion() {
        try {
            ApkVersionDtos.Response response = apkVersionService.getActiveVersion();
            return ResponseEntity.ok(ApiResponse.<ApkVersionDtos.Response>builder()
                    .result("SUCCESS")
                    .message("Active APK version retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting active APK version: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ApkVersionDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to get active APK version: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ApkVersionDtos.Response>>> getAllVersions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ApkVersionDtos.Response> response = apkVersionService.getAllVersions(pageable);
            return ResponseEntity.ok(ApiResponse.<Page<ApkVersionDtos.Response>>builder()
                    .result("SUCCESS")
                    .message("APK versions retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting APK versions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Page<ApkVersionDtos.Response>>builder()
                    .result("ERROR")
                    .message("Failed to get APK versions: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    @PutMapping("/{versionId}/activate")
    public ResponseEntity<ApiResponse<String>> setActiveVersion(
            @PathVariable Long versionId,
            HttpServletRequest httpRequest) {
        try {
            Long adminId = getAdminIdFromRequest(httpRequest);
            apkVersionService.setActiveVersion(versionId, adminId);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .result("SUCCESS")
                    .message("APK version set as active successfully")
                    .data("Activated")
                    .build());
        } catch (Exception e) {
            log.error("Error setting active APK version: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                    .result("ERROR")
                    .message("Failed to set active APK version: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    private Long getAdminIdFromRequest(HttpServletRequest request) {
        Long userId = jwtUtil.getUserIdFromToken(request);
        if (userId == null) {
            throw new IllegalArgumentException("Invalid or missing Authorization header");
        }
        return userId;
    }
}


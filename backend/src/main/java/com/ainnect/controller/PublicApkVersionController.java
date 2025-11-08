package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.dto.apkversion.ApkVersionDtos;
import com.ainnect.service.ApkVersionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/apk-versions")
@Slf4j
public class PublicApkVersionController {
    
    @Autowired
    private ApkVersionService apkVersionService;
    
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
}


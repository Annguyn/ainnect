package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.qrlogin.QRLoginDtos;
import com.ainnect.service.QRLoginService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr-login")
@Slf4j
public class QRLoginController {
    
    @Autowired
    private QRLoginService qrLoginService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<QRLoginDtos.QRCodeResponse>> generateQRCode() {
        try {
            QRLoginDtos.QRCodeResponse response = qrLoginService.generateQRCode();
            return ResponseEntity.ok(ApiResponse.<QRLoginDtos.QRCodeResponse>builder()
                    .result("SUCCESS")
                    .message("QR code generated successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error generating QR code: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<QRLoginDtos.QRCodeResponse>builder()
                    .result("ERROR")
                    .message("Failed to generate QR code: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<QRLoginDtos.QRSessionInfo>> getSessionInfo(
            @PathVariable String sessionId,
            HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            QRLoginDtos.QRSessionInfo response = qrLoginService.getSessionInfo(sessionId, userId);
            return ResponseEntity.ok(ApiResponse.<QRLoginDtos.QRSessionInfo>builder()
                    .result("SUCCESS")
                    .message("Session info retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting session info: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<QRLoginDtos.QRSessionInfo>builder()
                    .result("ERROR")
                    .message("Failed to get session info: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<String>> confirmLogin(
            @RequestBody QRLoginDtos.ConfirmLoginRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            qrLoginService.confirmLogin(request.getSessionId(), userId);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .result("SUCCESS")
                    .message("Login confirmed successfully")
                    .data("Login confirmed")
                    .build());
        } catch (Exception e) {
            log.error("Error confirming login: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                    .result("ERROR")
                    .message("Failed to confirm login: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    @GetMapping("/status/{sessionId}")
    public ResponseEntity<ApiResponse<QRLoginDtos.QRLoginStatusResponse>> checkLoginStatus(
            @PathVariable String sessionId) {
        try {
            QRLoginDtos.QRLoginStatusResponse response = qrLoginService.checkLoginStatus(sessionId);
            return ResponseEntity.ok(ApiResponse.<QRLoginDtos.QRLoginStatusResponse>builder()
                    .result("SUCCESS")
                    .message("Login status retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error checking login status: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<QRLoginDtos.QRLoginStatusResponse>builder()
                    .result("ERROR")
                    .message("Failed to check login status: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    private Long getUserIdFromRequest(HttpServletRequest request) {
        Long userId = jwtUtil.getUserIdFromToken(request);
        if (userId == null) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        return userId;
    }
}


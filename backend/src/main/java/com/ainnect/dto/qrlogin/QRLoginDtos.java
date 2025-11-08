package com.ainnect.dto.qrlogin;

import com.ainnect.common.enums.QRCodeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class QRLoginDtos {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QRCodeResponse {
        private String sessionId;
        private String qrCodeData;
        private String qrCodeImage;
        private LocalDateTime expiresAt;
        private Integer expiresInSeconds;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QRSessionInfo {
        private String sessionId;
        private QRCodeStatus status;
        private UserInfo user;
        private LocalDateTime expiresAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long userId;
        private String username;
        private String fullName;
        private String avatarUrl;
        private String email;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfirmLoginRequest {
        private String sessionId;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QRLoginStatusResponse {
        private QRCodeStatus status;
        private String token;
        private UserInfo user;
    }
}


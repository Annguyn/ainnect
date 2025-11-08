package com.ainnect.dto.apkversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ApkVersionDtos {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String versionName;
        private Integer versionCode;
        private String apkUrl;
        private String description;
        private Long fileSize;
        private String fileName;
        private Boolean isActive;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String versionName;
        private String apkUrl;
        private String description;
        private Boolean isActive;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String versionName;
        private Integer versionCode;
        private String apkUrl;
        private String description;
        private Long fileSize;
        private String fileName;
        private LocalDateTime releaseDate;
        private Boolean isActive;
        private Long createdById;
        private String createdByUsername;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListResponse {
        private java.util.List<Response> versions;
        private Long totalCount;
    }
}


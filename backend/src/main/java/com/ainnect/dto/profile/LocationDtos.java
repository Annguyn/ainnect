package com.ainnect.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class LocationDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String locationName;
        private String locationType;
        private String address;
        private Double latitude;
        private Double longitude;
        private String description;
        private String imageUrl;
        private Boolean isCurrent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String locationName;
        private String locationType;
        private String address;
        private Double latitude;
        private Double longitude;
        private String description;
        private String imageUrl;
        private Boolean isCurrent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String locationName;
        private String locationType;
        private String address;
        private Double latitude;
        private Double longitude;
        private String description;
        private String imageUrl;
        private Boolean isCurrent;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}

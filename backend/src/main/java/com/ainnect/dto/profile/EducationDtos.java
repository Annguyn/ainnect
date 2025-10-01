package com.ainnect.dto.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class EducationDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Tên trường không được để trống")
        @Size(max = 255, message = "Tên trường không được quá 255 ký tự")
        private String schoolName;

        @Size(max = 100, message = "Bằng cấp không được quá 100 ký tự")
        private String degree;

        @Size(max = 255, message = "Lĩnh vực học tập không được quá 255 ký tự")
        private String fieldOfStudy;

        private LocalDate startDate;
        private LocalDate endDate;
        @Builder.Default
        private Boolean isCurrent = false;

        @Size(max = 1000, message = "Mô tả không được quá 1000 ký tự")
        private String description;

        @Size(max = 500, message = "URL hình ảnh không được quá 500 ký tự")
        private String imageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "Tên trường không được để trống")
        @Size(max = 255, message = "Tên trường không được quá 255 ký tự")
        private String schoolName;

        @Size(max = 100, message = "Bằng cấp không được quá 100 ký tự")
        private String degree;

        @Size(max = 255, message = "Lĩnh vực học tập không được quá 255 ký tự")
        private String fieldOfStudy;

        private LocalDate startDate;
        private LocalDate endDate;
        @Builder.Default
        private Boolean isCurrent = false;

        @Size(max = 1000, message = "Mô tả không được quá 1000 ký tự")
        private String description;

        @Size(max = 500, message = "URL hình ảnh không được quá 500 ký tự")
        private String imageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String schoolName;
        private String degree;
        private String fieldOfStudy;
        private LocalDate startDate;
        private LocalDate endDate;
        private Boolean isCurrent;
        private String description;
        private String imageUrl;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}

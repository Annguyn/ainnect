package com.ainnect.dto.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class WorkExperienceDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Tên công ty không được để trống")
        @Size(max = 255, message = "Tên công ty không được quá 255 ký tự")
        private String companyName;

        @NotBlank(message = "Vị trí không được để trống")
        @Size(max = 255, message = "Vị trí không được quá 255 ký tự")
        private String position;

        @Size(max = 255, message = "Địa điểm không được quá 255 ký tự")
        private String location;

        private LocalDate startDate;
        private LocalDate endDate;
        @Builder.Default
        private Boolean isCurrent = false;

        @Size(max = 2000, message = "Mô tả không được quá 2000 ký tự")
        private String description;

        @Size(max = 500, message = "URL hình ảnh không được quá 500 ký tự")
        private String imageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "Tên công ty không được để trống")
        @Size(max = 255, message = "Tên công ty không được quá 255 ký tự")
        private String companyName;

        @NotBlank(message = "Vị trí không được để trống")
        @Size(max = 255, message = "Vị trí không được quá 255 ký tự")
        private String position;

        @Size(max = 255, message = "Địa điểm không được quá 255 ký tự")
        private String location;

        private LocalDate startDate;
        private LocalDate endDate;
        @Builder.Default
        private Boolean isCurrent = false;

        @Size(max = 2000, message = "Mô tả không được quá 2000 ký tự")
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
        private String companyName;
        private String position;
        private String location;
        private LocalDate startDate;
        private LocalDate endDate;
        private Boolean isCurrent;
        private String description;
        private String imageUrl;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}

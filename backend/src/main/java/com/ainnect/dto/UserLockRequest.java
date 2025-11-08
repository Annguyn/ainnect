package com.ainnect.dto;

public record UserLockRequest(
    String reason
) {
    public UserLockRequest {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Lý do khóa tài khoản không được để trống");
        }
    }
}



package com.ainnect.dto;

public record AdminLoginRequest(
    String username,
    String password
) {
    public AdminLoginRequest {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username không được để trống");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password không được để trống");
        }
    }
}



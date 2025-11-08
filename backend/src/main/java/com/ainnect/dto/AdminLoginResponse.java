package com.ainnect.dto;

public record AdminLoginResponse(
    String accessToken,
    String refreshToken,
    Long userId,
    String username,
    String displayName,
    String role
) {}



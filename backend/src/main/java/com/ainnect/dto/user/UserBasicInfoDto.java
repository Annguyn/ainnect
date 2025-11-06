package com.ainnect.dto.user;

public record UserBasicInfoDto(
    Long id,
    String username,
    String firstName,
    String lastName,
    String avatar,
    String email
) {}

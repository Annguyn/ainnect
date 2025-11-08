package com.ainnect.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AdminUserDTO(
    Long id,
    String username,
    String email,
    String phone,
    String displayName,
    String avatarUrl,
    String bio,
    String gender,
    LocalDate birthday,
    String location,
    Boolean isActive,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    LocalDateTime deletedAt,
    List<String> roles,
    Long totalPosts,
    Long totalFriends,
    Long totalGroups
) {}



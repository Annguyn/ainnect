package com.ainnect.dto;

import java.time.LocalDateTime;

public record AdminGroupDTO(
    Long id,
    String name,
    String description,
    String privacy,
    String coverUrl,
    Long creatorId,
    String creatorName,
    Long totalMembers,
    Long totalPosts,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    LocalDateTime deletedAt
) {}



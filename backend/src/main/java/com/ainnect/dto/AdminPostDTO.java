package com.ainnect.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AdminPostDTO(
    Long id,
    Long userId,
    String username,
    String displayName,
    String content,
    String visibility,
    List<String> mediaUrls,
    Long totalLikes,
    Long totalComments,
    Long totalShares,
    Long totalReports,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    LocalDateTime deletedAt
) {}



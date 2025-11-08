package com.ainnect.dto;

import java.time.LocalDateTime;

public record ActivityLogDTO(
    Long id,
    Long userId,
    String username,
    String action,
    String entityType,
    Long entityId,
    String description,
    String ipAddress,
    LocalDateTime createdAt
) {}



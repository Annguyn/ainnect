package com.ainnect.dto;

import java.time.LocalDateTime;

public record AdminReportDTO(
    Long id,
    Long reporterId,
    String reporterName,
    String targetType,
    Long targetId,
    String reason,
    String description,
    String status,
    Long resolvedById,
    String resolvedByName,
    String resolution,
    LocalDateTime createdAt,
    LocalDateTime resolvedAt
) {}



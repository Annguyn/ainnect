package com.ainnect.dto.notification;

import com.ainnect.common.enums.NotificationType;

import java.time.LocalDateTime;

public record NotificationSummaryDto(
    Long id,
    String actorName,
    String actorAvatar,
    NotificationType type,
    String message,
    Boolean isRead,
    LocalDateTime createdAt
) {}

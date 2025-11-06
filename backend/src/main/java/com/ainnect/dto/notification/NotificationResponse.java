package com.ainnect.dto.notification;

import com.ainnect.common.enums.NotificationType;
import com.ainnect.dto.user.UserBasicInfoDto;

import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    UserBasicInfoDto recipient,
    UserBasicInfoDto actor,
    NotificationType type,
    String targetType,
    Long targetId,
    String message,
    Boolean isRead,
    LocalDateTime createdAt,
    LocalDateTime readAt
) {}

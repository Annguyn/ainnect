package com.ainnect.dto.notification;

import com.ainnect.common.enums.NotificationType;
import jakarta.validation.constraints.NotNull;

public record NotificationCreateRequest(
    @NotNull(message = "Recipient ID is required")
    Long recipientId,
    
    Long actorId,
    
    @NotNull(message = "Notification type is required")
    NotificationType type,
    
    String targetType,
    
    Long targetId,
    
    String message
) {
    public NotificationCreateRequest {
        if (recipientId == null) {
            throw new IllegalArgumentException("Recipient ID cannot be null");
        }
        if (type == null) {
            throw new IllegalArgumentException("Notification type cannot be null");
        }
    }
}

package com.ainnect.dto.notification;

public record NotificationStatsDto(
    Long totalNotifications,
    Long unreadCount,
    Long todayCount
) {}

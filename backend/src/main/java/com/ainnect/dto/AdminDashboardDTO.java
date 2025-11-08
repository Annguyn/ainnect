package com.ainnect.dto;

import java.util.Map;

public record AdminDashboardDTO(
    Long totalUsers,
    Long activeUsers,
    Long inactiveUsers,
    Long totalPosts,
    Long totalGroups,
    Long totalReports,
    Long pendingReports,
    Long todayNewUsers,
    Long todayNewPosts,
    Map<String, Long> userGrowthLast7Days,
    Map<String, Long> postGrowthLast7Days,
    Map<String, Long> topActiveUsers
) {}



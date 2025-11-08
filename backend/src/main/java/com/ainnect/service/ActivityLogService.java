package com.ainnect.service;

import com.ainnect.common.enums.ActivityAction;
import com.ainnect.dto.ActivityLogDTO;
import com.ainnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface ActivityLogService {
    void log(User user, ActivityAction action, String entityType, Long entityId, String description, String ipAddress, String userAgent);
    void log(Long userId, ActivityAction action, String entityType, Long entityId, String description);
    Page<ActivityLogDTO> getAllLogs(Pageable pageable);
    Page<ActivityLogDTO> getLogsByUser(Long userId, Pageable pageable);
    Page<ActivityLogDTO> getLogsByAction(ActivityAction action, Pageable pageable);
    Page<ActivityLogDTO> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    Page<ActivityLogDTO> getLogsByFilters(Long userId, ActivityAction action, String entityType, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}



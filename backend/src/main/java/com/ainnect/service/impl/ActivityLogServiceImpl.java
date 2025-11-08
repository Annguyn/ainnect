package com.ainnect.service.impl;

import com.ainnect.common.enums.ActivityAction;
import com.ainnect.dto.ActivityLogDTO;
import com.ainnect.entity.ActivityLog;
import com.ainnect.entity.User;
import com.ainnect.repository.ActivityLogRepository;
import com.ainnect.repository.UserRepository;
import com.ainnect.service.ActivityLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public void log(User user, ActivityAction action, String entityType, Long entityId, String description, String ipAddress, String userAgent) {
        try {
            ActivityLog log = ActivityLog.builder()
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .description(description)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            activityLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to save activity log: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void log(Long userId, ActivityAction action, String entityType, Long entityId, String description) {
        try {
            User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
            
            ActivityLog activityLog = ActivityLog.builder()
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .description(description)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            activityLogRepository.save(activityLog);
        } catch (Exception e) {
            log.error("Failed to save activity log: {}", e.getMessage());
        }
    }

    @Override
    public Page<ActivityLogDTO> getAllLogs(Pageable pageable) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toDTO);
    }

    @Override
    public Page<ActivityLogDTO> getLogsByUser(Long userId, Pageable pageable) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDTO);
    }

    @Override
    public Page<ActivityLogDTO> getLogsByAction(ActivityAction action, Pageable pageable) {
        return activityLogRepository.findByActionOrderByCreatedAtDesc(action, pageable)
                .map(this::toDTO);
    }

    @Override
    public Page<ActivityLogDTO> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return activityLogRepository.findByDateRange(startDate, endDate, pageable)
                .map(this::toDTO);
    }

    @Override
    public Page<ActivityLogDTO> getLogsByFilters(Long userId, ActivityAction action, String entityType, 
                                                 LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return activityLogRepository.findByFilters(userId, action, entityType, startDate, endDate, pageable)
                .map(this::toDTO);
    }

    private ActivityLogDTO toDTO(ActivityLog log) {
        return new ActivityLogDTO(
                log.getId(),
                log.getUser() != null ? log.getUser().getId() : null,
                log.getUser() != null ? log.getUser().getUsername() : "System",
                log.getAction().name(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDescription(),
                log.getIpAddress(),
                log.getCreatedAt()
        );
    }
}



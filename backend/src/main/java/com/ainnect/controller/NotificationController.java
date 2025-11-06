package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.notification.NotificationResponse;
import com.ainnect.dto.notification.NotificationStatsDto;
import com.ainnect.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getUserNotifications(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Long userId = jwtUtil.getUserIdFromToken(request);
            
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<NotificationResponse> notifications = notificationService.getUserNotifications(userId, pageable);
            
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Notifications retrieved successfully", notifications));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("ERROR", "Failed to retrieve notifications: " + e.getMessage(), null));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<NotificationStatsDto>> getNotificationStats(HttpServletRequest request) {
        try {
            Long userId = jwtUtil.getUserIdFromToken(request);
            NotificationStatsDto stats = notificationService.getNotificationStats(userId);
            
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Notification stats retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("ERROR", "Failed to retrieve notification stats: " + e.getMessage(), null));
        }
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable Long notificationId,
            HttpServletRequest request) {
        try {
            Long userId = jwtUtil.getUserIdFromToken(request);
            NotificationResponse notification = notificationService.markAsRead(notificationId, userId);
            
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Notification marked as read", notification));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("ERROR", "Failed to mark notification as read: " + e.getMessage(), null));
        }
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(HttpServletRequest request) {
        try {
            Long userId = jwtUtil.getUserIdFromToken(request);
            notificationService.markAllAsRead(userId);
            
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "All notifications marked as read", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("ERROR", "Failed to mark all notifications as read: " + e.getMessage(), null));
        }
    }
    
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable Long notificationId,
            HttpServletRequest request) {
        try {
            Long userId = jwtUtil.getUserIdFromToken(request);
            notificationService.deleteNotification(notificationId, userId);
            
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Notification deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("ERROR", "Failed to delete notification: " + e.getMessage(), null));
        }
    }
    
    @DeleteMapping("/cleanup")
    public ResponseEntity<ApiResponse<Void>> deleteOldNotifications(HttpServletRequest request) {
        try {
            Long userId = jwtUtil.getUserIdFromToken(request);
            notificationService.deleteOldNotifications(userId);
            
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Old notifications cleaned up successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("ERROR", "Failed to cleanup old notifications: " + e.getMessage(), null));
        }
    }
}

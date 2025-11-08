package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.common.enums.ActivityAction;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.*;
import com.ainnect.service.ActivityLogService;
import com.ainnect.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ActivityLogService activityLogService;
    private final JwtUtil jwtUtil;
    
    private Long getAdminIdFromRequest(HttpServletRequest request) {
        return jwtUtil.getUserIdFromToken(request);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminLoginResponse>> login(@RequestBody AdminLoginRequest request) {
        try {
            AdminLoginResponse response = adminService.login(request);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Đăng nhập thành công", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDTO>> getDashboard() {
        try {
            AdminDashboardDTO dashboard = adminService.getDashboard();
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy thông tin dashboard thành công", dashboard));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserDTO>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminUserDTO> users = adminService.getAllUsers(pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy danh sách người dùng thành công", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/users/active")
    public ResponseEntity<ApiResponse<Page<AdminUserDTO>>> getActiveUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminUserDTO> users = adminService.getActiveUsers(pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy danh sách người dùng hoạt động thành công", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/users/inactive")
    public ResponseEntity<ApiResponse<Page<AdminUserDTO>>> getInactiveUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminUserDTO> users = adminService.getInactiveUsers(pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy danh sách người dùng bị khóa thành công", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/users/search")
    public ResponseEntity<ApiResponse<Page<AdminUserDTO>>> searchUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminUserDTO> users = adminService.searchUsers(keyword, pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Tìm kiếm người dùng thành công", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<AdminUserDTO>> getUserById(@PathVariable Long userId) {
        try {
            AdminUserDTO user = adminService.getUserById(userId);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy thông tin người dùng thành công", user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @PostMapping("/users/{userId}/lock")
    public ResponseEntity<ApiResponse<String>> lockUser(
            @PathVariable Long userId,
            @RequestBody UserLockRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long adminId = getAdminIdFromRequest(httpRequest);
            adminService.lockUser(userId, request.reason(), adminId);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Khóa tài khoản thành công", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @PostMapping("/users/{userId}/unlock")
    public ResponseEntity<ApiResponse<String>> unlockUser(
            @PathVariable Long userId,
            HttpServletRequest httpRequest) {
        try {
            Long adminId = getAdminIdFromRequest(httpRequest);
            adminService.unlockUser(userId, adminId);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Mở khóa tài khoản thành công", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable Long userId,
            HttpServletRequest httpRequest) {
        try {
            Long adminId = getAdminIdFromRequest(httpRequest);
            adminService.deleteUser(userId, adminId);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Xóa người dùng thành công", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<Page<AdminPostDTO>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminPostDTO> posts = adminService.getAllPosts(pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy danh sách bài viết thành công", posts));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<ApiResponse<Page<AdminPostDTO>>> getPostsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminPostDTO> posts = adminService.getPostsByUser(userId, pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy danh sách bài viết của người dùng thành công", posts));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<AdminPostDTO>> getPostById(@PathVariable Long postId) {
        try {
            AdminPostDTO post = adminService.getPostById(postId);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy thông tin bài viết thành công", post));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<String>> deletePost(
            @PathVariable Long postId,
            @RequestParam String reason,
            HttpServletRequest httpRequest) {
        try {
            Long adminId = getAdminIdFromRequest(httpRequest);
            adminService.deletePost(postId, adminId, reason);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Xóa bài viết thành công", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/communities")
    public ResponseEntity<ApiResponse<Page<AdminGroupDTO>>> getAllCommunities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminGroupDTO> communities = adminService.getAllCommunities(pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy danh sách cộng đồng thành công", communities));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/communities/search")
    public ResponseEntity<ApiResponse<Page<AdminGroupDTO>>> searchCommunities(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminGroupDTO> communities = adminService.searchCommunities(keyword, pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Tìm kiếm cộng đồng thành công", communities));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/communities/{communityId}")
    public ResponseEntity<ApiResponse<AdminGroupDTO>> getCommunityById(@PathVariable Long communityId) {
        try {
            AdminGroupDTO community = adminService.getCommunityById(communityId);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy thông tin cộng đồng thành công", community));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/communities/{communityId}")
    public ResponseEntity<ApiResponse<String>> deleteCommunity(
            @PathVariable Long communityId,
            @RequestParam String reason,
            HttpServletRequest httpRequest) {
        try {
            Long adminId = getAdminIdFromRequest(httpRequest);
            adminService.deleteCommunity(communityId, adminId, reason);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Xóa cộng đồng thành công", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Page<AdminReportDTO>>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminReportDTO> reports = adminService.getAllReports(pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy danh sách báo cáo thành công", reports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/reports/pending")
    public ResponseEntity<ApiResponse<Page<AdminReportDTO>>> getPendingReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminReportDTO> reports = adminService.getPendingReports(pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy danh sách báo cáo chờ xử lý thành công", reports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/reports/{reportId}")
    public ResponseEntity<ApiResponse<AdminReportDTO>> getReportById(@PathVariable Long reportId) {
        try {
            AdminReportDTO report = adminService.getReportById(reportId);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy thông tin báo cáo thành công", report));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @PostMapping("/reports/{reportId}/resolve")
    public ResponseEntity<ApiResponse<String>> resolveReport(
            @PathVariable Long reportId,
            @RequestParam String resolution,
            HttpServletRequest httpRequest) {
        try {
            Long adminId = getAdminIdFromRequest(httpRequest);
            adminService.resolveReport(reportId, adminId, resolution);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Xử lý báo cáo thành công", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @PostMapping("/reports/{reportId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectReport(
            @PathVariable Long reportId,
            @RequestParam String reason,
            HttpServletRequest httpRequest) {
        try {
            Long adminId = getAdminIdFromRequest(httpRequest);
            adminService.rejectReport(reportId, adminId, reason);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Từ chối báo cáo thành công", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("ERROR", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<Page<ActivityLogDTO>>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ActivityLogDTO> logs = activityLogService.getAllLogs(pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy danh sách logs thành công", logs));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<ApiResponse<Page<ActivityLogDTO>>> getLogsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ActivityLogDTO> logs = activityLogService.getLogsByUser(userId, pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy logs của người dùng thành công", logs));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/logs/action/{action}")
    public ResponseEntity<ApiResponse<Page<ActivityLogDTO>>> getLogsByAction(
            @PathVariable ActivityAction action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ActivityLogDTO> logs = activityLogService.getLogsByAction(action, pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lấy logs theo action thành công", logs));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @GetMapping("/logs/filter")
    public ResponseEntity<ApiResponse<Page<ActivityLogDTO>>> getLogsByFilters(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) ActivityAction action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            if (startDate == null) {
                startDate = LocalDateTime.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDateTime.now();
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<ActivityLogDTO> logs = activityLogService.getLogsByFilters(userId, action, entityType, startDate, endDate, pageable);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Lọc logs thành công", logs));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("ERROR", "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }
}



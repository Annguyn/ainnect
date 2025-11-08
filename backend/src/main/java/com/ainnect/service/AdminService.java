package com.ainnect.service;

import com.ainnect.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    AdminLoginResponse login(AdminLoginRequest request);
    AdminDashboardDTO getDashboard();
    
    Page<AdminUserDTO> getAllUsers(Pageable pageable);
    Page<AdminUserDTO> getActiveUsers(Pageable pageable);
    Page<AdminUserDTO> getInactiveUsers(Pageable pageable);
    Page<AdminUserDTO> searchUsers(String keyword, Pageable pageable);
    AdminUserDTO getUserById(Long userId);
    void lockUser(Long userId, String reason, Long adminId);
    void unlockUser(Long userId, Long adminId);
    void deleteUser(Long userId, Long adminId);
    
    Page<AdminPostDTO> getAllPosts(Pageable pageable);
    Page<AdminPostDTO> getPostsByUser(Long userId, Pageable pageable);
    AdminPostDTO getPostById(Long postId);
    void deletePost(Long postId, Long adminId, String reason);
    
    Page<AdminGroupDTO> getAllCommunities(Pageable pageable);
    Page<AdminGroupDTO> searchCommunities(String keyword, Pageable pageable);
    AdminGroupDTO getCommunityById(Long communityId);
    void deleteCommunity(Long communityId, Long adminId, String reason);
    
    Page<AdminReportDTO> getAllReports(Pageable pageable);
    Page<AdminReportDTO> getPendingReports(Pageable pageable);
    AdminReportDTO getReportById(Long reportId);
    void resolveReport(Long reportId, Long adminId, String resolution);
    void rejectReport(Long reportId, Long adminId, String reason);
}



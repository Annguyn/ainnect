package com.ainnect.service.impl;

import com.ainnect.common.enums.ActivityAction;
import com.ainnect.common.enums.ReportStatus;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.*;
import com.ainnect.entity.*;
import com.ainnect.repository.*;
import com.ainnect.service.ActivityLogService;
import com.ainnect.service.AdminService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    @Transactional
    public AdminLoginResponse login(AdminLoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("Tên đăng nhập hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        if (!user.getIsActive()) {
            throw new IllegalArgumentException("Tài khoản đã bị khóa");
        }

        boolean isAdmin = user.getUserRoles().stream()
                .anyMatch(ur -> "ADMIN".equals(ur.getRole().getCode()));

        if (!isAdmin) {
            throw new IllegalArgumentException("Bạn không có quyền truy cập");
        }

        String accessToken = jwtUtil.generateToken(user.getUsername(), user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername(), user.getId());

        activityLogService.log(user.getId(), ActivityAction.USER_LOGIN, "User", user.getId(), 
                "Admin login: " + user.getUsername());

        return new AdminLoginResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                "ADMIN"
        );
    }

    @Override
    public AdminDashboardDTO getDashboard() {
        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countActiveUsers();
        Long inactiveUsers = userRepository.countInactiveUsers();
        Long totalPosts = postRepository.count();
        Long totalGroups = communityRepository.countActiveCommunities();
        Long totalReports = reportRepository.count();
        Long pendingReports = reportRepository.countByStatus(ReportStatus.PENDING);

        LocalDateTime today = LocalDateTime.now().toLocalDate().atStartOfDay();
        Long todayNewUsers = userRepository.countNewUsersSince(today);
        Long todayNewPosts = postRepository.countNewPostsSince(today);

        LocalDateTime last7Days = LocalDateTime.now().minusDays(7);
        List<Object[]> userGrowth = userRepository.getUserGrowthStats(last7Days);
        Map<String, Long> userGrowthMap = userGrowth.stream()
                .collect(Collectors.toMap(
                        arr -> arr[0].toString(),
                        arr -> ((Number) arr[1]).longValue(),
                        (a, b) -> b,
                        LinkedHashMap::new
                ));

        List<Object[]> postGrowth = postRepository.getPostGrowthStats(last7Days);
        Map<String, Long> postGrowthMap = postGrowth.stream()
                .collect(Collectors.toMap(
                        arr -> arr[0].toString(),
                        arr -> ((Number) arr[1]).longValue(),
                        (a, b) -> b,
                        LinkedHashMap::new
                ));

        Map<String, Long> topActiveUsers = new LinkedHashMap<>();

        return new AdminDashboardDTO(
                totalUsers,
                activeUsers,
                inactiveUsers,
                totalPosts,
                totalGroups,
                totalReports,
                pendingReports,
                todayNewUsers,
                todayNewPosts,
                userGrowthMap,
                postGrowthMap,
                topActiveUsers
        );
    }

    @Override
    public Page<AdminUserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toUserDTO);
    }

    @Override
    public Page<AdminUserDTO> getActiveUsers(Pageable pageable) {
        return userRepository.findByIsActiveOrderByCreatedAtDesc(true, pageable)
                .map(this::toUserDTO);
    }

    @Override
    public Page<AdminUserDTO> getInactiveUsers(Pageable pageable) {
        return userRepository.findByIsActiveOrderByCreatedAtDesc(false, pageable)
                .map(this::toUserDTO);
    }

    @Override
    public Page<AdminUserDTO> searchUsers(String keyword, Pageable pageable) {
        return userRepository.searchUsers(keyword, pageable)
                .map(this::toUserDTO);
    }

    @Override
    public AdminUserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
        return toUserDTO(user);
    }

    @Override
    @Transactional
    public void lockUser(Long userId, String reason, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        user.setIsActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        activityLogService.log(adminId, ActivityAction.USER_LOCKED, "User", userId, 
                "Locked user: " + user.getUsername() + ". Reason: " + reason);
    }

    @Override
    @Transactional
    public void unlockUser(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        user.setIsActive(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        activityLogService.log(adminId, ActivityAction.USER_UNLOCKED, "User", userId, 
                "Unlocked user: " + user.getUsername());
    }

    @Override
    @Transactional
    public void deleteUser(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        user.setDeletedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        activityLogService.log(adminId, ActivityAction.USER_DELETED, "User", userId, 
                "Deleted user: " + user.getUsername());
    }

    @Override
    public Page<AdminPostDTO> getAllPosts(Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toPostDTO);
    }

    @Override
    public Page<AdminPostDTO> getPostsByUser(Long userId, Pageable pageable) {
        return postRepository.findByAuthor_IdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toPostDTO);
    }

    @Override
    public AdminPostDTO getPostById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));
        return toPostDTO(post);
    }

    @Override
    @Transactional
    public void deletePost(Long postId, Long adminId, String reason) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));

        post.setDeletedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        postRepository.save(post);

        activityLogService.log(adminId, ActivityAction.POST_DELETED, "Post", postId, 
                "Deleted post by " + post.getAuthor().getUsername() + ". Reason: " + reason);
    }

    @Override
    public Page<AdminGroupDTO> getAllCommunities(Pageable pageable) {
        return communityRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toCommunityDTO);
    }

    @Override
    public Page<AdminGroupDTO> searchCommunities(String keyword, Pageable pageable) {
        return communityRepository.searchCommunities(keyword, pageable)
                .map(this::toCommunityDTO);
    }

    @Override
    public AdminGroupDTO getCommunityById(Long communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cộng đồng"));
        return toCommunityDTO(community);
    }

    @Override
    @Transactional
    public void deleteCommunity(Long communityId, Long adminId, String reason) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cộng đồng"));

        community.setDeletedAt(LocalDateTime.now());
        community.setUpdatedAt(LocalDateTime.now());
        communityRepository.save(community);

        activityLogService.log(adminId, ActivityAction.GROUP_DELETED, "Community", communityId, 
                "Deleted community: " + community.getName() + ". Reason: " + reason);
    }

    @Override
    public Page<AdminReportDTO> getAllReports(Pageable pageable) {
        return reportRepository.findAll(pageable)
                .map(this::toReportDTO);
    }

    @Override
    public Page<AdminReportDTO> getPendingReports(Pageable pageable) {
        return reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING, pageable)
                .map(this::toReportDTO);
    }

    @Override
    public AdminReportDTO getReportById(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy báo cáo"));
        return toReportDTO(report);
    }

    @Override
    @Transactional
    public void resolveReport(Long reportId, Long adminId, String resolution) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy báo cáo"));

        report.setStatus(ReportStatus.RESOLVED);
        report.setReviewedBy(userRepository.findById(adminId).orElse(null));
        report.setReviewedAt(LocalDateTime.now());
        report.setAdminNote(resolution);
        reportRepository.save(report);

        activityLogService.log(adminId, ActivityAction.REPORT_RESOLVED, "Report", reportId, 
                "Resolved report #" + reportId + ". Resolution: " + resolution);
    }

    @Override
    @Transactional
    public void rejectReport(Long reportId, Long adminId, String reason) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy báo cáo"));

        report.setStatus(ReportStatus.REJECTED);
        report.setReviewedBy(userRepository.findById(adminId).orElse(null));
        report.setReviewedAt(LocalDateTime.now());
        report.setAdminNote("Rejected: " + reason);
        reportRepository.save(report);

        activityLogService.log(adminId, ActivityAction.REPORT_RESOLVED, "Report", reportId, 
                "Rejected report #" + reportId + ". Reason: " + reason);
    }

    private AdminUserDTO toUserDTO(User user) {
        List<String> roles = user.getUserRoles().stream()
                .map(ur -> ur.getRole().getCode())
                .collect(Collectors.toList());

        Long totalPosts = postRepository.countByAuthorId(user.getId());
        Long totalGroups = groupMemberRepository.countByUserId(user.getId());

        return new AdminUserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getGender() != null ? user.getGender().name() : null,
                user.getBirthday(),
                user.getLocation(),
                user.getIsActive(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getDeletedAt(),
                roles,
                totalPosts,
                0L,
                totalGroups
        );
    }

    private AdminPostDTO toPostDTO(Post post) {
        List<String> mediaUrls = post.getMedia() != null ? 
                post.getMedia().stream()
                        .map(PostMedia::getMediaUrl)
                        .collect(Collectors.toList()) : 
                List.of();

        Long totalReports = reportRepository.countByTargetTypeAndTargetId("Post", post.getId());

        return new AdminPostDTO(
                post.getId(),
                post.getAuthor().getId(),
                post.getAuthor().getUsername(),
                post.getAuthor().getDisplayName(),
                post.getContent(),
                post.getVisibility() != null ? post.getVisibility().name() : null,
                mediaUrls,
                0L,
                0L,
                0L,
                totalReports,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getDeletedAt()
        );
    }

    private AdminGroupDTO toCommunityDTO(Community community) {
        Long totalMembers = groupMemberRepository.countByCommunityId(community.getId());
        Long totalPosts = postRepository.countByCommunityId(community.getId());

        return new AdminGroupDTO(
                community.getId(),
                community.getName(),
                community.getDescription(),
                community.getPrivacy() != null ? community.getPrivacy().name() : null,
                community.getCoverUrl(),
                community.getOwner().getId(),
                community.getOwner().getDisplayName(),
                totalMembers,
                totalPosts,
                community.getCreatedAt(),
                community.getUpdatedAt(),
                community.getDeletedAt()
        );
    }

    private AdminReportDTO toReportDTO(Report report) {
        return new AdminReportDTO(
                report.getId(),
                report.getReporter().getId(),
                report.getReporter().getDisplayName(),
                report.getTargetType(),
                report.getTargetId(),
                report.getReason() != null ? report.getReason().name() : null,
                report.getDescription(),
                report.getStatus() != null ? report.getStatus().name() : null,
                report.getReviewedBy() != null ? report.getReviewedBy().getId() : null,
                report.getReviewedBy() != null ? report.getReviewedBy().getDisplayName() : null,
                report.getAdminNote(),
                report.getCreatedAt(),
                report.getReviewedAt()
        );
    }
}


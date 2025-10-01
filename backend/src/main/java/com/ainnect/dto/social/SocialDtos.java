package com.ainnect.dto.social;

import com.ainnect.common.enums.FriendshipStatus;
import com.ainnect.common.enums.ReportReason;
import com.ainnect.common.enums.ReportStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class SocialDtos {

    // Follow DTOs
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowRequest {
        private Long followeeId;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowResponse {
        private Long followerId;
        private String followerUsername;
        private String followerDisplayName;
        private String followerAvatarUrl;
        private Long followeeId;
        private String followeeUsername;
        private String followeeDisplayName;
        private String followeeAvatarUrl;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowListResponse {
        private List<FollowResponse> follows;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    // Friendship DTOs
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendshipRequest {
        private Long friendId;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendshipResponse {
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
        private FriendshipStatus status;
        private Long requestedById;
        private String requestedByUsername;
        private LocalDateTime respondedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendshipListResponse {
        private List<FriendshipResponse> friendships;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    // Common friends DTOs
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommonFriendItem {
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommonFriendsResponse {
        private List<CommonFriendItem> commonFriends;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendshipActionRequest {
        private Long otherUserId; // preferred: the counterpart's user id
        private Long friendshipId; // backward-compat: treated as otherUserId if provided
        private FriendshipStatus action; // accepted, blocked
    }

    // User Block DTOs
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockRequest {
        private Long blockedUserId;
        private String reason;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockResponse {
        private Long id;
        private Long blockerId;
        private String blockerUsername;
        private String blockerDisplayName;
        private String blockerAvatarUrl;
        private Long blockedId;
        private String blockedUsername;
        private String blockedDisplayName;
        private String blockedAvatarUrl;
        private String reason;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockListResponse {
        private List<BlockResponse> blocks;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    // Share DTOs
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareRequest {
        private Long postId;
        private String comment;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareResponse {
        private Long id;
        private Long postId;
        private String postContent;
        private String postAuthorUsername;
        private String postAuthorDisplayName;
        private String postAuthorAvatarUrl;
        private Long byUserId;
        private String byUsername;
        private String byDisplayName;
        private String byAvatarUrl;
        private String comment;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareListResponse {
        private List<ShareResponse> shares;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    // Social Stats DTOs
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SocialStatsResponse {
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
        private long followersCount;
        private long followingCount;
        private long friendsCount;
        private long sharesCount;
        private boolean isFollowing;
        private boolean isFriend;
        private boolean isBlocked;
        private boolean canSendFriendRequest;
    }

    // Report DTOs
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportRequest {
        private String targetType; // POST, COMMENT, USER
        private Long targetId;
        private ReportReason reason;
        private String description;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportResponse {
        private Long id;
        private Long reporterId;
        private String reporterUsername;
        private String reporterDisplayName;
        private String targetType;
        private Long targetId;
        private ReportReason reason;
        private String description;
        private ReportStatus status;
        private Long reviewedById;
        private String reviewedByUsername;
        private LocalDateTime reviewedAt;
        private String adminNote;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportListResponse {
        private List<ReportResponse> reports;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportActionRequest {
        private Long reportId;
        private ReportStatus status;
        private String adminNote;
    }

    // Social Action Response
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SocialActionResponse {
        private String action;
        private String message;
        private boolean success;
        private Object data;
    }
}


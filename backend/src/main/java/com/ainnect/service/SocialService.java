package com.ainnect.service;

import com.ainnect.common.enums.ReportReason;
import com.ainnect.common.enums.ReportStatus;
import com.ainnect.dto.social.SocialDtos;

public interface SocialService {

    // Follow operations
    SocialDtos.SocialActionResponse followUser(Long followerId, Long followeeId);
    SocialDtos.SocialActionResponse unfollowUser(Long followerId, Long followeeId);
    SocialDtos.FollowListResponse getFollowers(Long userId, int page, int size);
    SocialDtos.FollowListResponse getFollowing(Long userId, int page, int size);
    boolean isFollowing(Long followerId, Long followeeId);

    // Friendship operations
    SocialDtos.SocialActionResponse sendFriendRequest(Long requesterId, Long friendId);
    SocialDtos.SocialActionResponse acceptFriendRequest(Long userId, Long friendshipId);
    SocialDtos.SocialActionResponse rejectFriendRequest(Long userId, Long friendshipId);
    SocialDtos.SocialActionResponse removeFriend(Long userId, Long friendId);
    SocialDtos.FriendshipListResponse getFriends(Long userId, int page, int size);
    SocialDtos.FriendshipListResponse getFriendRequests(Long userId, int page, int size);
    SocialDtos.FriendshipListResponse getSentFriendRequests(Long userId, int page, int size);
    boolean isFriend(Long userId1, Long userId2);
    boolean hasPendingFriendRequest(Long requesterId, Long friendId);

    // Block operations
    SocialDtos.SocialActionResponse blockUser(Long blockerId, Long blockedUserId, String reason);
    SocialDtos.SocialActionResponse unblockUser(Long blockerId, Long blockedUserId);
    SocialDtos.BlockListResponse getBlockedUsers(Long userId, int page, int size);
    boolean isBlocked(Long blockerId, Long blockedId);

    // Share operations
    SocialDtos.SocialActionResponse sharePost(Long userId, Long postId, String comment);
    SocialDtos.SocialActionResponse deleteShare(Long userId, Long shareId);
    SocialDtos.ShareListResponse getPostShares(Long postId, int page, int size);
    SocialDtos.ShareListResponse getUserShares(Long userId, int page, int size);

    // Report operations
    SocialDtos.SocialActionResponse reportUser(Long reporterId, Long targetUserId, ReportReason reason, String description);
    SocialDtos.SocialActionResponse reportPost(Long reporterId, Long postId, ReportReason reason, String description);
    SocialDtos.SocialActionResponse reportComment(Long reporterId, Long commentId, ReportReason reason, String description);
    SocialDtos.ReportListResponse getReportsByReporter(Long reporterId, int page, int size);
    SocialDtos.ReportListResponse getAllReports(int page, int size);
    SocialDtos.SocialActionResponse updateReportStatus(Long reportId, ReportStatus status, String adminNote, Long adminId);
    SocialDtos.ReportResponse getReportById(Long reportId);

    // Social Stats
    SocialDtos.SocialStatsResponse getSocialStats(Long userId, Long currentUserId);
    
    boolean canSendFriendRequest(Long userId1, Long userId2);
    boolean isBlockedBy(Long userId, Long otherUserId);

    // Common friends
    SocialDtos.CommonFriendsResponse getCommonFriends(Long userId, Long otherUserId, int page, int size);
    long countCommonFriends(Long userId, Long otherUserId);
}

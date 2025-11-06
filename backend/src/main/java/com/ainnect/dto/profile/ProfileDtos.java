package com.ainnect.dto.profile;

import com.ainnect.common.enums.FriendshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ProfileDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileResponse {
        private Long userId;
        private String username;
        private String displayName;
        private String bio;
        private String avatarUrl;
        private String coverUrl;
        private String location;
        private String website;
        private LocalDateTime joinedAt;
        private boolean isVerified;
        private boolean isPrivate;
        private RelationshipResponse relationship;
        private SocialStatsResponse socialStats;
        private List<EducationDtos.Response> educations;
        private List<WorkExperienceDtos.Response> workExperiences;
        private List<InterestDtos.Response> interests;
        private List<LocationDtos.Response> locations;
        private ProfilePostsResponse posts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelationshipResponse {
        // Follow relationship
        private boolean isFollowing;           // Current user đang follow profile user
        private boolean isFollowedBy;          // Profile user đang follow current user
        private boolean isMutualFollow;        // Cả hai đều follow nhau
        
        // Friendship relationship
        private boolean isFriend;              // Đã là bạn bè
        private boolean canSendFriendRequest;  // Có thể gửi lời mời kết bạn
        private FriendshipStatus friendshipStatus; // Trạng thái kết bạn chi tiết
        
        // Block relationship
        private boolean isBlocked;             // Current user đã block profile user
        private boolean isBlockedBy;           // Profile user đã block current user
        
        // Summary status
        private String relationshipStatus;     // Tóm tắt mối quan hệ: "friends", "following", "followers", "pending_request", "blocked", "none"
        private String actionAvailable;        // Hành động có thể thực hiện: "follow", "unfollow", "send_friend_request", "accept_friend_request", "remove_friend", "block", "unblock"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SocialStatsResponse {
        private Long userId;
        private long followersCount;
        private long followingCount;
        private long friendsCount;
        private long postsCount;
        private long likesCount;
        private long commentsCount;
        private long sharesCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentPostResponse {
        private Long id;
        private String content;
        private String mediaUrl;
        private String mediaType;
        private LocalDateTime createdAt;
        private long likesCount;
        private long commentsCount;
        private long sharesCount;
        private boolean isLiked;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfilePostsResponse {
        private List<PostResponse> posts;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostResponse {
        private Long id;
        private String content;
        private List<MediaResponse> media;
        private LocalDateTime createdAt;
        private long likesCount;
        private long commentsCount;
        private long sharesCount;
        private boolean isLiked;
        private boolean isBookmarked;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaResponse {
        private Long id;
        private String mediaUrl;
        private String mediaType;
        private String fileName;
        private Long fileSize;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowersResponse {
        private List<FollowerResponse> followers;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowerResponse {
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
        private String bio;
        private boolean isVerified;
        private boolean isFollowing;
        private boolean isFollowedBy;
        private boolean isFriend;
        private boolean canSendFriendRequest;
        private FriendshipStatus friendshipStatus;
        private LocalDateTime followedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowingResponse {
        private List<FollowingUserResponse> following;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowingUserResponse {
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
        private String bio;
        private boolean isVerified;
        private boolean isFollowing;
        private boolean isFollowedBy;
        private boolean isFriend;
        private boolean canSendFriendRequest;
        private FriendshipStatus friendshipStatus;
        private LocalDateTime followedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendsResponse {
        private List<FriendResponse> friends;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendResponse {
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
        private String bio;
        private boolean isVerified;
        private boolean isFollowing;
        private boolean isFollowedBy;
        private boolean isFriend;
        private LocalDateTime friendsSince;
        private LocalDateTime lastActiveAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileUpdateRequest {
        private String displayName;
        private String bio;
        private String location;
        private String website;
        private boolean isPrivate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileUpdateResponse {
        private Long userId;
        private String username;
        private String displayName;
        private String bio;
        private String avatarUrl;
        private String coverUrl;
        private String location;
        private String website;
        private boolean isVerified;
        private boolean isPrivate;
        private LocalDateTime updatedAt;
    }
}
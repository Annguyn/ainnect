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
        private boolean isFollowing;           
        private boolean isFollowedBy;          
        private boolean isMutualFollow;        
        
        private boolean isFriend;              
        private boolean canSendFriendRequest;  
        private FriendshipStatus friendshipStatus; 
        
        private boolean isBlocked;             
        private boolean isBlockedBy;           
        
        private String relationshipStatus;     
        private String actionAvailable;        
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
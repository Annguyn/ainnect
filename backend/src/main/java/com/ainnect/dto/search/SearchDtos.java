package com.ainnect.dto.search;

import com.ainnect.common.enums.PostVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

public class SearchDtos {
    
    @Getter
    @Setter
    public static class SearchRequest {
        private String keyword;
        private String type; // "all", "users", "groups", "posts"
        private int page = 0;
        private int size = 10;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class UserSearchResult {
        private Long id;
        private String username;
        private String displayName;
        private String avatarUrl;
        private String bio;
        private boolean isFollowing;
        private boolean isFriend;
        private boolean isBlocked;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class GroupSearchResult {
        private Long id;
        private String name;
        private String description;
        private String avatarUrl;
        private String coverUrl;
        private int memberCount;
        private boolean isMember;
        private boolean isAdmin;
        private LocalDateTime createdAt;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class PostSearchResult {
        private Long id;
        private String content;
        private PostVisibility visibility;
        private Long authorId;
        private String authorUsername;
        private String authorDisplayName;
        private String authorAvatarUrl;
        private Long groupId;
        private String groupName;
        private int reactionCount;
        private int commentCount;
        private int shareCount;
        private LocalDateTime createdAt;
        private List<MediaResult> media;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class MediaResult {
        private Long id;
        private String mediaUrl;
        private String mediaType;
        private LocalDateTime createdAt;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class SearchResponse {
        private List<UserSearchResult> users;
        private List<GroupSearchResult> groups;
        private List<PostSearchResult> posts;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
        private String searchType;
        private String keyword;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class UserSearchResponse {
        private List<UserSearchResult> users;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
        private String keyword;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class GroupSearchResponse {
        private List<GroupSearchResult> groups;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
        private String keyword;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class PostSearchResponse {
        private List<PostSearchResult> posts;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
        private String keyword;
    }
}

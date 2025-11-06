package com.ainnect.service.impl;

import com.ainnect.dto.search.SearchDtos;
import com.ainnect.entity.Community;
import com.ainnect.entity.Post;
import com.ainnect.entity.User;
import com.ainnect.repository.CommunityRepository;
import com.ainnect.repository.FollowRepository;
import com.ainnect.repository.FriendshipRepository;
import com.ainnect.repository.GroupMemberRepository;
import com.ainnect.repository.PostRepository;
import com.ainnect.repository.UserBlockRepository;
import com.ainnect.repository.UserRepository;
import com.ainnect.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final FriendshipRepository friendshipRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserBlockRepository userBlockRepository;
    
        @org.springframework.beans.factory.annotation.Value("${app.file.base-url:http://localhost:8080}")
        private String baseUrl;

    @Override
    public SearchDtos.SearchResponse searchAll(String keyword, Long currentUserId, Pageable pageable) {
        // Search each type with smaller page size for combined results
        Pageable smallPageable = PageRequest.of(0, 5);
        
        // Search users
        Page<User> userPage = userRepository.searchUsers(keyword, smallPageable);
        List<SearchDtos.UserSearchResult> users = userPage.getContent().stream()
                .filter(user -> !isBlockedBetween(currentUserId, user.getId()))
                .map(user -> toUserSearchResult(user, currentUserId))
                .collect(Collectors.toList());

        // Search groups
        Page<Community> groupPage = communityRepository.searchCommunities(keyword, smallPageable);
        List<SearchDtos.GroupSearchResult> groups = groupPage.getContent().stream()
                .map(group -> toGroupSearchResult(group, currentUserId))
                .collect(Collectors.toList());

        // Search posts
        Page<Post> postPage = postRepository.searchPosts(keyword, currentUserId, smallPageable);
        List<SearchDtos.PostSearchResult> posts = postPage.getContent().stream()
                .map(this::toPostSearchResult)
                .collect(Collectors.toList());

        return SearchDtos.SearchResponse.builder()
                .users(users)
                .groups(groups)
                .posts(posts)
                .currentPage(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .totalElements(userPage.getTotalElements() + groupPage.getTotalElements() + postPage.getTotalElements())
                .totalPages((int) Math.ceil((double) (userPage.getTotalElements() + groupPage.getTotalElements() + postPage.getTotalElements()) / pageable.getPageSize()))
                .hasNext(pageable.getPageNumber() < Math.ceil((double) (userPage.getTotalElements() + groupPage.getTotalElements() + postPage.getTotalElements()) / pageable.getPageSize()) - 1)
                .hasPrevious(pageable.getPageNumber() > 0)
                .searchType("all")
                .keyword(keyword)
                .build();
    }

    @Override
    public SearchDtos.UserSearchResponse searchUsers(String keyword, Long currentUserId, Pageable pageable) {
        Page<User> userPage = userRepository.searchUsers(keyword, pageable);
        List<SearchDtos.UserSearchResult> users = userPage.getContent().stream()
                .filter(user -> !isBlockedBetween(currentUserId, user.getId()))
                .map(user -> toUserSearchResult(user, currentUserId))
                .collect(Collectors.toList());

        return SearchDtos.UserSearchResponse.builder()
                .users(users)
                .currentPage(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .hasNext(userPage.hasNext())
                .hasPrevious(userPage.hasPrevious())
                .keyword(keyword)
                .build();
    }

    @Override
    public SearchDtos.GroupSearchResponse searchGroups(String keyword, Long currentUserId, Pageable pageable) {
        Page<Community> groupPage = communityRepository.searchCommunities(keyword, pageable);
        List<SearchDtos.GroupSearchResult> groups = groupPage.getContent().stream()
                .map(group -> toGroupSearchResult(group, currentUserId))
                .collect(Collectors.toList());

        return SearchDtos.GroupSearchResponse.builder()
                .groups(groups)
                .currentPage(groupPage.getNumber())
                .pageSize(groupPage.getSize())
                .totalElements(groupPage.getTotalElements())
                .totalPages(groupPage.getTotalPages())
                .hasNext(groupPage.hasNext())
                .hasPrevious(groupPage.hasPrevious())
                .keyword(keyword)
                .build();
    }

    @Override
    public SearchDtos.PostSearchResponse searchPosts(String keyword, Long currentUserId, Pageable pageable) {
        Page<Post> postPage = postRepository.searchPosts(keyword, currentUserId, pageable);
        List<SearchDtos.PostSearchResult> posts = postPage.getContent().stream()
                .map(this::toPostSearchResult)
                .collect(Collectors.toList());

        return SearchDtos.PostSearchResponse.builder()
                .posts(posts)
                .currentPage(postPage.getNumber())
                .pageSize(postPage.getSize())
                .totalElements(postPage.getTotalElements())
                .totalPages(postPage.getTotalPages())
                .hasNext(postPage.hasNext())
                .hasPrevious(postPage.hasPrevious())
                .keyword(keyword)
                .build();
    }

    private SearchDtos.UserSearchResult toUserSearchResult(User user, Long currentUserId) {
        boolean isFollowing = false;
        boolean isFriend = false;
        boolean isBlocked = false;

        if (currentUserId != null && !currentUserId.equals(user.getId())) {
            // Check if current user is following this user
            isFollowing = followRepository.existsByFollowerIdAndFolloweeId(currentUserId, user.getId());
            
            // Check if they are friends
            isFriend = friendshipRepository.existsByUserLow_IdAndUserHigh_IdAndStatus(
                    Math.min(currentUserId, user.getId()),
                    Math.max(currentUserId, user.getId()),
                    com.ainnect.common.enums.FriendshipStatus.accepted
            );
            
            // Check if current user has blocked this user
            isBlocked = userBlockRepository.existsByBlockerIdAndBlockedId(currentUserId, user.getId());
        }

        return SearchDtos.UserSearchResult.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatarUrl(buildFileUrl(user.getAvatarUrl()))
                .bio(user.getBio())
                .isFollowing(isFollowing)
                .isFriend(isFriend)
                .isBlocked(isBlocked)
                .build();
    }

    private boolean isBlockedBetween(Long currentUserId, Long otherUserId) {
        if (currentUserId == null || otherUserId == null || currentUserId.equals(otherUserId)) {
            return false;
        }
        return userBlockRepository.existsByBlockerIdAndBlockedId(currentUserId, otherUserId)
                || userBlockRepository.existsByBlockerIdAndBlockedId(otherUserId, currentUserId);
    }

    private SearchDtos.GroupSearchResult toGroupSearchResult(Community group, Long currentUserId) {
        boolean isMember = false;
        boolean isAdmin = false;

        if (currentUserId != null) {
            // Check if current user is a member
            isMember = groupMemberRepository.existsByGroupIdAndUserId(group.getId(), currentUserId);
            
            // Check if current user is an admin
            isAdmin = groupMemberRepository.existsByGroupIdAndUserIdAndRole(
                    group.getId(), 
                    currentUserId, 
                    com.ainnect.common.enums.GroupMemberRole.admin
            );
        }

        // Get member count
        int memberCount = groupMemberRepository.countByGroupId(group.getId());

        return SearchDtos.GroupSearchResult.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .avatarUrl(null) // Community doesn't have avatarUrl field
                .coverUrl(null) // Community doesn't have coverUrl field
                .memberCount(memberCount)
                .isMember(isMember)
                .isAdmin(isAdmin)
                .createdAt(group.getCreatedAt())
                .build();
    }

    private SearchDtos.PostSearchResult toPostSearchResult(Post post) {
        List<SearchDtos.MediaResult> media = post.getMedia().stream()
                .map(mediaItem -> SearchDtos.MediaResult.builder()
                        .id(mediaItem.getId())
                        .mediaUrl(buildFileUrl(mediaItem.getMediaUrl()))
                        .mediaType(mediaItem.getMediaType().name())
                        .createdAt(mediaItem.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return SearchDtos.PostSearchResult.builder()
                .id(post.getId())
                .content(post.getContent())
                .visibility(post.getVisibility())
                .authorId(post.getAuthor().getId())
                .authorUsername(post.getAuthor().getUsername())
                .authorDisplayName(post.getAuthor().getDisplayName())
                .authorAvatarUrl(buildFileUrl(post.getAuthor().getAvatarUrl()))
                .groupId(post.getGroup() != null ? post.getGroup().getId() : null)
                .groupName(post.getGroup() != null ? post.getGroup().getName() : null)
                .reactionCount(post.getReactionCount())
                .commentCount(post.getCommentCount())
                .shareCount(post.getShareCount())
                .createdAt(post.getCreatedAt())
                .media(media)
                .build();
    }

        private String buildFileUrl(String fileName) {
                if (fileName == null || fileName.trim().isEmpty()) {
                        return fileName;
                }

                if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
                        return fileName;
                }

                if (fileName.contains("/api/files/")) {
                        String path = fileName.substring(fileName.indexOf("/api/files/"));
                        return baseUrl + path;
                }

                if (!fileName.startsWith("/")) {
                        return baseUrl + "/api/files/posts/" + fileName;
                }

                return baseUrl + fileName;
        }
}

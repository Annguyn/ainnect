package com.ainnect.service.impl;

import com.ainnect.common.enums.FriendshipStatus;
import com.ainnect.dto.profile.EducationDtos;
import com.ainnect.dto.profile.InterestDtos;
import com.ainnect.dto.profile.LocationDtos;
import com.ainnect.dto.profile.ProfileDtos;
import com.ainnect.dto.profile.WorkExperienceDtos;
import com.ainnect.entity.*;
import com.ainnect.repository.*;
import com.ainnect.service.FileStorageService;
import com.ainnect.service.ProfileService;
import com.ainnect.service.SocialService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final FriendshipRepository friendshipRepository;
    private final EducationRepository educationRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final InterestRepository interestRepository;
    private final UserLocationRepository userLocationRepository;
    private final SocialService socialService;
    private final FileStorageService fileStorageService;
    
    @org.springframework.beans.factory.annotation.Value("${app.file.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    @Cacheable(cacheNames = "profiles:user", key = "#userId + ':' + #currentUserId + ':' + #page + ':' + #size")
    public ProfileDtos.ProfileResponse getUserProfile(Long userId, Long currentUserId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isBlocked = socialService.isBlocked(currentUserId, userId);
        boolean isBlockedBy = socialService.isBlockedBy(currentUserId, userId);

        // If current user is blocked by the profile owner, they cannot view the profile
        if (isBlockedBy) {
            throw new IllegalArgumentException("Cannot view profile - user is blocked");
        }

        ProfileDtos.SocialStatsResponse socialStats = getUserSocialStats(userId, currentUserId);

        // Get all user data
        List<EducationDtos.Response> educations = getUserEducations(userId);
        List<WorkExperienceDtos.Response> workExperiences = getUserWorkExperiences(userId);
        List<InterestDtos.Response> interests = getUserInterests(userId);
        List<LocationDtos.Response> locations = getUserLocations(userId);
        
        // Get paginated posts
        Pageable pageable = PageRequest.of(page, size);
        ProfileDtos.ProfilePostsResponse posts = getUserPosts(userId, currentUserId, pageable);

        boolean isFollowing = socialService.isFollowing(currentUserId, userId);
        boolean isFollowedBy = socialService.isFollowing(userId, currentUserId);
        boolean isFriend = socialService.isFriend(currentUserId, userId);
        boolean canSendFriendRequest = socialService.canSendFriendRequest(currentUserId, userId);
        FriendshipStatus friendshipStatus = getFriendshipStatus(currentUserId, userId);

        // Build relationship response
        ProfileDtos.RelationshipResponse relationship = buildRelationshipResponse(
                isFollowing, isFollowedBy, isFriend, canSendFriendRequest, 
                friendshipStatus, isBlocked, isBlockedBy);

        return ProfileDtos.ProfileResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .bio(user.getBio())
                .avatarUrl(buildFileUrl(user.getAvatarUrl()))
                .coverUrl(buildFileUrl(user.getCoverUrl()))
                .location(user.getLocation())
                .website(null)
                .joinedAt(user.getCreatedAt())
                .isVerified(false)
                .isPrivate(false)
                .relationship(relationship)
                .socialStats(socialStats)
                .educations(educations)
                .workExperiences(workExperiences)
                .interests(interests)
                .locations(locations)
                .posts(posts)
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:educations", "profiles:work", "profiles:interests", "profiles:locations"}, allEntries = true)
    public ProfileDtos.ProfileUpdateResponse updateProfile(ProfileDtos.ProfileUpdateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setDisplayName(request.getDisplayName());
        user.setBio(request.getBio());
        user.setLocation(request.getLocation());
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);

        return ProfileDtos.ProfileUpdateResponse.builder()
                .userId(updatedUser.getId())
                .username(updatedUser.getUsername())
                .displayName(updatedUser.getDisplayName())
                .bio(updatedUser.getBio())
                .avatarUrl(buildFileUrl(updatedUser.getAvatarUrl()))
                .coverUrl(buildFileUrl(updatedUser.getCoverUrl()))
                .location(updatedUser.getLocation())
                .website(null)
                .isVerified(false)
                .isPrivate(false)
                .updatedAt(updatedUser.getUpdatedAt())
                .build();
    }

    @Override
    @Cacheable(cacheNames = "profiles:user-posts", key = "#userId + ':' + #currentUserId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + T(java.util.Objects).toString(#pageable.sort)")
    public ProfileDtos.ProfilePostsResponse getUserPosts(Long userId, Long currentUserId, Pageable pageable) {
        if (!canViewPosts(userId, currentUserId)) {
            throw new IllegalArgumentException("Cannot view posts - insufficient permissions");
        }

        Page<Post> postPage = postRepository.findVisiblePostsByAuthor(userId, currentUserId, pageable);
        List<ProfileDtos.PostResponse> posts = postPage.getContent().stream()
                .map(post -> toPostResponse(post, currentUserId))
                .collect(Collectors.toList());

        return ProfileDtos.ProfilePostsResponse.builder()
                .posts(posts)
                .currentPage(postPage.getNumber())
                .pageSize(postPage.getSize())
                .totalElements(postPage.getTotalElements())
                .totalPages(postPage.getTotalPages())
                .hasNext(postPage.hasNext())
                .hasPrevious(postPage.hasPrevious())
                .build();
    }

    @Override
    @Cacheable(cacheNames = "profiles:followers", key = "#userId + ':' + #currentUserId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public ProfileDtos.FollowersResponse getUserFollowers(Long userId, Long currentUserId, Pageable pageable) {
        if (!isProfileVisible(userId, currentUserId)) {
            throw new IllegalArgumentException("Cannot view followers - profile is private");
        }

        List<Follow> followers = followRepository.findByFollowee_IdOrderByCreatedAtDesc(userId);
        
        int start = pageable.getPageNumber() * pageable.getPageSize();
        int end = Math.min(start + pageable.getPageSize(), followers.size());
        List<Follow> pageFollowers = followers.subList(start, end);

        List<ProfileDtos.FollowerResponse> followerResponses = pageFollowers.stream()
                .map(follow -> toFollowerResponse(follow, currentUserId))
                .collect(Collectors.toList());

        return ProfileDtos.FollowersResponse.builder()
                .followers(followerResponses)
                .currentPage(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .totalElements((long) followers.size())
                .totalPages((int) Math.ceil((double) followers.size() / pageable.getPageSize()))
                .hasNext(end < followers.size())
                .hasPrevious(pageable.getPageNumber() > 0)
                .build();
    }

    @Override
    @Cacheable(cacheNames = "profiles:following", key = "#userId + ':' + #currentUserId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public ProfileDtos.FollowingResponse getUserFollowing(Long userId, Long currentUserId, Pageable pageable) {
        if (!isProfileVisible(userId, currentUserId)) {
            throw new IllegalArgumentException("Cannot view following - profile is private");
        }

        List<Follow> following = followRepository.findByFollower_IdOrderByCreatedAtDesc(userId);
        
        int start = pageable.getPageNumber() * pageable.getPageSize();
        int end = Math.min(start + pageable.getPageSize(), following.size());
        List<Follow> pageFollowing = following.subList(start, end);

        List<ProfileDtos.FollowingUserResponse> followingResponses = pageFollowing.stream()
                .map(follow -> toFollowingUserResponse(follow, currentUserId))
                .collect(Collectors.toList());

        return ProfileDtos.FollowingResponse.builder()
                .following(followingResponses)
                .currentPage(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .totalElements((long) following.size())
                .totalPages((int) Math.ceil((double) following.size() / pageable.getPageSize()))
                .hasNext(end < following.size())
                .hasPrevious(pageable.getPageNumber() > 0)
                .build();
    }

    @Override
    @Cacheable(cacheNames = "profiles:friends", key = "#userId + ':' + #currentUserId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public ProfileDtos.FriendsResponse getUserFriends(Long userId, Long currentUserId, Pageable pageable) {
        if (!isProfileVisible(userId, currentUserId)) {
            throw new IllegalArgumentException("Cannot view friends - profile is private");
        }

        List<Friendship> friendships = friendshipRepository.findByUserLow_IdOrUserHigh_IdAndStatus(userId, userId, FriendshipStatus.accepted);
        
        int start = pageable.getPageNumber() * pageable.getPageSize();
        int end = Math.min(start + pageable.getPageSize(), friendships.size());
        List<Friendship> pageFriendships = friendships.subList(start, end);

        List<ProfileDtos.FriendResponse> friendResponses = pageFriendships.stream()
                .map(friendship -> toFriendResponse(friendship, userId, currentUserId))
                .collect(Collectors.toList());

        return ProfileDtos.FriendsResponse.builder()
                .friends(friendResponses)
                .currentPage(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .totalElements((long) friendships.size())
                .totalPages((int) Math.ceil((double) friendships.size() / pageable.getPageSize()))
                .hasNext(end < friendships.size())
                .hasPrevious(pageable.getPageNumber() > 0)
                .build();
    }

    @Override
    @Cacheable(cacheNames = "profiles:social", key = "#userId + ':' + #currentUserId")
    public ProfileDtos.SocialStatsResponse getUserSocialStats(Long userId, Long currentUserId) {
        long followersCount = followRepository.countByFollowee_Id(userId);
        long followingCount = followRepository.countByFollower_Id(userId);
        long friendsCount = friendshipRepository.countByUserLow_IdOrUserHigh_IdAndStatus(userId, userId, FriendshipStatus.accepted);
        long postsCount = postRepository.countByAuthor_IdAndDeletedAtIsNull(userId);

        long likesCount = 0;
        long commentsCount = 0;
        long sharesCount = 0;

        return ProfileDtos.SocialStatsResponse.builder()
                .userId(userId)
                .followersCount(followersCount)
                .followingCount(followingCount)
                .friendsCount(friendsCount)
                .postsCount(postsCount)
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .sharesCount(sharesCount)
                .build();
    }

    @Override
    public boolean isProfileVisible(Long userId, Long currentUserId) {
        if (userId.equals(currentUserId)) {
            return true;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }

        return true;
    }

    @Override
    public boolean canViewPosts(Long userId, Long currentUserId) {
        if (userId.equals(currentUserId)) {
            return true;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }

        return true;
    }

    @SuppressWarnings("unused")
    private List<ProfileDtos.RecentPostResponse> getRecentPosts(Long userId, Long currentUserId, int limit) {
        if (!canViewPosts(userId, currentUserId)) {
            return List.of();
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, Math.max(1, limit));
        List<Post> recentPosts = postRepository.findLatestPostsByAuthor(userId, pageable);
        return recentPosts.stream()
                .map(post -> toRecentPostResponse(post, currentUserId))
                .collect(Collectors.toList());
    }

    private ProfileDtos.RecentPostResponse toRecentPostResponse(Post post, Long currentUserId) {
        return ProfileDtos.RecentPostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .mediaUrl(post.getMedia().isEmpty() ? null : buildFileUrl(post.getMedia().get(0).getMediaUrl()))
                .mediaType(post.getMedia().isEmpty() ? null : post.getMedia().get(0).getMediaType().name())
                .createdAt(post.getCreatedAt())
                .likesCount(post.getReactionCount())
                .commentsCount(post.getCommentCount())
                .sharesCount(post.getShareCount())
                .isLiked(false)
                .build();
    }

    private ProfileDtos.PostResponse toPostResponse(Post post, Long currentUserId) {
        List<ProfileDtos.MediaResponse> media = post.getMedia().stream()
                .map(this::toMediaResponse)
                .collect(Collectors.toList());

        return ProfileDtos.PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .media(media)
                .createdAt(post.getCreatedAt())
                .likesCount(post.getReactionCount())
                .commentsCount(post.getCommentCount())
                .sharesCount(post.getShareCount())
                .isLiked(false)
                .isBookmarked(false)
                .build();
    }

    private ProfileDtos.MediaResponse toMediaResponse(PostMedia postMedia) {
        return ProfileDtos.MediaResponse.builder()
                .id(postMedia.getId())
                .mediaUrl(buildFileUrl(postMedia.getMediaUrl()))
                .mediaType(postMedia.getMediaType().name())
                .fileName(null)
                .fileSize(null)
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

    private ProfileDtos.FollowerResponse toFollowerResponse(Follow follow, Long currentUserId) {
        User follower = follow.getFollower();
        boolean isFollowing = socialService.isFollowing(currentUserId, follower.getId());
        boolean isFollowedBy = socialService.isFollowing(follower.getId(), currentUserId);
        boolean isFriend = socialService.isFriend(currentUserId, follower.getId());
        boolean canSendFriendRequest = socialService.canSendFriendRequest(currentUserId, follower.getId());
        FriendshipStatus friendshipStatus = getFriendshipStatus(currentUserId, follower.getId());

        return ProfileDtos.FollowerResponse.builder()
                .userId(follower.getId())
                .username(follower.getUsername())
                .displayName(follower.getDisplayName())
        .avatarUrl(buildFileUrl(follower.getAvatarUrl()))
                .bio(follower.getBio())
                .isVerified(false)
                .isFollowing(isFollowing)
                .isFollowedBy(isFollowedBy)
                .isFriend(isFriend)
                .canSendFriendRequest(canSendFriendRequest)
                .friendshipStatus(friendshipStatus)
                .followedAt(follow.getCreatedAt())
                .build();
    }

    private ProfileDtos.FollowingUserResponse toFollowingUserResponse(Follow follow, Long currentUserId) {
        User following = follow.getFollowee();
        boolean isFollowing = socialService.isFollowing(currentUserId, following.getId());
        boolean isFollowedBy = socialService.isFollowing(following.getId(), currentUserId);
        boolean isFriend = socialService.isFriend(currentUserId, following.getId());
        boolean canSendFriendRequest = socialService.canSendFriendRequest(currentUserId, following.getId());
        FriendshipStatus friendshipStatus = getFriendshipStatus(currentUserId, following.getId());

        return ProfileDtos.FollowingUserResponse.builder()
                .userId(following.getId())
                .username(following.getUsername())
                .displayName(following.getDisplayName())
        .avatarUrl(buildFileUrl(following.getAvatarUrl()))
                .bio(following.getBio())
                .isVerified(false)
                .isFollowing(isFollowing)
                .isFollowedBy(isFollowedBy)
                .isFriend(isFriend)
                .canSendFriendRequest(canSendFriendRequest)
                .friendshipStatus(friendshipStatus)
                .followedAt(follow.getCreatedAt())
                .build();
    }

    private ProfileDtos.FriendResponse toFriendResponse(Friendship friendship, Long userId, Long currentUserId) {
        User friend = friendship.getUserLow().getId().equals(userId) ? friendship.getUserHigh() : friendship.getUserLow();
        boolean isFollowing = socialService.isFollowing(currentUserId, friend.getId());
        boolean isFollowedBy = socialService.isFollowing(friend.getId(), currentUserId);

        return ProfileDtos.FriendResponse.builder()
                .userId(friend.getId())
                .username(friend.getUsername())
                .displayName(friend.getDisplayName())
        .avatarUrl(buildFileUrl(friend.getAvatarUrl()))
                .bio(friend.getBio())
                .isVerified(false)
                .isFollowing(isFollowing)
                .isFollowedBy(isFollowedBy)
                .isFriend(true)
                .friendsSince(friendship.getCreatedAt())
                .lastActiveAt(null)
                .build();
    }

    private FriendshipStatus getFriendshipStatus(Long userId1, Long userId2) {
        if (userId1.equals(userId2)) {
            return null;
        }

        List<Friendship> friendships = friendshipRepository.findByUserLow_IdOrUserHigh_Id(userId1, userId2);
        for (Friendship friendship : friendships) {
            if ((friendship.getUserLow().getId().equals(userId1) && friendship.getUserHigh().getId().equals(userId2)) ||
                (friendship.getUserLow().getId().equals(userId2) && friendship.getUserHigh().getId().equals(userId1))) {
                return friendship.getStatus();
            }
        }

        return null;
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:educations"}, allEntries = true)
    public EducationDtos.Response createEducation(EducationDtos.CreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Education education = Education.builder()
                .user(user)
                .schoolName(request.getSchoolName())
                .degree(request.getDegree())
                .fieldOfStudy(request.getFieldOfStudy())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(request.getIsCurrent())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        Education savedEducation = educationRepository.save(education);
        return toEducationResponse(savedEducation);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:educations"}, allEntries = true)
    public EducationDtos.Response updateEducation(Long educationId, EducationDtos.UpdateRequest request, Long userId) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new IllegalArgumentException("Education not found"));

        if (!education.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own education");
        }

        education.setSchoolName(request.getSchoolName());
        education.setDegree(request.getDegree());
        education.setFieldOfStudy(request.getFieldOfStudy());
        education.setStartDate(request.getStartDate());
        education.setEndDate(request.getEndDate());
        education.setIsCurrent(request.getIsCurrent());
        education.setDescription(request.getDescription());
        // Only update imageUrl if a new image was uploaded
        if (request.getImageUrl() != null) {
            // Delete old image file if it exists
            try {
                String oldImageUrl = education.getImageUrl();
                if (oldImageUrl != null && oldImageUrl.contains("/api/files/")) {
                    String filePath = oldImageUrl.substring(oldImageUrl.indexOf("/api/files/") + 11); // Remove "/api/files/" prefix
                    fileStorageService.deleteFile(filePath);
                }
            } catch (Exception e) {
                // Log error but continue with update
                log.error("Error deleting old education image file: {}", e.getMessage());
            }
            education.setImageUrl(request.getImageUrl());
        }

        Education savedEducation = educationRepository.save(education);
        return toEducationResponse(savedEducation);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:educations"}, allEntries = true)
    public void deleteEducation(Long educationId, Long userId) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new IllegalArgumentException("Education not found"));

        if (!education.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own education");
        }

        // Delete associated image file from file system
        try {
            String imageUrl = education.getImageUrl();
            if (imageUrl != null && imageUrl.contains("/api/files/")) {
                String filePath = imageUrl.substring(imageUrl.indexOf("/api/files/") + 11); // Remove "/api/files/" prefix
                fileStorageService.deleteFile(filePath);
            }
        } catch (Exception e) {
            // Log error but continue with deletion
            log.error("Error deleting education image file: {}", e.getMessage());
        }

        education.setDeletedAt(LocalDateTime.now());
        educationRepository.save(education);
    }

    @Override
    @Cacheable(cacheNames = "profiles:educations", key = "#userId")
    public List<EducationDtos.Response> getUserEducations(Long userId) {
        List<Education> educations = educationRepository.findByUserIdAndDeletedAtIsNullOrderByStartDateDesc(userId);
        return educations.stream()
                .map(this::toEducationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:work"}, allEntries = true)
    public WorkExperienceDtos.Response createWorkExperience(WorkExperienceDtos.CreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        WorkExperience workExperience = WorkExperience.builder()
                .user(user)
                .companyName(request.getCompanyName())
                .position(request.getPosition())
                .location(request.getLocation())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(request.getIsCurrent())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        WorkExperience savedWorkExperience = workExperienceRepository.save(workExperience);
        return toWorkExperienceResponse(savedWorkExperience);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:work"}, allEntries = true)
    public WorkExperienceDtos.Response updateWorkExperience(Long workExperienceId, WorkExperienceDtos.UpdateRequest request, Long userId) {
        WorkExperience workExperience = workExperienceRepository.findById(workExperienceId)
                .orElseThrow(() -> new IllegalArgumentException("Work experience not found"));

        if (!workExperience.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own work experience");
        }

        workExperience.setCompanyName(request.getCompanyName());
        workExperience.setPosition(request.getPosition());
        workExperience.setLocation(request.getLocation());
        workExperience.setStartDate(request.getStartDate());
        workExperience.setEndDate(request.getEndDate());
        workExperience.setIsCurrent(request.getIsCurrent());
        workExperience.setDescription(request.getDescription());
        // Only update imageUrl if a new image was uploaded
        if (request.getImageUrl() != null) {
            // Delete old image file if it exists
            try {
                String oldImageUrl = workExperience.getImageUrl();
                if (oldImageUrl != null && oldImageUrl.contains("/api/files/")) {
                    String filePath = oldImageUrl.substring(oldImageUrl.indexOf("/api/files/") + 11); // Remove "/api/files/" prefix
                    fileStorageService.deleteFile(filePath);
                }
            } catch (Exception e) {
                // Log error but continue with update
                log.error("Error deleting old work experience image file: {}", e.getMessage());
            }
            workExperience.setImageUrl(request.getImageUrl());
        }

        WorkExperience savedWorkExperience = workExperienceRepository.save(workExperience);
        return toWorkExperienceResponse(savedWorkExperience);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:work"}, allEntries = true)
    public void deleteWorkExperience(Long workExperienceId, Long userId) {
        WorkExperience workExperience = workExperienceRepository.findById(workExperienceId)
                .orElseThrow(() -> new IllegalArgumentException("Work experience not found"));

        if (!workExperience.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own work experience");
        }

        // Delete associated image file from file system
        try {
            String imageUrl = workExperience.getImageUrl();
            if (imageUrl != null && imageUrl.contains("/api/files/")) {
                String filePath = imageUrl.substring(imageUrl.indexOf("/api/files/") + 11); // Remove "/api/files/" prefix
                fileStorageService.deleteFile(filePath);
            }
        } catch (Exception e) {
            // Log error but continue with deletion
            log.error("Error deleting work experience image file: {}", e.getMessage());
        }

        workExperience.setDeletedAt(LocalDateTime.now());
        workExperienceRepository.save(workExperience);
    }

    @Override
    @Cacheable(cacheNames = "profiles:work", key = "#userId")
    public List<WorkExperienceDtos.Response> getUserWorkExperiences(Long userId) {
        List<WorkExperience> workExperiences = workExperienceRepository.findByUserIdAndDeletedAtIsNullOrderByStartDateDesc(userId);
        return workExperiences.stream()
                .map(this::toWorkExperienceResponse)
                .collect(Collectors.toList());
    }

    private EducationDtos.Response toEducationResponse(Education education) {
        return EducationDtos.Response.builder()
                .id(education.getId())
                .schoolName(education.getSchoolName())
                .degree(education.getDegree())
                .fieldOfStudy(education.getFieldOfStudy())
                .startDate(education.getStartDate())
                .endDate(education.getEndDate())
                .isCurrent(education.getIsCurrent())
                .description(education.getDescription())
                .imageUrl(education.getImageUrl())
                .createdAt(education.getCreatedAt())
                .updatedAt(education.getUpdatedAt())
                .build();
    }

    private WorkExperienceDtos.Response toWorkExperienceResponse(WorkExperience workExperience) {
        return WorkExperienceDtos.Response.builder()
                .id(workExperience.getId())
                .companyName(workExperience.getCompanyName())
                .position(workExperience.getPosition())
                .location(workExperience.getLocation())
                .startDate(workExperience.getStartDate())
                .endDate(workExperience.getEndDate())
                .isCurrent(workExperience.getIsCurrent())
                .description(workExperience.getDescription())
                .imageUrl(workExperience.getImageUrl())
                .createdAt(workExperience.getCreatedAt())
                .updatedAt(workExperience.getUpdatedAt())
                .build();
    }

    // Interest management methods
    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:interests"}, allEntries = true)
    public InterestDtos.Response createInterest(InterestDtos.CreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Interest interest = Interest.builder()
                .user(user)
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        Interest savedInterest = interestRepository.save(interest);
        return toInterestResponse(savedInterest);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:interests"}, allEntries = true)
    public InterestDtos.Response updateInterest(Long interestId, InterestDtos.UpdateRequest request, Long userId) {
        Interest interest = interestRepository.findById(interestId)
                .orElseThrow(() -> new IllegalArgumentException("Interest not found"));

        if (!interest.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own interests");
        }

        if (request.getName() != null) {
            interest.setName(request.getName());
        }
        if (request.getCategory() != null) {
            interest.setCategory(request.getCategory());
        }
        if (request.getDescription() != null) {
            interest.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            interest.setImageUrl(request.getImageUrl());
        }

        Interest updatedInterest = interestRepository.save(interest);
        return toInterestResponse(updatedInterest);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:interests"}, allEntries = true)
    public void deleteInterest(Long interestId, Long userId) {
        Interest interest = interestRepository.findById(interestId)
                .orElseThrow(() -> new IllegalArgumentException("Interest not found"));

        if (!interest.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own interests");
        }

        interest.setDeletedAt(LocalDateTime.now());
        interestRepository.save(interest);
    }

    @Override
    @Cacheable(cacheNames = "profiles:interests", key = "#userId")
    public List<InterestDtos.Response> getUserInterests(Long userId) {
        List<Interest> interests = interestRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId);
        return interests.stream()
                .map(this::toInterestResponse)
                .collect(Collectors.toList());
    }

    // Location management methods
    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:locations"}, allEntries = true)
    public LocationDtos.Response createLocation(LocationDtos.CreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserLocation location = UserLocation.builder()
                .user(user)
                .locationName(request.getLocationName())
                .locationType(request.getLocationType())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .isCurrent(request.getIsCurrent() != null ? request.getIsCurrent() : false)
                .build();

        UserLocation savedLocation = userLocationRepository.save(location);
        return toLocationResponse(savedLocation);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:locations"}, allEntries = true)
    public LocationDtos.Response updateLocation(Long locationId, LocationDtos.UpdateRequest request, Long userId) {
        UserLocation location = userLocationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found"));

        if (!location.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own locations");
        }

        if (request.getLocationName() != null) {
            location.setLocationName(request.getLocationName());
        }
        if (request.getLocationType() != null) {
            location.setLocationType(request.getLocationType());
        }
        if (request.getAddress() != null) {
            location.setAddress(request.getAddress());
        }
        if (request.getLatitude() != null) {
            location.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            location.setLongitude(request.getLongitude());
        }
        if (request.getDescription() != null) {
            location.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            location.setImageUrl(request.getImageUrl());
        }
        if (request.getIsCurrent() != null) {
            location.setIsCurrent(request.getIsCurrent());
        }

        UserLocation updatedLocation = userLocationRepository.save(location);
        return toLocationResponse(updatedLocation);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"profiles:user", "profiles:user-posts", "profiles:social", "profiles:followers", "profiles:following", "profiles:friends", "profiles:locations"}, allEntries = true)
    public void deleteLocation(Long locationId, Long userId) {
        UserLocation location = userLocationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found"));

        if (!location.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own locations");
        }

        location.setDeletedAt(LocalDateTime.now());
        userLocationRepository.save(location);
    }

    @Override
    @Cacheable(cacheNames = "profiles:locations", key = "#userId")
    public List<LocationDtos.Response> getUserLocations(Long userId) {
        List<UserLocation> locations = userLocationRepository.findByUserIdAndDeletedAtIsNullOrderByIsCurrentDescCreatedAtDesc(userId);
        return locations.stream()
                .map(this::toLocationResponse)
                .collect(Collectors.toList());
    }

    private InterestDtos.Response toInterestResponse(Interest interest) {
        return InterestDtos.Response.builder()
                .id(interest.getId())
                .name(interest.getName())
                .category(interest.getCategory())
                .description(interest.getDescription())
                .imageUrl(interest.getImageUrl())
                .createdAt(interest.getCreatedAt())
                .updatedAt(interest.getUpdatedAt())
                .build();
    }

    private LocationDtos.Response toLocationResponse(UserLocation location) {
        return LocationDtos.Response.builder()
                .id(location.getId())
                .locationName(location.getLocationName())
                .locationType(location.getLocationType())
                .address(location.getAddress())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .description(location.getDescription())
                .imageUrl(location.getImageUrl())
                .isCurrent(location.getIsCurrent())
                .createdAt(location.getCreatedAt())
                .updatedAt(location.getUpdatedAt())
                .build();
    }

    private ProfileDtos.RelationshipResponse buildRelationshipResponse(
            boolean isFollowing, boolean isFollowedBy, boolean isFriend, 
            boolean canSendFriendRequest, FriendshipStatus friendshipStatus,
            boolean isBlocked, boolean isBlockedBy) {
        
        boolean isMutualFollow = isFollowing && isFollowedBy;
        
        String relationshipStatus;
        String actionAvailable;
        
        if (isBlocked || isBlockedBy) {
            relationshipStatus = "blocked";
            actionAvailable = isBlocked ? "unblock" : "none";
        } else if (isFriend) {
            relationshipStatus = "friends";
            actionAvailable = "remove_friend";
        } else if (friendshipStatus == FriendshipStatus.pending) {
            if (canSendFriendRequest) {
                relationshipStatus = "request_sent";
                actionAvailable = "cancel_friend_request";
            } else {
                relationshipStatus = "pending_request";
                actionAvailable = "accept_friend_request";
            }
        } else if (isFollowing && isFollowedBy) {
            relationshipStatus = "mutual_follow";
            actionAvailable = "unfollow";
        } else if (isFollowing) {
            relationshipStatus = "following";
            actionAvailable = "unfollow";
        } else if (isFollowedBy) {
            relationshipStatus = "followers";
            actionAvailable = "follow";
        } else if (canSendFriendRequest) {
            relationshipStatus = "none";
            actionAvailable = "send_friend_request";
        } else {
            relationshipStatus = "none";
            actionAvailable = "follow";
        }
        
        return ProfileDtos.RelationshipResponse.builder()
                .isFollowing(isFollowing)
                .isFollowedBy(isFollowedBy)
                .isMutualFollow(isMutualFollow)
                .isFriend(isFriend)
                .canSendFriendRequest(canSendFriendRequest)
                .friendshipStatus(friendshipStatus)
                .isBlocked(isBlocked)
                .isBlockedBy(isBlockedBy)
                .relationshipStatus(relationshipStatus)
                .actionAvailable(actionAvailable)
                .build();
    }
}
package com.ainnect.service.impl;

import com.ainnect.common.enums.FriendshipStatus;
import com.ainnect.dto.social.SocialDtos;
import com.ainnect.entity.*;
import com.ainnect.repository.*;
import com.ainnect.service.SocialService;
import com.ainnect.service.NotificationIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SocialServiceImpl implements SocialService {

    private final FollowRepository followRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserBlockRepository userBlockRepository;
    private final ShareRepository shareRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReportRepository reportRepository;
        private final NotificationIntegrationService notificationIntegrationService;

    @Override
    @Transactional
    public SocialDtos.SocialActionResponse followUser(Long followerId, Long followeeId) {
        try {
            if (isFollowing(followerId, followeeId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("follow")
                        .message("Already following this user")
                        .success(false)
                        .data(null)
                        .build();
            }

            if (followerId.equals(followeeId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("follow")
                        .message("Cannot follow yourself")
                        .success(false)
                        .data(null)
                        .build();
            }

            if (isBlockedBy(followerId, followeeId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("follow")
                        .message("Cannot follow this user - you have been blocked")
                        .success(false)
                        .data(null)
                        .build();
            }
            
            if (isBlocked(followerId, followeeId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("follow")
                        .message("Cannot follow this user - you have blocked this user")
                        .success(false)
                        .data(null)
                        .build();
            }

            User follower = userRepository.findById(followerId)
                    .orElseThrow(() -> new IllegalArgumentException("Follower not found"));
            User followee = userRepository.findById(followeeId)
                    .orElseThrow(() -> new IllegalArgumentException("Followee not found"));

            FollowId followId = new FollowId(followerId, followeeId);
            Follow follow = Follow.builder()
                    .id(followId)
                    .follower(follower)
                    .followee(followee)
                    .createdAt(LocalDateTime.now())
                    .build();

            followRepository.save(follow);

            return SocialDtos.SocialActionResponse.builder()
                    .action("follow")
                    .message("Successfully followed user")
                    .success(true)
                    .data(toFollowResponse(follow))
                    .build();

        } catch (Exception e) {
            log.error("Error following user: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("follow")
                    .message("Failed to follow user: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional
    public SocialDtos.SocialActionResponse unfollowUser(Long followerId, Long followeeId) {
        try {
            FollowId followId = new FollowId(followerId, followeeId);
            Optional<Follow> followOpt = followRepository.findById(followId);

            if (followOpt.isEmpty()) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("unfollow")
                        .message("Not following this user")
                        .success(false)
                        .data(null)
                        .build();
            }

            followRepository.delete(followOpt.get());

            return SocialDtos.SocialActionResponse.builder()
                    .action("unfollow")
                    .message("Successfully unfollowed user")
                    .success(true)
                    .data(null)
                    .build();

        } catch (Exception e) {
            log.error("Error unfollowing user: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("unfollow")
                    .message("Failed to unfollow user: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SocialDtos.FollowListResponse getFollowers(Long userId, int page, int size) {
        List<Follow> allFollows = followRepository.findByFollowee_Id(userId);
        return createFollowListResponse(allFollows, page, size, true);
    }

    @Override
    @Transactional(readOnly = true)
    public SocialDtos.FollowListResponse getFollowing(Long userId, int page, int size) {
        List<Follow> allFollows = followRepository.findByFollower_Id(userId);
        return createFollowListResponse(allFollows, page, size, false);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long followeeId) {
        FollowId followId = new FollowId(followerId, followeeId);
        return followRepository.existsById(followId);
    }

    @Override
    @Transactional
    public SocialDtos.SocialActionResponse sendFriendRequest(Long requesterId, Long friendId) {
        try {
            // Check self-reference first - cannot send friend request to yourself
            if (requesterId.equals(friendId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("friend_request")
                        .message("Cannot send friend request to yourself")
                        .success(false)
                        .data(null)
                        .build();
            }

            if (isFriend(requesterId, friendId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("friend_request")
                        .message("Friend request already exists or already friends")
                        .success(false)
                        .data(null)
                        .build();
            }

            if (isBlockedBy(requesterId, friendId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("friend_request")
                        .message("Cannot send friend request - you have been blocked by this user")
                        .success(false)
                        .data(null)
                        .build();
            }
            
            if (isBlocked(requesterId, friendId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("friend_request")
                        .message("Cannot send friend request - you have blocked this user")
                        .success(false)
                        .data(null)
                        .build();
            }

            // Check requester status first - deactivated users cannot send friend requests
            User requester = userRepository.findById(requesterId)
                    .orElseThrow(() -> new IllegalArgumentException("Requester not found"));
            
            if (requester.getIsActive() == null || !requester.getIsActive() || requester.getDeletedAt() != null) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("friend_request")
                        .message("Cannot send friend request - user is deactivated")
                        .success(false)
                        .data(null)
                        .build();
            }

            // Check friend status - cannot send friend request to deactivated users
            User friend = userRepository.findById(friendId)
                    .orElseThrow(() -> new IllegalArgumentException("Friend not found"));
            
            if (friend.getIsActive() == null || !friend.getIsActive() || friend.getDeletedAt() != null) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("friend_request")
                        .message("Cannot send friend request - user is deactivated")
                        .success(false)
                        .data(null)
                        .build();
            }

            Long userIdLow = Math.min(requesterId, friendId);
            Long userIdHigh = Math.max(requesterId, friendId);

            FriendshipId friendshipId = new FriendshipId(userIdLow, userIdHigh);
            Optional<Friendship> existingFriendshipOpt = friendshipRepository.findById(friendshipId);
            
            if (existingFriendshipOpt.isPresent()) {
                Friendship existingFriendship = existingFriendshipOpt.get();
                
                if (existingFriendship.getStatus() == FriendshipStatus.pending 
                        && existingFriendship.getRequestedBy().getId().equals(friendId)) {
                    existingFriendship.setStatus(FriendshipStatus.accepted);
                    existingFriendship.setUpdatedAt(LocalDateTime.now());
                    existingFriendship.setRespondedAt(LocalDateTime.now());
                    friendshipRepository.save(existingFriendship);

                    try {
                        notificationIntegrationService.handleFriendAccept(requesterId, friendId);
                    } catch (Exception ignored) {}

                    return SocialDtos.SocialActionResponse.builder()
                            .action("friend_request")
                            .message("Friend request sent successfully")
                            .success(true)
                            .data(toFriendshipResponse(existingFriendship, requesterId))
                            .build();
                } else if (existingFriendship.getStatus() == FriendshipStatus.pending 
                        && existingFriendship.getRequestedBy().getId().equals(requesterId)) {
                    // Same direction request already exists
                    return SocialDtos.SocialActionResponse.builder()
                            .action("friend_request")
                            .message("Friend request already exists or already friends")
                            .success(false)
                            .data(null)
                            .build();
                }
            }

            // Create new friend request
            Friendship friendship = Friendship.builder()
                    .id(friendshipId)
                    .userLow(userIdLow.equals(requesterId) ? requester : friend)
                    .userHigh(userIdHigh.equals(requesterId) ? requester : friend)
                    .status(FriendshipStatus.pending)
                    .requestedBy(requester)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            friendshipRepository.save(friendship);

            try {
                notificationIntegrationService.handleFriendRequest(requesterId, friendId);
            } catch (Exception ignored) {}

            return SocialDtos.SocialActionResponse.builder()
                    .action("friend_request")
                    .message("Friend request sent successfully")
                    .success(true)
                    .data(toFriendshipResponse(friendship, requesterId))
                    .build();

        } catch (IllegalArgumentException e) {
            log.error("Error sending friend request: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("friend_request")
                    .message("Requester not found or Friend not found")
                    .success(false)
                    .data(null)
                    .build();
        } catch (Exception e) {
            log.error("Error sending friend request: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("friend_request")
                    .message("Failed to send friend request: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional
    public SocialDtos.SocialActionResponse acceptFriendRequest(Long userId, Long friendshipId) {
        try {
            Long userIdLowForAccept = Math.min(userId, friendshipId);
            Long userIdHighForAccept = Math.max(userId, friendshipId);
            FriendshipId compositeIdForAccept = new FriendshipId(userIdLowForAccept, userIdHighForAccept);
            Optional<Friendship> friendshipOpt = friendshipRepository.findById(compositeIdForAccept);
            
            if (friendshipOpt.isEmpty()) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("accept_friend")
                        .message("Friend request not found")
                        .success(false)
                        .data(null)
                        .build();
            }
            
            Friendship friendship = friendshipOpt.get();
            
            if (!friendship.getUserHigh().getId().equals(userId) && !friendship.getUserLow().getId().equals(userId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("accept_friend")
                        .message("You are not authorized to accept this friend request")
                        .success(false)
                        .data(null)
                        .build();
            }
            
            if (friendship.getStatus() != FriendshipStatus.pending) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("accept_friend")
                        .message("Friend request is no longer pending")
                        .success(false)
                        .data(null)
                        .build();
            }
            
            friendship.setStatus(FriendshipStatus.accepted);
            friendship.setUpdatedAt(LocalDateTime.now());
            friendshipRepository.save(friendship);

                        try {
                                if (friendship.getRequestedBy() != null) {
                                        Long requesterId = friendship.getRequestedBy().getId();
                                        notificationIntegrationService.handleFriendAccept(userId, requesterId);
                                }
                        } catch (Exception ignored) {}
            
            return SocialDtos.SocialActionResponse.builder()
                    .action("accept_friend")
                    .message("Friend request accepted successfully")
                    .success(true)
                    .data(toFriendshipResponse(friendship, userId))
                    .build();
                    
        } catch (Exception e) {
            log.error("Error accepting friend request: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("accept_friend")
                    .message("Failed to accept friend request: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional
    public SocialDtos.SocialActionResponse rejectFriendRequest(Long userId, Long friendshipId) {
        try {
            Long userIdLowForReject = Math.min(userId, friendshipId);
            Long userIdHighForReject = Math.max(userId, friendshipId);
            FriendshipId compositeIdForReject = new FriendshipId(userIdLowForReject, userIdHighForReject);
            Optional<Friendship> friendshipOpt = friendshipRepository.findById(compositeIdForReject);
            
            if (friendshipOpt.isEmpty()) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("reject_friend")
                        .message("Friend request not found")
                        .success(false)
                        .data(null)
                        .build();
            }
            
            Friendship friendship = friendshipOpt.get();
            
            // Check if the user is authorized to reject this request
            if (!friendship.getUserHigh().getId().equals(userId) && !friendship.getUserLow().getId().equals(userId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("reject_friend")
                        .message("You are not authorized to reject this friend request")
                        .success(false)
                        .data(null)
                        .build();
            }
            
            // Check if the request is still pending
            if (friendship.getStatus() != FriendshipStatus.pending) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("reject_friend")
                        .message("Friend request is no longer pending")
                        .success(false)
                        .data(null)
                        .build();
            }
            
            // Delete the friend request (reject)
            friendshipRepository.delete(friendship);
            
            return SocialDtos.SocialActionResponse.builder()
                    .action("reject_friend")
                    .message("Friend request rejected successfully")
                    .success(true)
                    .data(null)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error rejecting friend request: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("reject_friend")
                    .message("Failed to reject friend request: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional
    public SocialDtos.SocialActionResponse removeFriend(Long userId, Long friendId) {
        try {
            Long userIdLow = Math.min(userId, friendId);
            Long userIdHigh = Math.max(userId, friendId);
            FriendshipId friendshipId = new FriendshipId(userIdLow, userIdHigh);

            Optional<Friendship> friendshipOpt = friendshipRepository.findById(friendshipId);
            if (friendshipOpt.isEmpty()) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("remove_friend")
                        .message("Friendship not found")
                        .success(false)
                        .data(null)
                        .build();
            }

            friendshipRepository.delete(friendshipOpt.get());

            return SocialDtos.SocialActionResponse.builder()
                    .action("remove_friend")
                    .message("Friend removed successfully")
                    .success(true)
                    .data(null)
                    .build();

        } catch (Exception e) {
            log.error("Error removing friend: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("remove_friend")
                    .message("Failed to remove friend: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SocialDtos.FriendshipListResponse getFriends(Long userId, int page, int size) {
        List<Friendship> allFriendships = friendshipRepository.findByUserLow_IdOrUserHigh_Id(userId, userId);
        List<Friendship> acceptedFriendships = allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.accepted)
                .toList();
        return createFriendshipListResponse(acceptedFriendships, page, size, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public SocialDtos.FriendshipListResponse getFriendRequests(Long userId, int page, int size) {
        List<Friendship> allFriendships = friendshipRepository.findByUserLow_IdOrUserHigh_Id(userId, userId);
        List<Friendship> pendingRequests = allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.pending && !f.getRequestedBy().getId().equals(userId))
                .toList();
        return createFriendshipListResponse(pendingRequests, page, size, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public SocialDtos.FriendshipListResponse getSentFriendRequests(Long userId, int page, int size) {
        List<Friendship> allFriendships = friendshipRepository.findByUserLow_IdOrUserHigh_Id(userId, userId);
        List<Friendship> sentRequests = allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.pending && f.getRequestedBy().getId().equals(userId))
                .toList();
        return createFriendshipListResponse(sentRequests, page, size, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFriend(Long userId1, Long userId2) {
        Long userIdLow = Math.min(userId1, userId2);
        Long userIdHigh = Math.max(userId1, userId2);
        FriendshipId friendshipId = new FriendshipId(userIdLow, userIdHigh);
        Optional<Friendship> friendship = friendshipRepository.findById(friendshipId);
        return friendship.isPresent() && friendship.get().getStatus() == FriendshipStatus.accepted;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPendingFriendRequest(Long requesterId, Long friendId) {
        Long userIdLow = Math.min(requesterId, friendId);
        Long userIdHigh = Math.max(requesterId, friendId);
        FriendshipId friendshipId = new FriendshipId(userIdLow, userIdHigh);
        Optional<Friendship> friendship = friendshipRepository.findById(friendshipId);
        return friendship.isPresent() && friendship.get().getStatus() == FriendshipStatus.pending;
    }

    // Block operations
    @Override
    @Transactional
    public SocialDtos.SocialActionResponse blockUser(Long blockerId, Long blockedUserId, String reason) {
        try {
            // Check if already blocked
            if (isBlocked(blockerId, blockedUserId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("block")
                        .message("User already blocked")
                        .success(false)
                        .data(null)
                        .build();
            }

            // Check if trying to block self
            if (blockerId.equals(blockedUserId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("block")
                        .message("Cannot block yourself")
                        .success(false)
                        .data(null)
                        .build();
            }

            User blocker = userRepository.findById(blockerId)
                    .orElseThrow(() -> new IllegalArgumentException("Blocker not found"));
            User blocked = userRepository.findById(blockedUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Blocked user not found"));

            // Remove any existing follow relationships
            FollowId followId1 = new FollowId(blockerId, blockedUserId);
            FollowId followId2 = new FollowId(blockedUserId, blockerId);
            followRepository.deleteById(followId1);
            followRepository.deleteById(followId2);

            // Remove any existing friendship
            Long userIdLow = Math.min(blockerId, blockedUserId);
            Long userIdHigh = Math.max(blockerId, blockedUserId);
            FriendshipId friendshipId = new FriendshipId(userIdLow, userIdHigh);
            friendshipRepository.deleteById(friendshipId);

            UserBlock userBlock = UserBlock.builder()
                    .blocker(blocker)
                    .blocked(blocked)
                    .reason(reason)
                    .build();

            userBlockRepository.save(userBlock);

            return SocialDtos.SocialActionResponse.builder()
                    .action("block")
                    .message("User blocked successfully")
                    .success(true)
                    .data(toBlockResponse(userBlock))
                    .build();

        } catch (Exception e) {
            log.error("Error blocking user: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("block")
                    .message("Failed to block user: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional
    public SocialDtos.SocialActionResponse unblockUser(Long blockerId, Long blockedUserId) {
        try {
            User blocker = userRepository.findById(blockerId)
                    .orElseThrow(() -> new IllegalArgumentException("Blocker not found"));
            User blocked = userRepository.findById(blockedUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Blocked user not found"));

            Optional<UserBlock> userBlockOpt = userBlockRepository.findByBlockerAndBlocked(blocker, blocked);
            if (userBlockOpt.isEmpty()) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("unblock")
                        .message("User not blocked")
                        .success(false)
                        .data(null)
                        .build();
            }

            userBlockRepository.delete(userBlockOpt.get());

            return SocialDtos.SocialActionResponse.builder()
                    .action("unblock")
                    .message("User unblocked successfully")
                    .success(true)
                    .data(null)
                    .build();

        } catch (Exception e) {
            log.error("Error unblocking user: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("unblock")
                    .message("Failed to unblock user: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SocialDtos.BlockListResponse getBlockedUsers(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        List<UserBlock> allBlocks = userBlockRepository.findByBlockerOrderByCreatedAtDesc(user, null).getContent();
        return createBlockListResponse(allBlocks, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isBlocked(Long blockerId, Long blockedId) {
        User blocker = userRepository.findById(blockerId).orElse(null);
        User blocked = userRepository.findById(blockedId).orElse(null);
        if (blocker == null || blocked == null) return false;
        return userBlockRepository.existsByBlockerAndBlocked(blocker, blocked);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isBlockedBy(Long userId, Long otherUserId) {
        User user = userRepository.findById(userId).orElse(null);
        User otherUser = userRepository.findById(otherUserId).orElse(null);
        if (user == null || otherUser == null) return false;
        return userBlockRepository.existsByBlockerAndBlocked(otherUser, user);
    }

    // Share operations
    @Override
    @Transactional
    public SocialDtos.SocialActionResponse sharePost(Long userId, Long postId, String comment) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new IllegalArgumentException("Post not found"));

            Share share = Share.builder()
                    .post(post)
                    .byUser(user)
                    .comment(comment)
                    .build();

            shareRepository.save(share);

            return SocialDtos.SocialActionResponse.builder()
                    .action("share")
                    .message("Post shared successfully")
                    .success(true)
                    .data(toShareResponse(share))
                    .build();

        } catch (Exception e) {
            log.error("Error sharing post: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("share")
                    .message("Failed to share post: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional
    public SocialDtos.SocialActionResponse deleteShare(Long userId, Long shareId) {
        try {
            Optional<Share> shareOpt = shareRepository.findById(shareId);
            if (shareOpt.isEmpty()) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("delete_share")
                        .message("Share not found")
                        .success(false)
                        .data(null)
                        .build();
            }

            Share share = shareOpt.get();
            if (!share.getByUser().getId().equals(userId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("delete_share")
                        .message("Not authorized to delete this share")
                        .success(false)
                        .data(null)
                        .build();
            }

            shareRepository.delete(share);

            return SocialDtos.SocialActionResponse.builder()
                    .action("delete_share")
                    .message("Share deleted successfully")
                    .success(true)
                    .data(null)
                    .build();

        } catch (Exception e) {
            log.error("Error deleting share: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("delete_share")
                    .message("Failed to delete share: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SocialDtos.ShareListResponse getPostShares(Long postId, int page, int size) {
        List<Share> allShares = shareRepository.findByPost_Id(postId);
        return createShareListResponse(allShares, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public SocialDtos.ShareListResponse getUserShares(Long userId, int page, int size) {
        List<Share> allShares = shareRepository.findByByUser_Id(userId);
        return createShareListResponse(allShares, page, size);
    }

    // Social stats
    @Override
    @Transactional(readOnly = true)
    public SocialDtos.SocialStatsResponse getSocialStats(Long userId, Long viewerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        long followersCount = followRepository.findByFollowee_Id(userId).size();
        long followingCount = followRepository.findByFollower_Id(userId).size();
        long friendsCount = friendshipRepository.findByUserLow_IdOrUserHigh_Id(userId, userId).stream()
                .filter(f -> f.getStatus() == FriendshipStatus.accepted)
                .count();
        long sharesCount = shareRepository.findByByUser_Id(userId).size();

        boolean isFollowing = viewerId != null && isFollowing(viewerId, userId);
        boolean isFriend = viewerId != null && isFriend(viewerId, userId);
        boolean isBlocked = viewerId != null && (isBlocked(viewerId, userId) || isBlockedBy(userId, viewerId));
        boolean canSendFriendRequest = viewerId != null && !isFriend && !hasPendingFriendRequest(viewerId, userId) && !isBlocked;

        return SocialDtos.SocialStatsResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .followersCount(followersCount)
                .followingCount(followingCount)
                .friendsCount(friendsCount)
                .sharesCount(sharesCount)
                .isFollowing(isFollowing)
                .isFriend(isFriend)
                .isBlocked(isBlocked)
                .canSendFriendRequest(canSendFriendRequest)
                .build();
    }


    @Override
    @Transactional
    public SocialDtos.SocialActionResponse reportUser(Long reporterId, Long targetUserId, com.ainnect.common.enums.ReportReason reason, String description) {
        try {
            if (reporterId.equals(targetUserId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("report")
                        .message("Cannot report yourself")
                        .success(false)
                        .data(null)
                        .build();
            }

            User reporter = userRepository.findById(reporterId)
                    .orElseThrow(() -> new IllegalArgumentException("Reporter not found"));
            userRepository.findById(targetUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

            Report report = Report.builder()
                    .reporter(reporter)
                    .targetType("USER")
                    .targetId(targetUserId)
                    .reason(reason)
                    .description(description)
                    .status(com.ainnect.common.enums.ReportStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            Report savedReport = reportRepository.save(report);

            return SocialDtos.SocialActionResponse.builder()
                    .action("report")
                    .message("User reported successfully")
                    .success(true)
                    .data(toReportResponse(savedReport))
                    .build();
        } catch (Exception e) {
            log.error("Error reporting user: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("report")
                    .message("Failed to report user: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional
    public SocialDtos.SocialActionResponse reportPost(Long reporterId, Long postId, com.ainnect.common.enums.ReportReason reason, String description) {
        try {
            User reporter = userRepository.findById(reporterId)
                    .orElseThrow(() -> new IllegalArgumentException("Reporter not found"));
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new IllegalArgumentException("Post not found"));

            if (post.getAuthor().getId().equals(reporterId)) {
                return SocialDtos.SocialActionResponse.builder()
                        .action("report")
                        .message("Cannot report your own post")
                        .success(false)
                        .data(null)
                        .build();
            }

            Report report = Report.builder()
                    .reporter(reporter)
                    .targetType("POST")
                    .targetId(postId)
                    .reason(reason)
                    .description(description)
                    .status(com.ainnect.common.enums.ReportStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            Report savedReport = reportRepository.save(report);

            return SocialDtos.SocialActionResponse.builder()
                    .action("report")
                    .message("Post reported successfully")
                    .success(true)
                    .data(toReportResponse(savedReport))
                    .build();
        } catch (Exception e) {
            log.error("Error reporting post: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("report")
                    .message("Failed to report post: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    @Transactional
    public SocialDtos.SocialActionResponse reportComment(Long reporterId, Long commentId, com.ainnect.common.enums.ReportReason reason, String description) {
        try {
            User reporter = userRepository.findById(reporterId)
                    .orElseThrow(() -> new IllegalArgumentException("Reporter not found"));

            Report report = Report.builder()
                    .reporter(reporter)
                    .targetType("COMMENT")
                    .targetId(commentId)
                    .reason(reason)
                    .description(description)
                    .status(com.ainnect.common.enums.ReportStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            Report savedReport = reportRepository.save(report);

            return SocialDtos.SocialActionResponse.builder()
                    .action("report")
                    .message("Comment reported successfully")
                    .success(true)
                    .data(toReportResponse(savedReport))
                    .build();
        } catch (Exception e) {
            log.error("Error reporting comment: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("report")
                    .message("Failed to report comment: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    public SocialDtos.ReportListResponse getReportsByReporter(Long reporterId, int page, int size) {
        try {
            List<Report> reports = reportRepository.findByReporterIdOrderByCreatedAtDesc(reporterId);
            int start = page * size;
            int end = Math.min(start + size, reports.size());
            List<Report> pageReports = reports.subList(start, end);

            List<SocialDtos.ReportResponse> reportResponses = pageReports.stream()
                    .map(this::toReportResponse)
                    .toList();

            return SocialDtos.ReportListResponse.builder()
                    .reports(reportResponses)
                    .currentPage(page)
                    .pageSize(size)
                    .totalElements((long) reports.size())
                    .totalPages((int) Math.ceil((double) reports.size() / size))
                    .hasNext(end < reports.size())
                    .hasPrevious(page > 0)
                    .build();
        } catch (Exception e) {
            log.error("Error getting reports by reporter: {}", e.getMessage());
            throw new RuntimeException("Failed to get reports by reporter", e);
        }
    }

    @Override
    public SocialDtos.ReportListResponse getAllReports(int page, int size) {
        try {
            List<Report> reports = reportRepository.findAllByOrderByCreatedAtDesc();
            int start = page * size;
            int end = Math.min(start + size, reports.size());
            List<Report> pageReports = reports.subList(start, end);

            List<SocialDtos.ReportResponse> reportResponses = pageReports.stream()
                    .map(this::toReportResponse)
                    .toList();

            return SocialDtos.ReportListResponse.builder()
                    .reports(reportResponses)
                    .currentPage(page)
                    .pageSize(size)
                    .totalElements((long) reports.size())
                    .totalPages((int) Math.ceil((double) reports.size() / size))
                    .hasNext(end < reports.size())
                    .hasPrevious(page > 0)
                    .build();
        } catch (Exception e) {
            log.error("Error getting all reports: {}", e.getMessage());
            throw new RuntimeException("Failed to get all reports", e);
        }
    }

    @Override
    @Transactional
    public SocialDtos.SocialActionResponse updateReportStatus(Long reportId, com.ainnect.common.enums.ReportStatus status, String adminNote, Long adminId) {
        try {
            Report report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new IllegalArgumentException("Report not found"));

            User admin = userRepository.findById(adminId)
                    .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

            report.setStatus(status);
            report.setReviewedBy(admin);
            report.setReviewedAt(LocalDateTime.now());
            report.setAdminNote(adminNote);
            report.setUpdatedAt(LocalDateTime.now());

            Report updatedReport = reportRepository.save(report);

            return SocialDtos.SocialActionResponse.builder()
                    .action("update_report_status")
                    .message("Report status updated successfully")
                    .success(true)
                    .data(toReportResponse(updatedReport))
                    .build();
        } catch (Exception e) {
            log.error("Error updating report status: {}", e.getMessage());
            return SocialDtos.SocialActionResponse.builder()
                    .action("update_report_status")
                    .message("Failed to update report status: " + e.getMessage())
                    .success(false)
                    .data(null)
                    .build();
        }
    }

    @Override
    public SocialDtos.ReportResponse getReportById(Long reportId) {
        try {
            Report report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new IllegalArgumentException("Report not found"));

            return toReportResponse(report);
        } catch (Exception e) {
            log.error("Error getting report by ID: {}", e.getMessage());
            throw new RuntimeException("Failed to get report by ID", e);
        }
    }

    @Override
    public boolean canSendFriendRequest(Long userId1, Long userId2) {
        if (userId1.equals(userId2)) {
            return false;
        }

        // Check if already friends
        if (isFriend(userId1, userId2)) {
            return false;
        }

        // Check if there's already a pending request
        if (hasPendingFriendRequest(userId1, userId2)) {
            return false;
        }

        // Check if either user is blocked
        if (isBlocked(userId1, userId2) || isBlockedBy(userId1, userId2)) {
            return false;
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public SocialDtos.CommonFriendsResponse getCommonFriends(Long userId, Long otherUserId, int page, int size) {
        List<Friendship> userFriends = friendshipRepository.findByUserLow_IdOrUserHigh_IdAndStatus(userId, userId, FriendshipStatus.accepted);
        List<Friendship> otherFriends = friendshipRepository.findByUserLow_IdOrUserHigh_IdAndStatus(otherUserId, otherUserId, FriendshipStatus.accepted);

        List<Long> userFriendIds = userFriends.stream()
                .map(f -> f.getUserLow().getId().equals(userId) ? f.getUserHigh().getId() : f.getUserLow().getId())
                .toList();
        List<Long> otherFriendIds = otherFriends.stream()
                .map(f -> f.getUserLow().getId().equals(otherUserId) ? f.getUserHigh().getId() : f.getUserLow().getId())
                .toList();

        List<Long> commonIds = userFriendIds.stream()
                .filter(otherFriendIds::contains)
                .distinct()
                .toList();

        int total = commonIds.size();
        int start = Math.min(page * size, total);
        int end = Math.min(start + size, total);
        List<Long> pageIds = commonIds.subList(start, end);

        List<User> commonUsers = pageIds.stream()
                .map(id -> userRepository.findById(id).orElse(null))
                .filter(u -> u != null)
                .toList();

        List<SocialDtos.CommonFriendItem> items = commonUsers.stream()
                .map(u -> SocialDtos.CommonFriendItem.builder()
                        .userId(u.getId())
                        .username(u.getUsername())
                        .displayName(u.getDisplayName())
                        .avatarUrl(u.getAvatarUrl())
                        .build())
                .toList();

        int totalPages = (int) Math.ceil((double) total / size);

        return SocialDtos.CommonFriendsResponse.builder()
                .commonFriends(items)
                .currentPage(page)
                .pageSize(size)
                .totalElements(total)
                .totalPages(totalPages)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public long countCommonFriends(Long userId, Long otherUserId) {
        List<Friendship> userFriends = friendshipRepository.findByUserLow_IdOrUserHigh_IdAndStatus(userId, userId, FriendshipStatus.accepted);
        List<Friendship> otherFriends = friendshipRepository.findByUserLow_IdOrUserHigh_IdAndStatus(otherUserId, otherUserId, FriendshipStatus.accepted);

        List<Long> userFriendIds = userFriends.stream()
                .map(f -> f.getUserLow().getId().equals(userId) ? f.getUserHigh().getId() : f.getUserLow().getId())
                .toList();
        List<Long> otherFriendIds = otherFriends.stream()
                .map(f -> f.getUserLow().getId().equals(otherUserId) ? f.getUserHigh().getId() : f.getUserLow().getId())
                .toList();

        return userFriendIds.stream().filter(otherFriendIds::contains).distinct().count();
    }

    
    private SocialDtos.ReportResponse toReportResponse(Report report) {
        return SocialDtos.ReportResponse.builder()
                .id(report.getId())
                .reporterId(report.getReporter().getId())
                .reporterUsername(report.getReporter().getUsername())
                .reporterDisplayName(report.getReporter().getDisplayName())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .reviewedById(report.getReviewedBy() != null ? report.getReviewedBy().getId() : null)
                .reviewedByUsername(report.getReviewedBy() != null ? report.getReviewedBy().getUsername() : null)
                .reviewedAt(report.getReviewedAt())
                .adminNote(report.getAdminNote())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }

    // Helper methods
    private SocialDtos.FollowListResponse createFollowListResponse(List<Follow> follows, int page, int size, boolean isFollowers) {
        long totalElements = follows.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        int start = page * size;
        int end = Math.min(start + size, follows.size());

        List<SocialDtos.FollowResponse> followResponses = follows.subList(start, end).stream()
                .map(this::toFollowResponse)
                .toList();

        return SocialDtos.FollowListResponse.builder()
                .follows(followResponses)
                .currentPage(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .build();
    }

    private SocialDtos.FriendshipListResponse createFriendshipListResponse(List<Friendship> friendships, int page, int size, Long currentUserId) {
        long totalElements = friendships.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        int start = page * size;
        int end = Math.min(start + size, friendships.size());

        List<SocialDtos.FriendshipResponse> friendshipResponses = friendships.subList(start, end).stream()
                .map(f -> toFriendshipResponse(f, currentUserId))
                .toList();

        return SocialDtos.FriendshipListResponse.builder()
                .friendships(friendshipResponses)
                .currentPage(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .build();
    }

    private SocialDtos.BlockListResponse createBlockListResponse(List<UserBlock> blocks, int page, int size) {
        long totalElements = blocks.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        int start = page * size;
        int end = Math.min(start + size, blocks.size());

        List<SocialDtos.BlockResponse> blockResponses = blocks.subList(start, end).stream()
                .map(this::toBlockResponse)
                .toList();

        return SocialDtos.BlockListResponse.builder()
                .blocks(blockResponses)
                .currentPage(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .build();
    }

    private SocialDtos.ShareListResponse createShareListResponse(List<Share> shares, int page, int size) {
        long totalElements = shares.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        int start = page * size;
        int end = Math.min(start + size, shares.size());

        List<SocialDtos.ShareResponse> shareResponses = shares.subList(start, end).stream()
                .map(this::toShareResponse)
                .toList();

        return SocialDtos.ShareListResponse.builder()
                .shares(shareResponses)
                .currentPage(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .build();
    }

    private SocialDtos.FollowResponse toFollowResponse(Follow follow) {
        return SocialDtos.FollowResponse.builder()
                .followerId(follow.getFollower().getId())
                .followerUsername(follow.getFollower().getUsername())
                .followerDisplayName(follow.getFollower().getDisplayName())
                .followerAvatarUrl(follow.getFollower().getAvatarUrl())
                .followeeId(follow.getFollowee().getId())
                .followeeUsername(follow.getFollowee().getUsername())
                .followeeDisplayName(follow.getFollowee().getDisplayName())
                .followeeAvatarUrl(follow.getFollowee().getAvatarUrl())
                .createdAt(follow.getCreatedAt())
                .build();
    }

    private SocialDtos.FriendshipResponse toFriendshipResponse(Friendship friendship, Long currentUserId) {
        User otherUser = currentUserId != null && currentUserId.equals(friendship.getUserLow().getId()) 
                ? friendship.getUserHigh() 
                : friendship.getUserLow();

        return SocialDtos.FriendshipResponse.builder()
                .userId(otherUser.getId())
                .username(otherUser.getUsername())
                .displayName(otherUser.getDisplayName())
                .avatarUrl(otherUser.getAvatarUrl())
                .status(friendship.getStatus())
                .requestedById(friendship.getRequestedBy().getId())
                .requestedByUsername(friendship.getRequestedBy().getUsername())
                .respondedAt(friendship.getRespondedAt())
                .createdAt(friendship.getCreatedAt())
                .updatedAt(friendship.getUpdatedAt())
                .build();
    }

    private SocialDtos.BlockResponse toBlockResponse(UserBlock userBlock) {
        return SocialDtos.BlockResponse.builder()
                .id(userBlock.getId())
                .blockerId(userBlock.getBlocker().getId())
                .blockerUsername(userBlock.getBlocker().getUsername())
                .blockerDisplayName(userBlock.getBlocker().getDisplayName())
                .blockerAvatarUrl(userBlock.getBlocker().getAvatarUrl())
                .blockedId(userBlock.getBlocked().getId())
                .blockedUsername(userBlock.getBlocked().getUsername())
                .blockedDisplayName(userBlock.getBlocked().getDisplayName())
                .blockedAvatarUrl(userBlock.getBlocked().getAvatarUrl())
                .reason(userBlock.getReason())
                .createdAt(userBlock.getCreatedAt())
                .build();
    }

    private SocialDtos.ShareResponse toShareResponse(Share share) {
        return SocialDtos.ShareResponse.builder()
                .id(share.getId())
                .postId(share.getPost().getId())
                .postContent(share.getPost().getContent())
                .postAuthorUsername(share.getPost().getAuthor().getUsername())
                .postAuthorDisplayName(share.getPost().getAuthor().getDisplayName())
                .postAuthorAvatarUrl(share.getPost().getAuthor().getAvatarUrl())
                .byUserId(share.getByUser().getId())
                .byUsername(share.getByUser().getUsername())
                .byDisplayName(share.getByUser().getDisplayName())
                .byAvatarUrl(share.getByUser().getAvatarUrl())
                .comment(share.getComment())
                .createdAt(share.getCreatedAt())
                .build();
    }
}


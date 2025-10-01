package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.social.SocialDtos;
import com.ainnect.service.SocialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;
    private final JwtUtil jwtUtil;

    // Follow endpoints
    @PostMapping("/follow")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> followUser(
            @Valid @RequestBody SocialDtos.FollowRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.followUser(userId, request.getFolloweeId());
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @DeleteMapping("/follow/{followeeId}")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> unfollowUser(
            @PathVariable("followeeId") Long followeeId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.unfollowUser(userId, followeeId);
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<ApiResponse<SocialDtos.FollowListResponse>> getFollowers(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        try {
            SocialDtos.FollowListResponse response = socialService.getFollowers(userId, page, size);
            ApiResponse<SocialDtos.FollowListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Followers retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.FollowListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<ApiResponse<SocialDtos.FollowListResponse>> getFollowing(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        try {
            SocialDtos.FollowListResponse response = socialService.getFollowing(userId, page, size);
            ApiResponse<SocialDtos.FollowListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Following retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.FollowListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/is-following/{followeeId}")
    public ResponseEntity<ApiResponse<Boolean>> isFollowing(
            @PathVariable("followeeId") Long followeeId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            boolean isFollowing = socialService.isFollowing(userId, followeeId);
            ApiResponse<Boolean> apiResponse = new ApiResponse<>("SUCCESS", "Follow status retrieved successfully", isFollowing);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<Boolean> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    // Friendship endpoints
    @PostMapping("/friend-request")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> sendFriendRequest(
            @Valid @RequestBody SocialDtos.FriendshipRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.sendFriendRequest(userId, request.getFriendId());
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @PostMapping("/friend-request/accept")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> acceptFriendRequest(
            @Valid @RequestBody SocialDtos.FriendshipActionRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            Long otherUserId = request.getOtherUserId() != null ? request.getOtherUserId() : request.getFriendshipId();
            if (otherUserId == null) {
                throw new IllegalArgumentException("otherUserId must be provided");
            }
            SocialDtos.SocialActionResponse response = socialService.acceptFriendRequest(userId, otherUserId);
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @PostMapping("/friend-request/reject")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> rejectFriendRequest(
            @Valid @RequestBody SocialDtos.FriendshipActionRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            Long otherUserId = request.getOtherUserId() != null ? request.getOtherUserId() : request.getFriendshipId();
            if (otherUserId == null) {
                throw new IllegalArgumentException("otherUserId must be provided");
            }
            SocialDtos.SocialActionResponse response = socialService.rejectFriendRequest(userId, otherUserId);
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @DeleteMapping("/friend/{friendId}")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> removeFriend(
            @PathVariable("friendId") Long friendId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.removeFriend(userId, friendId);
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/friends/{userId}")
    public ResponseEntity<ApiResponse<SocialDtos.FriendshipListResponse>> getFriends(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        try {
            SocialDtos.FriendshipListResponse response = socialService.getFriends(userId, page, size);
            ApiResponse<SocialDtos.FriendshipListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Friends retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.FriendshipListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/friend-requests")
    public ResponseEntity<ApiResponse<SocialDtos.FriendshipListResponse>> getFriendRequests(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.FriendshipListResponse response = socialService.getFriendRequests(userId, page, size);
            ApiResponse<SocialDtos.FriendshipListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Friend requests retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.FriendshipListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/sent-friend-requests")
    public ResponseEntity<ApiResponse<SocialDtos.FriendshipListResponse>> getSentFriendRequests(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.FriendshipListResponse response = socialService.getSentFriendRequests(userId, page, size);
            ApiResponse<SocialDtos.FriendshipListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Sent friend requests retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.FriendshipListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/common-friends/{otherUserId}")
    public ResponseEntity<ApiResponse<SocialDtos.CommonFriendsResponse>> getCommonFriends(
            @PathVariable("otherUserId") Long otherUserId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.CommonFriendsResponse response = socialService.getCommonFriends(userId, otherUserId, page, size);
            ApiResponse<SocialDtos.CommonFriendsResponse> apiResponse = new ApiResponse<>("SUCCESS", "Common friends retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.CommonFriendsResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/common-friends/{otherUserId}/count")
    public ResponseEntity<ApiResponse<Long>> countCommonFriends(
            @PathVariable("otherUserId") Long otherUserId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            long count = socialService.countCommonFriends(userId, otherUserId);
            ApiResponse<Long> apiResponse = new ApiResponse<>("SUCCESS", "Common friends count retrieved successfully", count);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<Long> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/is-friend/{friendId}")
    public ResponseEntity<ApiResponse<Boolean>> isFriend(
            @PathVariable("friendId") Long friendId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            boolean isFriend = socialService.isFriend(userId, friendId);
            ApiResponse<Boolean> apiResponse = new ApiResponse<>("SUCCESS", "Friend status retrieved successfully", isFriend);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<Boolean> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    // Block endpoints
    @PostMapping("/block")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> blockUser(
            @Valid @RequestBody SocialDtos.BlockRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.blockUser(userId, request.getBlockedUserId(), request.getReason());
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @DeleteMapping("/block/{blockedUserId}")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> unblockUser(
            @PathVariable("blockedUserId") Long blockedUserId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.unblockUser(userId, blockedUserId);
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/blocked-users")
    public ResponseEntity<ApiResponse<SocialDtos.BlockListResponse>> getBlockedUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.BlockListResponse response = socialService.getBlockedUsers(userId, page, size);
            ApiResponse<SocialDtos.BlockListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Blocked users retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.BlockListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/is-blocked/{blockedId}")
    public ResponseEntity<ApiResponse<Boolean>> isBlocked(
            @PathVariable("blockedId") Long blockedId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            boolean isBlocked = socialService.isBlocked(userId, blockedId);
            ApiResponse<Boolean> apiResponse = new ApiResponse<>("SUCCESS", "Block status retrieved successfully", isBlocked);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<Boolean> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    // Share endpoints
    @PostMapping("/share")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> sharePost(
            @Valid @RequestBody SocialDtos.ShareRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.sharePost(userId, request.getPostId(), request.getComment());
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @DeleteMapping("/share/{shareId}")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> deleteShare(
            @PathVariable("shareId") Long shareId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.deleteShare(userId, shareId);
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/shares/post/{postId}")
    public ResponseEntity<ApiResponse<SocialDtos.ShareListResponse>> getPostShares(
            @PathVariable("postId") Long postId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        try {
            SocialDtos.ShareListResponse response = socialService.getPostShares(postId, page, size);
            ApiResponse<SocialDtos.ShareListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Post shares retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.ShareListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/shares/user/{userId}")
    public ResponseEntity<ApiResponse<SocialDtos.ShareListResponse>> getUserShares(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        try {
            SocialDtos.ShareListResponse response = socialService.getUserShares(userId, page, size);
            ApiResponse<SocialDtos.ShareListResponse> apiResponse = new ApiResponse<>("SUCCESS", "User shares retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.ShareListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    // Report endpoints
    @PostMapping("/report/user")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> reportUser(
            @Valid @RequestBody SocialDtos.ReportRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.reportUser(userId, request.getTargetId(), request.getReason(), request.getDescription());
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @PostMapping("/report/post")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> reportPost(
            @Valid @RequestBody SocialDtos.ReportRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.reportPost(userId, request.getTargetId(), request.getReason(), request.getDescription());
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @PostMapping("/report/comment")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> reportComment(
            @Valid @RequestBody SocialDtos.ReportRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.reportComment(userId, request.getTargetId(), request.getReason(), request.getDescription());
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/reports/my")
    public ResponseEntity<ApiResponse<SocialDtos.ReportListResponse>> getMyReports(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            SocialDtos.ReportListResponse response = socialService.getReportsByReporter(userId, page, size);
            ApiResponse<SocialDtos.ReportListResponse> apiResponse = new ApiResponse<>("SUCCESS", "My reports retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.ReportListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<SocialDtos.ReportListResponse>> getAllReports(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // This endpoint should be restricted to admins only
            Long adminId = extractUserIdFromToken(authHeader);
            SocialDtos.ReportListResponse response = socialService.getAllReports(page, size);
            ApiResponse<SocialDtos.ReportListResponse> apiResponse = new ApiResponse<>("SUCCESS", "All reports retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.ReportListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/reports/{reportId}")
    public ResponseEntity<ApiResponse<SocialDtos.ReportResponse>> getReportById(
            @PathVariable("reportId") Long reportId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = extractUserIdFromToken(authHeader);
            SocialDtos.ReportResponse response = socialService.getReportById(reportId);
            ApiResponse<SocialDtos.ReportResponse> apiResponse = new ApiResponse<>("SUCCESS", "Report retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.ReportResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @PutMapping("/reports/{reportId}/status")
    public ResponseEntity<ApiResponse<SocialDtos.SocialActionResponse>> updateReportStatus(
            @PathVariable("reportId") Long reportId,
            @Valid @RequestBody SocialDtos.ReportActionRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = extractUserIdFromToken(authHeader);
            SocialDtos.SocialActionResponse response = socialService.updateReportStatus(reportId, request.getStatus(), request.getAdminNote(), adminId);
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>(
                    response.isSuccess() ? "SUCCESS" : "ERROR", 
                    response.getMessage(), 
                    response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialActionResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    // Social stats endpoints
    @GetMapping("/stats/{userId}")
    public ResponseEntity<ApiResponse<SocialDtos.SocialStatsResponse>> getSocialStats(
            @PathVariable("userId") Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long viewerId = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    viewerId = extractUserIdFromToken(authHeader);
                } catch (Exception e) {
                    // Ignore auth errors for public stats
                }
            }
            SocialDtos.SocialStatsResponse response = socialService.getSocialStats(userId, viewerId);
            ApiResponse<SocialDtos.SocialStatsResponse> apiResponse = new ApiResponse<>("SUCCESS", "Social stats retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<SocialDtos.SocialStatsResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Token không hợp lệ");
    }
}


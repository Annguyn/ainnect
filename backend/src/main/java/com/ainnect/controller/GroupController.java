package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.common.enums.GroupMemberRole;
import com.ainnect.common.enums.Privacy;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.group.GroupDtos;
import com.ainnect.service.GroupService;
import com.ainnect.service.FileStorageService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;
    private final FileStorageService fileStorageService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<GroupDtos.GroupResponse>> createGroup(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "visibility", required = false) String visibility,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage,
            @RequestParam(value = "requiresApproval", required = false) Boolean requiresApproval,
            @RequestParam(value = "joinQuestions", required = false) String joinQuestions,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("Group name is required");
            }
            if (visibility == null || visibility.trim().isEmpty()) {
                throw new IllegalArgumentException("Group visibility is required");
            }
            
            String coverUrl = null;
            if (coverImage != null && !coverImage.isEmpty()) {
                coverUrl = fileStorageService.storeFile(coverImage, "general");
            }
            
            GroupDtos.CreateRequest request = GroupDtos.CreateRequest.builder()
                .name(name.trim())
                .description(description != null ? description.trim() : null)
                .privacy(Privacy.valueOf(visibility))
                .coverUrl(coverUrl)
                .requiresApproval(requiresApproval != null ? requiresApproval : false)
                .joinQuestions(parseJoinQuestions(joinQuestions))
                .build();
                
            GroupDtos.GroupResponse response = groupService.createGroup(request, userId);
            ApiResponse<GroupDtos.GroupResponse> apiResponse = new ApiResponse<>("SUCCESS", "Group created successfully", response);
            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDtos.GroupResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.GroupResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to create group: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @PutMapping(value = "/{groupId}", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<GroupDtos.GroupResponse>> updateGroup(
            @PathVariable("groupId") Long groupId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "visibility", required = false) String visibility,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            // Validate that at least one field is provided for update
            if ((name == null || name.trim().isEmpty()) && 
                (description == null || description.trim().isEmpty()) && 
                (visibility == null || visibility.trim().isEmpty()) && 
                (coverImage == null || coverImage.isEmpty())) {
                throw new IllegalArgumentException("At least one field must be provided for update");
            }
            
            // Upload cover image if provided
            String coverUrl = null;
            if (coverImage != null && !coverImage.isEmpty()) {
                coverUrl = fileStorageService.storeFile(coverImage, "general");
            }
            
            GroupDtos.UpdateRequest request = GroupDtos.UpdateRequest.builder()
                .name(name != null ? name.trim() : null)
                .description(description != null ? description.trim() : null)
                .privacy(visibility != null ? Privacy.valueOf(visibility) : null)
                .coverUrl(coverUrl)
                .build();
                
            GroupDtos.GroupResponse response = groupService.updateGroup(groupId, request, userId);
            ApiResponse<GroupDtos.GroupResponse> apiResponse = new ApiResponse<>("SUCCESS", "Group updated successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDtos.GroupResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.GroupResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to update group: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(
            @PathVariable("groupId") Long groupId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            groupService.deleteGroup(groupId, userId);
            ApiResponse<Void> apiResponse = new ApiResponse<>("SUCCESS", "Group deleted successfully", null);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<Void> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<Void> apiResponse = new ApiResponse<>("ERROR", "Failed to delete group: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<ApiResponse<GroupDtos.GroupResponse>> getGroupById(
            @PathVariable("groupId") Long groupId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = authHeader != null ? extractUserIdFromToken(authHeader) : null;
            GroupDtos.GroupResponse response = groupService.getGroupById(groupId, userId);
            ApiResponse<GroupDtos.GroupResponse> apiResponse = new ApiResponse<>("SUCCESS", "Group retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDtos.GroupResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.GroupResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to get group: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<GroupDtos.GroupListResponse>> getAllGroups(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = authHeader != null ? extractUserIdFromToken(authHeader) : null;
            Pageable pageable = PageRequest.of(page, size);
            GroupDtos.GroupListResponse response = groupService.getAllGroups(pageable, userId);
            ApiResponse<GroupDtos.GroupListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Groups retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.GroupListResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to get groups: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<GroupDtos.GroupListResponse>> getGroupsByOwner(
            @PathVariable("ownerId") Long ownerId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            GroupDtos.GroupListResponse response = groupService.getGroupsByOwner(ownerId, pageable);
            ApiResponse<GroupDtos.GroupListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Groups retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.GroupListResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to get groups: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @GetMapping("/member/{userId}")
    public ResponseEntity<ApiResponse<GroupDtos.GroupListResponse>> getGroupsByMember(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            GroupDtos.GroupListResponse response = groupService.getGroupsByMember(userId, pageable);
            ApiResponse<GroupDtos.GroupListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Groups retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.GroupListResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to get groups: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<ApiResponse<GroupDtos.JoinResponse>> joinGroup(
            @PathVariable("groupId") Long groupId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            GroupDtos.JoinResponse response = groupService.joinGroup(groupId, userId);
            ApiResponse<GroupDtos.JoinResponse> apiResponse = new ApiResponse<>("SUCCESS", response.getMessage(), response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDtos.JoinResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.JoinResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to join group: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<ApiResponse<GroupDtos.LeaveResponse>> leaveGroup(
            @PathVariable("groupId") Long groupId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            GroupDtos.LeaveResponse response = groupService.leaveGroup(groupId, userId);
            ApiResponse<GroupDtos.LeaveResponse> apiResponse = new ApiResponse<>("SUCCESS", response.getMessage(), response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDtos.LeaveResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.LeaveResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to leave group: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<ApiResponse<GroupDtos.MemberListResponse>> getGroupMembers(
            @PathVariable("groupId") Long groupId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = authHeader != null ? extractUserIdFromToken(authHeader) : null;
            Pageable pageable = PageRequest.of(page, size);
            GroupDtos.MemberListResponse response = groupService.getGroupMembers(groupId, pageable, userId);
            ApiResponse<GroupDtos.MemberListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Members retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDtos.MemberListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.MemberListResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to get members: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @PutMapping("/{groupId}/members/{userId}/role")
    public ResponseEntity<ApiResponse<GroupDtos.MemberResponse>> updateMemberRole(
            @PathVariable("groupId") Long groupId,
            @PathVariable("userId") Long targetUserId,
            @RequestParam("role") GroupMemberRole newRole,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long currentUserId = extractUserIdFromToken(authHeader);
            GroupDtos.MemberResponse response = groupService.updateMemberRole(groupId, targetUserId, newRole, currentUserId);
            ApiResponse<GroupDtos.MemberResponse> apiResponse = new ApiResponse<>("SUCCESS", "Member role updated successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDtos.MemberResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.MemberResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to update member role: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable("groupId") Long groupId,
            @PathVariable("userId") Long targetUserId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long currentUserId = extractUserIdFromToken(authHeader);
            groupService.removeMember(groupId, targetUserId, currentUserId);
            ApiResponse<Void> apiResponse = new ApiResponse<>("SUCCESS", "Member removed successfully", null);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<Void> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<Void> apiResponse = new ApiResponse<>("ERROR", "Failed to remove member: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @GetMapping("/{groupId}/questions")
    public ResponseEntity<ApiResponse<List<GroupDtos.JoinQuestionResponse>>> getJoinQuestions(
            @PathVariable("groupId") Long groupId) {
        try {
            List<GroupDtos.JoinQuestionResponse> response = groupService.getJoinQuestions(groupId);
            ApiResponse<List<GroupDtos.JoinQuestionResponse>> apiResponse = new ApiResponse<>("SUCCESS", "Join questions retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<List<GroupDtos.JoinQuestionResponse>> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<List<GroupDtos.JoinQuestionResponse>> apiResponse = new ApiResponse<>("ERROR", "Failed to get join questions: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @PutMapping("/{groupId}/questions")
    public ResponseEntity<ApiResponse<Void>> updateJoinQuestions(
            @PathVariable("groupId") Long groupId,
            @Valid @RequestBody List<GroupDtos.JoinQuestionRequest> questions,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            groupService.updateJoinQuestions(groupId, questions, userId);
            ApiResponse<Void> apiResponse = new ApiResponse<>("SUCCESS", "Join questions updated successfully", null);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<Void> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<Void> apiResponse = new ApiResponse<>("ERROR", "Failed to update join questions: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @PostMapping("/{groupId}/join-requests")
    public ResponseEntity<ApiResponse<GroupDtos.JoinRequestResponse>> submitJoinRequest(
            @PathVariable("groupId") Long groupId,
            @Valid @RequestBody List<GroupDtos.JoinAnswerRequest> answers,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            GroupDtos.JoinRequestResponse response = groupService.submitJoinRequest(groupId, answers, userId);
            ApiResponse<GroupDtos.JoinRequestResponse> apiResponse = new ApiResponse<>("SUCCESS", "Join request submitted successfully", response);
            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDtos.JoinRequestResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.JoinRequestResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to submit join request: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @GetMapping("/{groupId}/join-requests/pending")
    public ResponseEntity<ApiResponse<GroupDtos.JoinRequestListResponse>> getPendingJoinRequests(
            @PathVariable("groupId") Long groupId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            GroupDtos.JoinRequestListResponse response = groupService.getPendingJoinRequests(groupId, pageable, userId);
            ApiResponse<GroupDtos.JoinRequestListResponse> apiResponse = new ApiResponse<>("SUCCESS", "Pending join requests retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDtos.JoinRequestListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.JoinRequestListResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to get pending join requests: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @PostMapping("/join-requests/{requestId}/review")
    public ResponseEntity<ApiResponse<GroupDtos.JoinRequestResponse>> reviewJoinRequest(
            @PathVariable("requestId") Long requestId,
            @Valid @RequestBody GroupDtos.ReviewJoinRequestRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long reviewerId = extractUserIdFromToken(authHeader);
            GroupDtos.JoinRequestResponse response = groupService.reviewJoinRequest(requestId, request, reviewerId);
            ApiResponse<GroupDtos.JoinRequestResponse> apiResponse = new ApiResponse<>("SUCCESS", "Join request reviewed successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDtos.JoinRequestResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.JoinRequestResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to review join request: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @GetMapping("/{groupId}/join-requests/my-request")
    public ResponseEntity<ApiResponse<GroupDtos.JoinRequestResponse>> getUserJoinRequest(
            @PathVariable("groupId") Long groupId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            GroupDtos.JoinRequestResponse response = groupService.getUserJoinRequest(groupId, userId);
            ApiResponse<GroupDtos.JoinRequestResponse> apiResponse = new ApiResponse<>("SUCCESS", "Join request retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDtos.JoinRequestResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<GroupDtos.JoinRequestResponse> apiResponse = new ApiResponse<>("ERROR", "Failed to get join request: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @DeleteMapping("/join-requests/{requestId}")
    public ResponseEntity<ApiResponse<Void>> cancelJoinRequest(
            @PathVariable("requestId") Long requestId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            groupService.cancelJoinRequest(requestId, userId);
            ApiResponse<Void> apiResponse = new ApiResponse<>("SUCCESS", "Join request cancelled successfully", null);
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<Void> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        } catch (Exception e) {
            ApiResponse<Void> apiResponse = new ApiResponse<>("ERROR", "Failed to cancel join request: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Token không hợp lệ");
    }
    
    private java.util.List<GroupDtos.JoinQuestionRequest> parseJoinQuestions(String joinQuestionsJson) {
        if (joinQuestionsJson == null || joinQuestionsJson.trim().isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(joinQuestionsJson, new TypeReference<java.util.List<GroupDtos.JoinQuestionRequest>>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid joinQuestions JSON format", e);
        }
    }
}


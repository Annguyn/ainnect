package com.ainnect.dto.group;

import com.ainnect.common.enums.GroupJoinRequestStatus;
import com.ainnect.common.enums.GroupMemberRole;
import com.ainnect.common.enums.Privacy;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

public class GroupDtos {

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank
        @Size(max = 120)
        private String name;
        
        @Size(max = 500)
        private String description;
        
        private Privacy privacy = Privacy.public_;
        
        private String avatarUrl;
        
        private String coverUrl;
        
        private Boolean requiresApproval = false;
        
        private List<JoinQuestionRequest> joinQuestions;
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank
        @Size(max = 120)
        private String name;
        
        @Size(max = 500)
        private String description;
        
        private Privacy privacy;
        
        private String avatarUrl;
        
        private String coverUrl;
        
        private Boolean requiresApproval;
    }

    @Getter
    @Setter
    public static class JoinRequest {
        private Long groupId;
        private List<JoinAnswerRequest> answers;
    }

    @Getter
    @Setter
    public static class LeaveRequest {
        private Long groupId;
    }

    @Getter
    @Setter
    public static class UpdateMemberRoleRequest {
        private Long userId;
        private GroupMemberRole role;
    }

    @Getter
    @Setter
    public static class RemoveMemberRequest {
        private Long userId;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class GroupResponse {
        private Long id;
        private String name;
        private String description;
        private Privacy privacy;
        private String avatarUrl;
        private String coverUrl;
        private Boolean requiresApproval;
        private Long ownerId;
        private String ownerUsername;
        private String ownerDisplayName;
        private int memberCount;
        private boolean isMember;
        private boolean isOwner;
        private boolean isModerator;
        private boolean hasPendingRequest;
        private GroupMemberRole userRole;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class MemberResponse {
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;
        private GroupMemberRole role;
        private LocalDateTime joinedAt;
        private boolean isOwner;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class GroupListResponse {
        private List<GroupResponse> groups;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class MemberListResponse {
        private List<MemberResponse> members;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class JoinResponse {
        private Long groupId;
        private String groupName;
        private GroupMemberRole role;
        private LocalDateTime joinedAt;
        private String message;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class LeaveResponse {
        private Long groupId;
        private String groupName;
        private LocalDateTime leftAt;
        private String message;
    }

    @Getter
    @Setter
    public static class JoinQuestionRequest {
        @NotBlank
        @Size(max = 500)
        private String question;
        
        private Boolean isRequired = true;
        
        private Integer displayOrder = 0;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class JoinQuestionResponse {
        private Long id;
        private String question;
        private Boolean isRequired;
        private Integer displayOrder;
    }

    @Getter
    @Setter
    public static class JoinAnswerRequest {
        private Long questionId;
        
        @NotBlank
        @Size(max = 1000)
        private String answer;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class JoinAnswerResponse {
        private Long id;
        private Long questionId;
        private String question;
        private String answer;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class JoinRequestResponse {
        private Long id;
        private Long groupId;
        private String groupName;
        private String groupAvatarUrl;
        private Long userId;
        private String username;
        private String displayName;
        private String userAvatarUrl;
        private GroupJoinRequestStatus status;
        private List<JoinAnswerResponse> answers;
        private String reviewMessage;
        private Long reviewedBy;
        private String reviewerUsername;
        private LocalDateTime createdAt;
        private LocalDateTime reviewedAt;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class JoinRequestListResponse {
        private List<JoinRequestResponse> requests;
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Getter
    @Setter
    public static class ReviewJoinRequestRequest {
        private Boolean approved;
        
        @Size(max = 500)
        private String message;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class PostInGroupRequest {
        @NotBlank
        private String content;
        
        private List<String> mediaUrls;
    }
}

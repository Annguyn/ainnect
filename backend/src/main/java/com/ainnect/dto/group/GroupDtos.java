package com.ainnect.dto.group;

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
    public static class CreateRequest {
        @NotBlank
        @Size(max = 120)
        private String name;
        
        @Size(max = 500)
        private String description;
        
        private Privacy privacy = Privacy.public_;
    }

    @Getter
    @Setter
    public static class UpdateRequest {
        @NotBlank
        @Size(max = 120)
        private String name;
        
        @Size(max = 500)
        private String description;
        
        private Privacy privacy;
    }

    @Getter
    @Setter
    public static class JoinRequest {
        private Long groupId;
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
        private Long ownerId;
        private String ownerUsername;
        private String ownerDisplayName;
        private int memberCount;
        private boolean isMember;
        private boolean isOwner;
        private boolean isModerator;
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
}

package com.ainnect.mapper;

import com.ainnect.common.enums.GroupMemberRole;
import com.ainnect.dto.group.GroupDtos;
import com.ainnect.entity.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class GroupMapper {
    
    @Value("${app.file.base-url:http://localhost:8080}")
    private String baseUrl;

    public Community toEntity(GroupDtos.CreateRequest request, User owner) {
        return Community.builder()
                .owner(owner)
                .name(request.getName())
                .description(request.getDescription())
                .privacy(request.getPrivacy())
                .avatarUrl(request.getAvatarUrl())
                .coverUrl(request.getCoverUrl())
                .requiresApproval(request.getRequiresApproval() != null ? request.getRequiresApproval() : false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public GroupDtos.GroupResponse toResponse(Community group, Long currentUserId, boolean isMember, 
                                               boolean isOwner, boolean isModerator, boolean hasPendingRequest,
                                               GroupMemberRole userRole, int memberCount) {
        return GroupDtos.GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .privacy(group.getPrivacy())
                .avatarUrl(buildFileUrl(group.getAvatarUrl()))
                .coverUrl(buildFileUrl(group.getCoverUrl()))
                .requiresApproval(group.getRequiresApproval())
                .ownerId(group.getOwner().getId())
                .ownerUsername(group.getOwner().getUsername())
                .ownerDisplayName(group.getOwner().getDisplayName())
                .memberCount(memberCount)
                .isMember(isMember)
                .isOwner(isOwner)
                .isModerator(isModerator)
                .hasPendingRequest(hasPendingRequest)
                .userRole(userRole)
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }

    public GroupDtos.MemberResponse toMemberResponse(GroupMember member, boolean isOwner) {
        return GroupDtos.MemberResponse.builder()
                .userId(member.getUser().getId())
                .username(member.getUser().getUsername())
                .displayName(member.getUser().getDisplayName())
                .avatarUrl(buildFileUrl(member.getUser().getAvatarUrl()))
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .isOwner(isOwner)
                .build();
    }

    public GroupJoinQuestion toQuestionEntity(GroupDtos.JoinQuestionRequest request, Community group) {
        return GroupJoinQuestion.builder()
                .group(group)
                .question(request.getQuestion())
                .isRequired(request.getIsRequired() != null ? request.getIsRequired() : true)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public GroupDtos.JoinQuestionResponse toQuestionResponse(GroupJoinQuestion question) {
        return GroupDtos.JoinQuestionResponse.builder()
                .id(question.getId())
                .question(question.getQuestion())
                .isRequired(question.getIsRequired())
                .displayOrder(question.getDisplayOrder())
                .build();
    }

    public GroupJoinAnswer toAnswerEntity(GroupDtos.JoinAnswerRequest request, GroupJoinRequest joinRequest, 
                                          GroupJoinQuestion question) {
        return GroupJoinAnswer.builder()
                .joinRequest(joinRequest)
                .question(question)
                .answer(request.getAnswer())
                .build();
    }

    public GroupDtos.JoinAnswerResponse toAnswerResponse(GroupJoinAnswer answer) {
        return GroupDtos.JoinAnswerResponse.builder()
                .id(answer.getId())
                .questionId(answer.getQuestion().getId())
                .question(answer.getQuestion().getQuestion())
                .answer(answer.getAnswer())
                .build();
    }

    public GroupDtos.JoinRequestResponse toJoinRequestResponse(GroupJoinRequest request, 
                                                                List<GroupJoinAnswer> answers, 
                                                                String reviewerUsername) {
        return GroupDtos.JoinRequestResponse.builder()
                .id(request.getId())
                .groupId(request.getGroup().getId())
                .groupName(request.getGroup().getName())
                .groupAvatarUrl(buildFileUrl(request.getGroup().getAvatarUrl()))
                .userId(request.getUser().getId())
                .username(request.getUser().getUsername())
                .displayName(request.getUser().getDisplayName())
                .userAvatarUrl(buildFileUrl(request.getUser().getAvatarUrl()))
                .status(request.getStatus())
                .answers(answers.stream()
                        .map(this::toAnswerResponse)
                        .collect(Collectors.toList()))
                .reviewMessage(request.getReviewMessage())
                .reviewedBy(request.getReviewedBy())
                .reviewerUsername(reviewerUsername)
                .createdAt(request.getCreatedAt())
                .reviewedAt(request.getReviewedAt())
                .build();
    }
    
    private String buildFileUrl(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return null;
        }
        
        if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
            return fileName;
        }
        
        if (fileName.contains("/api/files/")) {
            String path = fileName.substring(fileName.indexOf("/api/files/"));
            return baseUrl + path;
        }

        return baseUrl + "/api/files/general/" + fileName;
    }
}

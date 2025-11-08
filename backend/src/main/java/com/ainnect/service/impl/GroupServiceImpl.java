package com.ainnect.service.impl;

import com.ainnect.common.enums.GroupJoinRequestStatus;
import com.ainnect.common.enums.GroupMemberRole;
import com.ainnect.dto.group.GroupDtos;
import com.ainnect.entity.*;
import com.ainnect.mapper.GroupMapper;
import com.ainnect.repository.*;
import com.ainnect.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupServiceImpl implements GroupService {

    private final CommunityRepository communityRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupJoinQuestionRepository groupJoinQuestionRepository;
    private final GroupJoinRequestRepository groupJoinRequestRepository;
    private final GroupJoinAnswerRepository groupJoinAnswerRepository;
    private final UserRepository userRepository;
    private final GroupMapper groupMapper;

    @Override
    public GroupDtos.GroupResponse createGroup(GroupDtos.CreateRequest request, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Community group = groupMapper.toEntity(request, owner);
        Community savedGroup = communityRepository.save(group);

        GroupMemberId memberId = new GroupMemberId(savedGroup.getId(), ownerId);
        GroupMember ownerMember = GroupMember.builder()
                .id(memberId)
                .group(savedGroup)
                .user(owner)
                .role(GroupMemberRole.admin)
                .joinedAt(LocalDateTime.now())
                .build();
        groupMemberRepository.save(ownerMember);

        if (request.getJoinQuestions() != null && !request.getJoinQuestions().isEmpty()) {
            List<GroupJoinQuestion> questions = request.getJoinQuestions().stream()
                    .map(q -> groupMapper.toQuestionEntity(q, savedGroup))
                    .collect(Collectors.toList());
            groupJoinQuestionRepository.saveAll(questions);
        }

        return groupMapper.toResponse(savedGroup, ownerId, true, true, false, false, GroupMemberRole.admin, 1);
    }

    @Override
    public GroupDtos.GroupResponse updateGroup(Long groupId, GroupDtos.UpdateRequest request, Long currentUserId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (!group.getOwner().getId().equals(currentUserId) && 
            !groupMemberRepository.existsByGroupIdAndUserIdAndRole(groupId, currentUserId, GroupMemberRole.admin)) {
            throw new IllegalArgumentException("Only owner or admin can update group");
        }

        group.setName(request.getName());
        group.setDescription(request.getDescription());
        if (request.getPrivacy() != null) {
            group.setPrivacy(request.getPrivacy());
        }
        if (request.getAvatarUrl() != null) {
            group.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getCoverUrl() != null) {
            group.setCoverUrl(request.getCoverUrl());
        }
        if (request.getRequiresApproval() != null) {
            group.setRequiresApproval(request.getRequiresApproval());
        }
        group.setUpdatedAt(LocalDateTime.now());

        Community updatedGroup = communityRepository.save(group);

        boolean isMember = groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUserId);
        boolean isOwner = group.getOwner().getId().equals(currentUserId);
        boolean isModerator = groupMemberRepository.existsByGroupIdAndUserIdAndRole(
                groupId, currentUserId, GroupMemberRole.moderator);
        int memberCount = groupMemberRepository.countByGroupId(groupId);
        GroupMemberRole userRole = getUserRole(groupId, currentUserId);

        return groupMapper.toResponse(updatedGroup, currentUserId, isMember, isOwner, isModerator, false, userRole, memberCount);
    }

    @Override
    public void deleteGroup(Long groupId, Long currentUserId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (!group.getOwner().getId().equals(currentUserId)) {
            throw new IllegalArgumentException("Only owner can delete group");
        }

        group.setDeletedAt(LocalDateTime.now());
        communityRepository.save(group);
    }

    @Override
    @Transactional(readOnly = true)
    public GroupDtos.GroupResponse getGroupById(Long groupId, Long currentUserId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (group.getDeletedAt() != null) {
            throw new IllegalArgumentException("Group has been deleted");
        }

        boolean isMember = currentUserId != null && groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUserId);
        boolean isOwner = currentUserId != null && group.getOwner().getId().equals(currentUserId);
        boolean isModerator = currentUserId != null && groupMemberRepository.existsByGroupIdAndUserIdAndRole(
                groupId, currentUserId, GroupMemberRole.moderator);
        boolean hasPendingRequest = currentUserId != null && 
                groupJoinRequestRepository.existsByGroupIdAndUserIdAndStatus(groupId, currentUserId, GroupJoinRequestStatus.pending);
        int memberCount = groupMemberRepository.countByGroupId(groupId);
        GroupMemberRole userRole = currentUserId != null ? getUserRole(groupId, currentUserId) : null;

        return groupMapper.toResponse(group, currentUserId, isMember, isOwner, isModerator, hasPendingRequest, userRole, memberCount);
    }

    @Override
    @Transactional(readOnly = true)
    public GroupDtos.GroupListResponse getAllGroups(Pageable pageable, Long currentUserId) {
        Page<Community> groupPage = communityRepository.findAllActiveCommunities(pageable);
        
        List<GroupDtos.GroupResponse> groups = groupPage.getContent().stream()
                .map(group -> {
                    boolean isMember = currentUserId != null && groupMemberRepository.existsByGroupIdAndUserId(group.getId(), currentUserId);
                    boolean isOwner = currentUserId != null && group.getOwner().getId().equals(currentUserId);
                    boolean isModerator = currentUserId != null && groupMemberRepository.existsByGroupIdAndUserIdAndRole(
                            group.getId(), currentUserId, GroupMemberRole.moderator);
                    boolean hasPendingRequest = currentUserId != null && 
                            groupJoinRequestRepository.existsByGroupIdAndUserIdAndStatus(group.getId(), currentUserId, GroupJoinRequestStatus.pending);
                    int memberCount = groupMemberRepository.countByGroupId(group.getId());
                    GroupMemberRole userRole = currentUserId != null ? getUserRole(group.getId(), currentUserId) : null;
                    
                    return groupMapper.toResponse(group, currentUserId, isMember, isOwner, isModerator, hasPendingRequest, userRole, memberCount);
                })
                .collect(Collectors.toList());

        return GroupDtos.GroupListResponse.builder()
                .groups(groups)
                .currentPage(groupPage.getNumber())
                .pageSize(groupPage.getSize())
                .totalElements(groupPage.getTotalElements())
                .totalPages(groupPage.getTotalPages())
                .hasNext(groupPage.hasNext())
                .hasPrevious(groupPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GroupDtos.GroupListResponse getGroupsByOwner(Long ownerId, Pageable pageable) {
        Page<Community> groupPage = communityRepository.findByOwnerId(ownerId, pageable);
        
        List<GroupDtos.GroupResponse> groups = groupPage.getContent().stream()
                .map(group -> {
                    int memberCount = groupMemberRepository.countByGroupId(group.getId());
                    return groupMapper.toResponse(group, ownerId, true, true, false, false, GroupMemberRole.admin, memberCount);
                })
                .collect(Collectors.toList());

        return GroupDtos.GroupListResponse.builder()
                .groups(groups)
                .currentPage(groupPage.getNumber())
                .pageSize(groupPage.getSize())
                .totalElements(groupPage.getTotalElements())
                .totalPages(groupPage.getTotalPages())
                .hasNext(groupPage.hasNext())
                .hasPrevious(groupPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GroupDtos.GroupListResponse getGroupsByMember(Long userId, Pageable pageable) {
        Page<GroupMember> memberPage = groupMemberRepository.findByUserId(userId, pageable);
        
        List<GroupDtos.GroupResponse> groups = memberPage.getContent().stream()
                .map(member -> {
                    Community group = member.getGroup();
                    boolean isOwner = group.getOwner().getId().equals(userId);
                    boolean isModerator = member.getRole() == GroupMemberRole.moderator;
                    int memberCount = groupMemberRepository.countByGroupId(group.getId());
                    GroupMemberRole userRole = member.getRole();
                    
                    return groupMapper.toResponse(group, userId, true, isOwner, isModerator, false, userRole, memberCount);
                })
                .collect(Collectors.toList());

        return GroupDtos.GroupListResponse.builder()
                .groups(groups)
                .currentPage(memberPage.getNumber())
                .pageSize(memberPage.getSize())
                .totalElements(memberPage.getTotalElements())
                .totalPages(memberPage.getTotalPages())
                .hasNext(memberPage.hasNext())
                .hasPrevious(memberPage.hasPrevious())
                .build();
    }

    @Override
    public GroupDtos.JoinResponse joinGroup(Long groupId, Long userId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (group.getDeletedAt() != null) {
            throw new IllegalArgumentException("Group has been deleted");
        }

        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new IllegalArgumentException("Already a member of this group");
        }

        if (groupJoinRequestRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, GroupJoinRequestStatus.pending)) {
            throw new IllegalArgumentException("You already have a pending join request");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (group.getRequiresApproval()) {
            throw new IllegalArgumentException("This group requires approval. Please submit a join request with answers.");
        }

        GroupMemberId memberId = new GroupMemberId(groupId, userId);
        GroupMember member = GroupMember.builder()
                .id(memberId)
                .group(group)
                .user(user)
                .role(GroupMemberRole.member)
                .joinedAt(LocalDateTime.now())
                .build();
        groupMemberRepository.save(member);

        return GroupDtos.JoinResponse.builder()
                .groupId(groupId)
                .groupName(group.getName())
                .role(GroupMemberRole.member)
                .joinedAt(member.getJoinedAt())
                .message("Successfully joined the group")
                .build();
    }

    @Override
    public GroupDtos.LeaveResponse leaveGroup(Long groupId, Long userId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (group.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("Owner cannot leave the group. Please transfer ownership or delete the group.");
        }

        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new IllegalArgumentException("Not a member of this group");
        }

        groupMemberRepository.deleteByGroupIdAndUserId(groupId, userId);

        return GroupDtos.LeaveResponse.builder()
                .groupId(groupId)
                .groupName(group.getName())
                .leftAt(LocalDateTime.now())
                .message("Successfully left the group")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GroupDtos.MemberListResponse getGroupMembers(Long groupId, Pageable pageable, Long currentUserId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        Page<GroupMember> memberPage = groupMemberRepository.findByGroupId(groupId, pageable);
        
        List<GroupDtos.MemberResponse> members = memberPage.getContent().stream()
                .map(member -> {
                    boolean isOwner = group.getOwner().getId().equals(member.getUser().getId());
                    return groupMapper.toMemberResponse(member, isOwner);
                })
                .collect(Collectors.toList());

        return GroupDtos.MemberListResponse.builder()
                .members(members)
                .currentPage(memberPage.getNumber())
                .pageSize(memberPage.getSize())
                .totalElements(memberPage.getTotalElements())
                .totalPages(memberPage.getTotalPages())
                .hasNext(memberPage.hasNext())
                .hasPrevious(memberPage.hasPrevious())
                .build();
    }

    @Override
    public GroupDtos.MemberResponse updateMemberRole(Long groupId, Long targetUserId, GroupMemberRole newRole, Long currentUserId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (!group.getOwner().getId().equals(currentUserId) && 
            !groupMemberRepository.existsByGroupIdAndUserIdAndRole(groupId, currentUserId, GroupMemberRole.admin)) {
            throw new IllegalArgumentException("Only owner or admin can update member roles");
        }

        if (group.getOwner().getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot change owner's role");
        }

        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        member.setRole(newRole);
        GroupMember updatedMember = groupMemberRepository.save(member);

        boolean isOwner = group.getOwner().getId().equals(targetUserId);
        return groupMapper.toMemberResponse(updatedMember, isOwner);
    }

    @Override
    public void removeMember(Long groupId, Long targetUserId, Long currentUserId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (!group.getOwner().getId().equals(currentUserId) && 
            !groupMemberRepository.existsByGroupIdAndUserIdAndRole(groupId, currentUserId, GroupMemberRole.admin) &&
            !groupMemberRepository.existsByGroupIdAndUserIdAndRole(groupId, currentUserId, GroupMemberRole.moderator)) {
            throw new IllegalArgumentException("Only owner, admin, or moderator can remove members");
        }

        if (group.getOwner().getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot remove the owner");
        }

        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, targetUserId)) {
            throw new IllegalArgumentException("User is not a member of this group");
        }

        groupMemberRepository.deleteByGroupIdAndUserId(groupId, targetUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isMember(Long groupId, Long userId) {
        return groupMemberRepository.existsByGroupIdAndUserId(groupId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isOwner(Long groupId, Long userId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        return group.getOwner().getId().equals(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isModerator(Long groupId, Long userId) {
        return groupMemberRepository.existsByGroupIdAndUserIdAndRole(groupId, userId, GroupMemberRole.moderator);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupDtos.JoinQuestionResponse> getJoinQuestions(Long groupId) {
        communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        List<GroupJoinQuestion> questions = groupJoinQuestionRepository.findByGroupId(groupId);
        return questions.stream()
                .map(groupMapper::toQuestionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void updateJoinQuestions(Long groupId, List<GroupDtos.JoinQuestionRequest> questions, Long currentUserId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (!group.getOwner().getId().equals(currentUserId) && 
            !groupMemberRepository.existsByGroupIdAndUserIdAndRole(groupId, currentUserId, GroupMemberRole.admin)) {
            throw new IllegalArgumentException("Only owner or admin can update join questions");
        }

        groupJoinQuestionRepository.deleteByGroupId(groupId);

        if (questions != null && !questions.isEmpty()) {
            List<GroupJoinQuestion> questionEntities = questions.stream()
                    .map(q -> groupMapper.toQuestionEntity(q, group))
                    .collect(Collectors.toList());
            groupJoinQuestionRepository.saveAll(questionEntities);
        }
    }

    @Override
    public GroupDtos.JoinRequestResponse submitJoinRequest(Long groupId, List<GroupDtos.JoinAnswerRequest> answers, Long userId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (group.getDeletedAt() != null) {
            throw new IllegalArgumentException("Group has been deleted");
        }

        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new IllegalArgumentException("Already a member of this group");
        }

        if (groupJoinRequestRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, GroupJoinRequestStatus.pending)) {
            throw new IllegalArgumentException("You already have a pending join request");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<GroupJoinQuestion> questions = groupJoinQuestionRepository.findByGroupId(groupId);
        
        if (questions.isEmpty() && !group.getRequiresApproval()) {
            throw new IllegalArgumentException("This group does not require approval. You can join directly.");
        }
        
        if (!questions.isEmpty() && (answers == null || answers.isEmpty())) {
            throw new IllegalArgumentException("Please answer the join questions");
        }

        List<GroupJoinQuestion> requiredQuestions = groupJoinQuestionRepository.findRequiredQuestionsByGroupId(groupId);
        if (answers != null) {
            List<Long> answeredQuestionIds = answers.stream()
                    .map(GroupDtos.JoinAnswerRequest::getQuestionId)
                    .collect(Collectors.toList());
            
            for (GroupJoinQuestion req : requiredQuestions) {
                if (!answeredQuestionIds.contains(req.getId())) {
                    throw new IllegalArgumentException("Please answer all required questions");
                }
            }
        }

        GroupJoinRequest joinRequest = GroupJoinRequest.builder()
                .group(group)
                .user(user)
                .status(GroupJoinRequestStatus.pending)
                .createdAt(LocalDateTime.now())
                .build();
        GroupJoinRequest savedRequest = groupJoinRequestRepository.save(joinRequest);

        List<GroupJoinAnswer> answerEntities = new ArrayList<>();
        if (answers != null && !answers.isEmpty()) {
            for (GroupDtos.JoinAnswerRequest answerReq : answers) {
                GroupJoinQuestion question = groupJoinQuestionRepository.findById(answerReq.getQuestionId())
                        .orElseThrow(() -> new IllegalArgumentException("Question not found: " + answerReq.getQuestionId()));
                
                GroupJoinAnswer answer = groupMapper.toAnswerEntity(answerReq, savedRequest, question);
                answerEntities.add(answer);
            }
            groupJoinAnswerRepository.saveAll(answerEntities);
        }

        return groupMapper.toJoinRequestResponse(savedRequest, answerEntities, null);
    }

    @Override
    @Transactional(readOnly = true)
    public GroupDtos.JoinRequestListResponse getPendingJoinRequests(Long groupId, Pageable pageable, Long currentUserId) {
        Community group = communityRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (!group.getOwner().getId().equals(currentUserId) && 
            !groupMemberRepository.existsByGroupIdAndUserIdAndRole(groupId, currentUserId, GroupMemberRole.admin) &&
            !groupMemberRepository.existsByGroupIdAndUserIdAndRole(groupId, currentUserId, GroupMemberRole.moderator)) {
            throw new IllegalArgumentException("Only owner, admin, or moderator can view join requests");
        }

        Page<GroupJoinRequest> requestPage = groupJoinRequestRepository.findByGroupIdAndStatus(
                groupId, GroupJoinRequestStatus.pending, pageable);

        List<GroupDtos.JoinRequestResponse> requests = requestPage.getContent().stream()
                .map(request -> {
                    List<GroupJoinAnswer> answers = groupJoinAnswerRepository.findByJoinRequestId(request.getId());
                    String reviewerUsername = null;
                    if (request.getReviewedBy() != null) {
                        reviewerUsername = userRepository.findById(request.getReviewedBy())
                                .map(User::getUsername)
                                .orElse(null);
                    }
                    return groupMapper.toJoinRequestResponse(request, answers, reviewerUsername);
                })
                .collect(Collectors.toList());

        return GroupDtos.JoinRequestListResponse.builder()
                .requests(requests)
                .currentPage(requestPage.getNumber())
                .pageSize(requestPage.getSize())
                .totalElements(requestPage.getTotalElements())
                .totalPages(requestPage.getTotalPages())
                .hasNext(requestPage.hasNext())
                .hasPrevious(requestPage.hasPrevious())
                .build();
    }

    @Override
    public GroupDtos.JoinRequestResponse reviewJoinRequest(Long requestId, GroupDtos.ReviewJoinRequestRequest request, Long reviewerId) {
        GroupJoinRequest joinRequest = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Join request not found"));

        Community group = joinRequest.getGroup();
        
        if (!group.getOwner().getId().equals(reviewerId) && 
            !groupMemberRepository.existsByGroupIdAndUserIdAndRole(group.getId(), reviewerId, GroupMemberRole.admin) &&
            !groupMemberRepository.existsByGroupIdAndUserIdAndRole(group.getId(), reviewerId, GroupMemberRole.moderator)) {
            throw new IllegalArgumentException("Only owner, admin, or moderator can review join requests");
        }

        if (joinRequest.getStatus() != GroupJoinRequestStatus.pending) {
            throw new IllegalArgumentException("This join request has already been reviewed");
        }

        if (request.getApproved()) {
            joinRequest.setStatus(GroupJoinRequestStatus.approved);
            
            GroupMemberId memberId = new GroupMemberId(group.getId(), joinRequest.getUser().getId());
            GroupMember member = GroupMember.builder()
                    .id(memberId)
                    .group(group)
                    .user(joinRequest.getUser())
                    .role(GroupMemberRole.member)
                    .joinedAt(LocalDateTime.now())
                    .build();
            groupMemberRepository.save(member);
        } else {
            joinRequest.setStatus(GroupJoinRequestStatus.rejected);
        }

        joinRequest.setReviewedBy(reviewerId);
        joinRequest.setReviewMessage(request.getMessage());
        joinRequest.setReviewedAt(LocalDateTime.now());
        
        GroupJoinRequest updatedRequest = groupJoinRequestRepository.save(joinRequest);

        List<GroupJoinAnswer> answers = groupJoinAnswerRepository.findByJoinRequestId(requestId);
        String reviewerUsername = userRepository.findById(reviewerId)
                .map(User::getUsername)
                .orElse(null);

        return groupMapper.toJoinRequestResponse(updatedRequest, answers, reviewerUsername);
    }

    @Override
    @Transactional(readOnly = true)
    public GroupDtos.JoinRequestResponse getUserJoinRequest(Long groupId, Long userId) {
        GroupJoinRequest joinRequest = groupJoinRequestRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new IllegalArgumentException("No join request found"));

        List<GroupJoinAnswer> answers = groupJoinAnswerRepository.findByJoinRequestId(joinRequest.getId());
        String reviewerUsername = null;
        if (joinRequest.getReviewedBy() != null) {
            reviewerUsername = userRepository.findById(joinRequest.getReviewedBy())
                    .map(User::getUsername)
                    .orElse(null);
        }

        return groupMapper.toJoinRequestResponse(joinRequest, answers, reviewerUsername);
    }

    @Override
    public void cancelJoinRequest(Long requestId, Long userId) {
        GroupJoinRequest joinRequest = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Join request not found"));

        if (!joinRequest.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only cancel your own join requests");
        }

        if (joinRequest.getStatus() != GroupJoinRequestStatus.pending) {
            throw new IllegalArgumentException("Can only cancel pending join requests");
        }

        groupJoinAnswerRepository.deleteByJoinRequestId(requestId);
        groupJoinRequestRepository.delete(joinRequest);
    }

    private GroupMemberRole getUserRole(Long groupId, Long userId) {
        return groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .map(GroupMember::getRole)
                .orElse(null);
    }
}


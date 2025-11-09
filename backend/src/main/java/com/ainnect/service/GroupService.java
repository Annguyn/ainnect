package com.ainnect.service;

import com.ainnect.common.enums.GroupMemberRole;
import com.ainnect.dto.group.GroupDtos;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface GroupService {
    
 
    GroupDtos.GroupResponse createGroup(GroupDtos.CreateRequest request, Long ownerId);
 
    GroupDtos.GroupResponse updateGroup(Long groupId, GroupDtos.UpdateRequest request, Long currentUserId);

    void deleteGroup(Long groupId, Long currentUserId);
    

    GroupDtos.GroupResponse getGroupById(Long groupId, Long currentUserId);
    
    GroupDtos.GroupListResponse getAllGroups(Pageable pageable, Long currentUserId);

    GroupDtos.GroupListResponse getGroupsByOwner(Long ownerId, Pageable pageable);

    GroupDtos.GroupListResponse getGroupsByMember(Long userId, Pageable pageable);
    

    GroupDtos.JoinResponse joinGroup(Long groupId, Long userId);
    GroupDtos.LeaveResponse leaveGroup(Long groupId, Long userId);
    

    GroupDtos.MemberListResponse getGroupMembers(Long groupId, Pageable pageable, Long currentUserId);
    

    GroupDtos.MemberResponse updateMemberRole(Long groupId, Long targetUserId, GroupMemberRole newRole, Long currentUserId);
    

    void removeMember(Long groupId, Long targetUserId, Long currentUserId);

    boolean isMember(Long groupId, Long userId);
    

    boolean isOwner(Long groupId, Long userId);
    

    boolean isModerator(Long groupId, Long userId);

    List<GroupDtos.JoinQuestionResponse> getJoinQuestions(Long groupId);
    

    void updateJoinQuestions(Long groupId, List<GroupDtos.JoinQuestionRequest> questions, Long currentUserId);
    
 
    GroupDtos.JoinRequestResponse submitJoinRequest(Long groupId, List<GroupDtos.JoinAnswerRequest> answers, Long userId);
    

    GroupDtos.JoinRequestListResponse getPendingJoinRequests(Long groupId, Pageable pageable, Long currentUserId);

    GroupDtos.JoinRequestResponse reviewJoinRequest(Long requestId, GroupDtos.ReviewJoinRequestRequest request, Long reviewerId);
    

    GroupDtos.JoinRequestResponse getUserJoinRequest(Long groupId, Long userId);

    void cancelJoinRequest(Long requestId, Long userId);
}

package com.ainnect.service;

import com.ainnect.common.enums.GroupMemberRole;
import com.ainnect.dto.group.GroupDtos;
import org.springframework.data.domain.Pageable;

public interface GroupService {
    
    /**
     * Create a new group
     */
    GroupDtos.GroupResponse createGroup(GroupDtos.CreateRequest request, Long ownerId);
    
    /**
     * Update group information
     */
    GroupDtos.GroupResponse updateGroup(Long groupId, GroupDtos.UpdateRequest request, Long currentUserId);
    
    /**
     * Delete a group (only owner can delete)
     */
    void deleteGroup(Long groupId, Long currentUserId);
    
    /**
     * Get group details
     */
    GroupDtos.GroupResponse getGroupById(Long groupId, Long currentUserId);
    
    /**
     * Get all groups with pagination
     */
    GroupDtos.GroupListResponse getAllGroups(Pageable pageable, Long currentUserId);
    
    /**
     * Get groups owned by user
     */
    GroupDtos.GroupListResponse getGroupsByOwner(Long ownerId, Pageable pageable);
    
    /**
     * Get groups where user is a member
     */
    GroupDtos.GroupListResponse getGroupsByMember(Long userId, Pageable pageable);
    
    /**
     * Join a group
     */
    GroupDtos.JoinResponse joinGroup(Long groupId, Long userId);
    
    /**
     * Leave a group
     */
    GroupDtos.LeaveResponse leaveGroup(Long groupId, Long userId);
    
    /**
     * Get group members
     */
    GroupDtos.MemberListResponse getGroupMembers(Long groupId, Pageable pageable, Long currentUserId);
    
    /**
     * Update member role (only owner/moderator can do this)
     */
    GroupDtos.MemberResponse updateMemberRole(Long groupId, Long targetUserId, GroupMemberRole newRole, Long currentUserId);
    
    /**
     * Remove member from group (only owner/moderator can do this)
     */
    void removeMember(Long groupId, Long targetUserId, Long currentUserId);
    
    /**
     * Check if user is member of group
     */
    boolean isMember(Long groupId, Long userId);
    
    /**
     * Check if user is owner of group
     */
    boolean isOwner(Long groupId, Long userId);
    
    /**
     * Check if user is moderator of group
     */
    boolean isModerator(Long groupId, Long userId);
}

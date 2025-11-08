import { apiClient } from './apiClient';
import { debugLogger } from '../utils/debugLogger';
import { PostsResponse } from './postService';
import {
  Group,
  GroupMember,
  JoinQuestion,
  JoinRequest,
  CreateGroupRequest,
  UpdateGroupRequest,
  JoinGroupResponse,
  LeaveGroupResponse,
  BlockUserFromGroupRequest,
  BlockUserFromGroupResponse,
  UpdateMemberRoleRequest,
  SubmitJoinRequestData,
  ReviewJoinRequestData,
  GroupsResponse,
  GroupMembersResponse,
  JoinRequestsResponse,
  CreateGroupPostRequest,
  GroupPost,
  ApiResponse
} from '../types';

class GroupService {
  private baseUrl = '/api/groups';
  private postsUrl = '/api/posts';
  private joinRequestsUrl = '/api/join-requests';

  async createGroup(groupData: CreateGroupRequest | FormData): Promise<Group> {
    const endpoint = this.baseUrl;
    debugLogger.logApiCall('POST', endpoint, groupData);
    try {
      console.log('createGroup received groupData:', groupData);
      
      let formData: FormData;
      
      if (groupData instanceof FormData) {
        formData = groupData;
        console.log("Using provided FormData directly");
      } else {
        formData = new FormData();
        
        const groupName = (groupData as any).name;
        if (typeof groupName === 'string' && groupName.trim() !== "") {
          formData.append('name', groupName.trim());
        }
        
        Object.entries(groupData).forEach(([key, value]) => {
          if (key === 'name') return; // already handled
          if (key === 'coverImage' && value instanceof File) {
            formData.append('coverImage', value);
          } else if (value !== null && value !== undefined && value !== "") {
            formData.append(key, String(value));
          }
        });

        let isFormDataEmpty = true;
        formData.forEach(() => { isFormDataEmpty = false; });
        if (isFormDataEmpty) {
          if ((groupData as any).name) formData.append('name', (groupData as any).name);
          if ((groupData as any).description) formData.append('description', (groupData as any).description);
          if ((groupData as any).privacy) formData.append('visibility', (groupData as any).privacy);
          if ((groupData as any).requiresApproval !== undefined) formData.append('requiresApproval', String((groupData as any).requiresApproval));
          if ((groupData as any).avatarUrl) formData.append('avatarUrl', (groupData as any).avatarUrl);
          if ((groupData as any).coverImage instanceof File) formData.append('coverImage', (groupData as any).coverImage);
          if ((groupData as any).joinQuestions) formData.append('joinQuestions', JSON.stringify((groupData as any).joinQuestions));
        }
      }

      console.log("FormData content:");
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });
      
      const response = await apiClient.post<Group>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      debugLogger.logApiResponse('POST', endpoint, response);
      return response;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      throw error;
    }
  }

  async updateGroup(groupId: number, updateData: UpdateGroupRequest): Promise<Group> {
    const endpoint = `${this.baseUrl}/${groupId}`;
    debugLogger.logApiCall('PUT', endpoint, updateData);
    try {
      const response = await apiClient.put<Group>(endpoint, updateData);
      debugLogger.logApiResponse('PUT', endpoint, response);
      return response;
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      throw error;
    }
  }

  async deleteGroup(groupId: number): Promise<void> {
    const endpoint = `${this.baseUrl}/${groupId}`;
    debugLogger.logApiCall('DELETE', endpoint);
    try {
      await apiClient.delete(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, 'success');
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      throw error;
    }
  }

  async getGroupById(groupId: number): Promise<Group> {
    const endpoint = `${this.baseUrl}/${groupId}`;
    debugLogger.logApiCall('GET', endpoint);
    try {
      const response = await apiClient.get<any>(endpoint);
      // Unwrap ApiResponse format
      if (response && typeof response === 'object' && 'data' in response) {
        const groupData = (response as { data: Group }).data;
        debugLogger.logApiResponse('GET', endpoint, groupData);
        return groupData;
      }
      debugLogger.logApiResponse('GET', endpoint, response);
      return response as Group;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  /**
   * List all groups (paginated)
   */
  async listGroups(page = 0, size = 10): Promise<GroupsResponse> {
    const endpoint = this.baseUrl;
    debugLogger.logApiCall('GET', endpoint, { page, size });
    try {
      const response = await apiClient.get<{
        result: string;
        message: string;
        data: {
          groups: Group[];
          currentPage: number;
          pageSize: number;
          totalElements: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        }
      }>(endpoint, {
        params: { page, size }
      });

      const transformedResponse: GroupsResponse = {
        content: response.data.groups,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        size: response.data.pageSize,
        number: response.data.currentPage,
        first: !response.data.hasPrevious,
        last: !response.data.hasNext,
        hasNext: response.data.hasNext,
        hasPrevious: response.data.hasPrevious
      };
      debugLogger.logApiResponse('GET', endpoint, transformedResponse);
      debugLogger.log('GroupService', '📋 Groups loaded', {
        totalGroups: transformedResponse.content?.length || 0,
        totalElements: transformedResponse.totalElements,
        totalPages: transformedResponse.totalPages,
        currentPage: transformedResponse.number
      });
      return transformedResponse;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  /**
   * List groups by owner
   */
  async listOwnerGroups(ownerId: number, page = 0, size = 10): Promise<GroupsResponse> {
    const endpoint = `${this.baseUrl}/owner/${ownerId}`;
    debugLogger.logApiCall('GET', endpoint, { page, size });
    try {
      const response = await apiClient.get<{
        result: string;
        message: string;
        data: {
          groups: Group[];
          currentPage: number;
          pageSize: number;
          totalElements: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        }
      }>(endpoint, {
        params: { page, size }
      });

      const transformedResponse: GroupsResponse = {
        content: response.data.groups,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        size: response.data.pageSize,
        number: response.data.currentPage,
        first: !response.data.hasPrevious,
        last: !response.data.hasNext,
        hasNext: response.data.hasNext,
        hasPrevious: response.data.hasPrevious
      };

      debugLogger.logApiResponse('GET', endpoint, transformedResponse);
      debugLogger.log('GroupService', '👑 Owner groups loaded', {
        ownerId,
        groupsCount: transformedResponse.content?.length || 0,
        totalElements: transformedResponse.totalElements
      });
      return transformedResponse;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  /**
   * List groups where user is a member
   */
  async listMemberGroups(userId: number, page = 0, size = 10): Promise<GroupsResponse> {
    const endpoint = `${this.baseUrl}/member/${userId}`;
    debugLogger.logApiCall('GET', endpoint, { page, size });
    try {
      const response = await apiClient.get<{
        result: string;
        message: string;
        data: {
          groups: Group[];
          currentPage: number;
          pageSize: number;
          totalElements: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        }
      }>(endpoint, {
        params: { page, size }
      });

      const transformedResponse: GroupsResponse = {
        content: response.data.groups,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        size: response.data.pageSize,
        number: response.data.currentPage,
        first: !response.data.hasPrevious,
        last: !response.data.hasNext,
        hasNext: response.data.hasNext,
        hasPrevious: response.data.hasPrevious
      };

      debugLogger.logApiResponse('GET', endpoint, transformedResponse);
      debugLogger.log('GroupService', '👥 Member groups loaded', {
        userId,
        groupsCount: transformedResponse.content?.length || 0,
        totalElements: transformedResponse.totalElements
      });
      return transformedResponse;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  // ================== MEMBER MANAGEMENT ==================

  /**
   * Join group directly (for public groups or when approval not required)
   */
  async joinGroup(groupId: number, answers?: any[]): Promise<JoinGroupResponse> {
    const endpoint = `${this.baseUrl}/${groupId}/join`;
    debugLogger.logApiCall('POST', endpoint, { hasAnswers: !!answers?.length });
    try {
      const requestData = answers && answers.length > 0 ? { answers } : {};
      const response = await apiClient.post<ApiResponse<JoinGroupResponse>>(endpoint, requestData);
      const joinData = response.data;
      
      debugLogger.logApiResponse('POST', endpoint, joinData);
      debugLogger.log('GroupService', '✅ Joined group successfully', { 
        groupId,
        groupName: joinData.groupName,
        role: joinData.role,
        joinedAt: joinData.joinedAt,
        hasAnswers: !!answers?.length
      });
      
      return joinData;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Leave group
   */
  async leaveGroup(groupId: number): Promise<LeaveGroupResponse> {
    const endpoint = `${this.baseUrl}/${groupId}/leave`;
    debugLogger.logApiCall('POST', endpoint);
    try {
      const response = await apiClient.post<ApiResponse<LeaveGroupResponse>>(endpoint);
      const leaveData = response.data;
      
      debugLogger.logApiResponse('POST', endpoint, leaveData);
      debugLogger.log('GroupService', '👋 Left group successfully', { 
        groupId,
        groupName: leaveData.groupName,
        leftAt: leaveData.leftAt
      });
      
      return leaveData;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Block user from rejoining a group
   */
  async blockUserFromGroup(request: BlockUserFromGroupRequest): Promise<BlockUserFromGroupResponse> {
    const endpoint = `${this.baseUrl}/${request.groupId}/block-user`;
    debugLogger.logApiCall('POST', endpoint, request);
    try {
      const response = await apiClient.post<ApiResponse<BlockUserFromGroupResponse>>(endpoint, request);
      const blockData = response.data;
      
      debugLogger.logApiResponse('POST', endpoint, blockData);
      debugLogger.log('GroupService', '🚫 User blocked from group', { 
        userId: request.userId,
        groupId: request.groupId,
        groupName: blockData.groupName,
        blockedAt: blockData.blockedAt,
        reason: request.reason
      });
      
      return blockData;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Unblock user from a group
   */
  async unblockUserFromGroup(userId: number, groupId: number): Promise<void> {
    const endpoint = `${this.baseUrl}/${groupId}/unblock-user/${userId}`;
    debugLogger.logApiCall('DELETE', endpoint);
    try {
      await apiClient.delete(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, 'success');
      debugLogger.log('GroupService', '✅ User unblocked from group', { userId, groupId });
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Get user's group history (groups they've been a member of)
   */
  async getUserGroupHistory(userId: number, page = 0, size = 10): Promise<GroupsResponse> {
    const endpoint = `${this.baseUrl}/member/${userId}`;
    debugLogger.logApiCall('GET', endpoint, { page, size });
    try {
      const response = await apiClient.get<ApiResponse<GroupsResponse>>(endpoint, {
        params: { page, size }
      });
      const historyData = response.data;
      
      debugLogger.logApiResponse('GET', endpoint, historyData);
      debugLogger.log('GroupService', '📚 User group history loaded', {
        userId,
        groupsCount: historyData.content?.length || 0,
        totalElements: historyData.totalElements
      });
      
      return historyData;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  /**
   * List group members
   */
  async listMembers(groupId: number, page = 0, size = 10): Promise<GroupMembersResponse> {
    const endpoint = `${this.baseUrl}/${groupId}/members`;
    debugLogger.logApiCall('GET', endpoint, { page, size });
    try {
      const response = await apiClient.get<any>(endpoint, {
        params: { page, size }
      });
      
      // Handle the API response format: {result, message, data: {members, currentPage, pageSize, ...}}
      let membersResponse: GroupMembersResponse;
      if (response && typeof response === 'object' && 'data' in response) {
        const apiData = (response as { data: any }).data;
        // Transform the API response to match GroupMembersResponse format
        membersResponse = {
          content: apiData.members || [],
          totalElements: apiData.totalElements || 0,
          totalPages: apiData.totalPages || 0,
          size: apiData.pageSize || size,
          number: apiData.currentPage || page,
          first: !apiData.hasPrevious,
          last: !apiData.hasNext,
          hasNext: apiData.hasNext || false,
          hasPrevious: apiData.hasPrevious || false
        };
      } else {
        membersResponse = response as GroupMembersResponse;
      }
      
      debugLogger.logApiResponse('GET', endpoint, membersResponse);
      debugLogger.log('GroupService', '👥 Members loaded', {
        groupId,
        membersCount: membersResponse.content?.length || 0,
        totalElements: membersResponse.totalElements
      });
      return membersResponse;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(groupId: number, targetUserId: number, role: 'moderator' | 'member'): Promise<void> {
    const endpoint = `${this.baseUrl}/${groupId}/members/${targetUserId}/role`;
    debugLogger.logApiCall('PUT', endpoint, { role });
    try {
      await apiClient.put(endpoint, null, {
        params: { role }
      });
      debugLogger.logApiResponse('PUT', endpoint, 'success');
      debugLogger.log('GroupService', '🔄 Member role updated', { groupId, targetUserId, role });
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId: number, targetUserId: number): Promise<void> {
    const endpoint = `${this.baseUrl}/${groupId}/members/${targetUserId}`;
    debugLogger.logApiCall('DELETE', endpoint);
    try {
      await apiClient.delete(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, 'success');
      debugLogger.log('GroupService', '🚫 Member removed', { groupId, targetUserId });
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      throw error;
    }
  }

  // ================== JOIN QUESTIONS & REQUESTS ==================

  /**
   * Get join questions for a group
   */
  async getJoinQuestions(groupId: number): Promise<JoinQuestion[]> {
    const endpoint = `${this.baseUrl}/${groupId}/questions`;
    debugLogger.logApiCall('GET', endpoint);
    try {
      const response = await apiClient.get<ApiResponse<JoinQuestion[]>>(endpoint);
      const questions = response.data;
      debugLogger.logApiResponse('GET', endpoint, questions);
      debugLogger.log('GroupService', '❓ Join questions loaded', {
        groupId,
        questionsCount: questions?.length || 0
      });
      return questions;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Update join questions for a group
   */
  async updateJoinQuestions(groupId: number, questions: JoinQuestion[]): Promise<JoinQuestion[]> {
    const endpoint = `${this.baseUrl}/${groupId}/questions`;
    debugLogger.logApiCall('PUT', endpoint, questions);
    try {
      const response = await apiClient.put<JoinQuestion[]>(endpoint, questions);
      debugLogger.logApiResponse('PUT', endpoint, response);
      debugLogger.log('GroupService', '📝 Join questions updated', {
        groupId,
        questionsCount: questions.length
      });
      return response;
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Submit join request with answers
   */
  async submitJoinRequest(groupId: number, answers: SubmitJoinRequestData): Promise<JoinRequest> {
    const endpoint = `${this.baseUrl}/${groupId}/join-requests`;
    debugLogger.logApiCall('POST', endpoint, answers.answers);
    try {
      // Send array of answers directly: [{ questionId, answer }, ...]
      const response = await apiClient.post<ApiResponse<JoinRequest>>(endpoint, answers.answers);
      const joinRequest = response.data;
      debugLogger.logApiResponse('POST', endpoint, joinRequest);
      debugLogger.log('GroupService', '📤 Join request submitted', {
        groupId,
        answersCount: answers.answers.length,
        requestId: joinRequest.id,
        status: joinRequest.status
      });
      return joinRequest;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Get pending join requests for a group
   */
  async getPendingJoinRequests(groupId: number, page = 0, size = 10): Promise<JoinRequestsResponse> {
    const endpoint = `${this.baseUrl}/${groupId}/join-requests/pending`;
    debugLogger.logApiCall('GET', endpoint, { page, size });
    try {
      const response = await apiClient.get<{
        result: string;
        message: string;
        data: {
          requests: JoinRequest[];
          currentPage: number;
          pageSize: number;
          totalElements: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        }
      }>(endpoint, {
        params: { page, size }
      });

      const transformedResponse: JoinRequestsResponse = {
        content: response.data.requests,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        size: response.data.pageSize,
        number: response.data.currentPage,
        first: !response.data.hasPrevious,
        last: !response.data.hasNext,
        hasNext: response.data.hasNext,
        hasPrevious: response.data.hasPrevious
      };

      debugLogger.logApiResponse('GET', endpoint, transformedResponse);
      debugLogger.log('GroupService', '⏳ Pending join requests loaded', {
        groupId,
        requestsCount: transformedResponse.content?.length || 0,
        totalElements: transformedResponse.totalElements
      });
      return transformedResponse;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Review join request (approve or reject)
   */
  async reviewJoinRequest(requestId: number, reviewData: ReviewJoinRequestData): Promise<void> {
    const endpoint = `${this.joinRequestsUrl}/${requestId}/review`;
    debugLogger.logApiCall('POST', endpoint, reviewData);
    try {
      await apiClient.post(endpoint, reviewData);
      debugLogger.logApiResponse('POST', endpoint, 'success');
      debugLogger.log('GroupService', '✅ Join request reviewed', {
        requestId,
        approved: reviewData.approved,
        hasMessage: !!reviewData.message
      });
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Get current user's join request for a group
   */
  async getMyJoinRequest(groupId: number): Promise<JoinRequest | null> {
    const endpoint = `${this.baseUrl}/${groupId}/join-requests/my-request`;
    debugLogger.logApiCall('GET', endpoint);
    try {
      const response = await apiClient.get<JoinRequest>(endpoint);
      debugLogger.logApiResponse('GET', endpoint, response);
      debugLogger.log('GroupService', '📋 My join request loaded', { groupId });
      return response;
    } catch (error) {
      // Return null if no request found (404)
      if ((error as any).response?.status === 404) {
        debugLogger.log('GroupService', 'ℹ️ No join request found', { groupId });
        return null;
      }
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Cancel join request
   */
  async cancelJoinRequest(requestId: number): Promise<void> {
    const endpoint = `${this.joinRequestsUrl}/${requestId}`;
    debugLogger.logApiCall('DELETE', endpoint);
    try {
      await apiClient.delete(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, 'success');
      debugLogger.log('GroupService', '❌ Join request cancelled', { requestId });
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      throw error;
    }
  }

  // ================== GROUP POSTS ==================

  /**
   * Create post in group
   */
  async createGroupPost(groupId: number, postData: CreateGroupPostRequest): Promise<GroupPost> {
    const endpoint = `${this.postsUrl}/groups/${groupId}`;
    debugLogger.logApiCall('POST', endpoint, postData);
    try {
      const response = await apiClient.post<GroupPost>(endpoint, postData);
      debugLogger.logApiResponse('POST', endpoint, response);
      debugLogger.log('GroupService', '📝 Group post created', {
        groupId,
        postId: response.id,
        contentLength: postData.content.length
      });
      return response;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      throw error;
    }
  }

  /**
   * Get posts from a group
   */
  async getGroupPosts(groupId: number, page = 0, size = 10): Promise<PostsResponse> {
    const endpoint = `${this.postsUrl}/groups/${groupId}`;
    debugLogger.logApiCall('GET', endpoint, { page, size });
    try {
      const response = await apiClient.get<PostsResponse>(endpoint, {
        params: { page, size }
      });
      debugLogger.logApiResponse('GET', endpoint, response);
      debugLogger.log('GroupService', '📄 Group posts loaded', {
        groupId,
        postsCount: response.content?.length || 0,
        totalElements: response.page.totalElements,
        totalPages: response.page.totalPages
      });
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  // ================== CONVENIENCE METHODS ==================

  /**
   * Check if current user can join a group
   */
  async canJoinGroup(group: Group): Promise<boolean> {
    if (!group) return false;
    
    // If user is already a member, they can't join again
    if (group.userMembershipStatus === 'joined') return false;
    
    // If private group, check if user has permission or needs to request
    if (group.privacy === 'private_') {
      return group.requiresApproval ? 'request' as any : false;
    }
    
    // Public groups can be joined directly or with approval
    return true;
  }

  /**
   * Get user's role in a group
   */
  async getUserRoleInGroup(groupId: number): Promise<'owner' | 'moderator' | 'member' | 'admin' | null> {
    try {
      const group = await this.getGroupById(groupId);
      return group.userRole || null;
    } catch (error) {
      debugLogger.log('GroupService', '❌ Failed to get user role', { groupId, error });
      return null;
    }
  }

  /**
   * Check if user has permission to manage group
   */
  async canManageGroup(groupId: number): Promise<boolean> {
    const role = await this.getUserRoleInGroup(groupId);
    return role === 'owner' || role === 'moderator' || role === 'admin';
  }

  /**
   * Check if user is group owner
   */
  async isGroupOwner(groupId: number): Promise<boolean> {
    const role = await this.getUserRoleInGroup(groupId);
    return role === 'owner';
  }

  /**
   * Fetch suggested groups
   */
  async getSuggestedGroups(page = 0, size = 10): Promise<GroupsResponse> {
    const endpoint = `${this.baseUrl}`;
    debugLogger.logApiCall('GET', endpoint, { page, size });
    try {
      const response = await apiClient.get<GroupsResponse>(endpoint, {
        params: { page, size }
      });
      debugLogger.logApiResponse('GET', endpoint, response);
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }
}

export const groupService = new GroupService();
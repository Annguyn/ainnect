import { useState, useEffect, useCallback } from 'react';
import { groupService } from '../services/groupService';
import { debugLogger } from '../utils/debugLogger';
import {
  Group,
  GroupMember,
  JoinQuestion,
  JoinRequest,
  CreateGroupRequest,
  UpdateGroupRequest,
  SubmitJoinRequestData,
  ReviewJoinRequestData,
  GroupState,
  JoinGroupResponse,
  LeaveGroupResponse,
  BlockUserFromGroupRequest,
  BlockUserFromGroupResponse,
  GroupsResponse
} from '../types';

interface UseGroupsResult {
  // State
  groups: Group[];
  currentGroup: Group | null;
  members: GroupMember[];
  joinRequests: JoinRequest[];
  joinQuestions: JoinQuestion[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    totalPages: number;
    currentPage: number;
    totalElements: number;
  };

  // Group management
  createGroup: (groupData: CreateGroupRequest | FormData) => Promise<Group>;
  updateGroup: (groupId: number, updateData: UpdateGroupRequest) => Promise<Group>;
  deleteGroup: (groupId: number) => Promise<void>;
  getGroup: (groupId: number) => Promise<Group>;
  loadGroups: (page?: number, size?: number) => Promise<void>;
  loadOwnerGroups: (ownerId: number, page?: number, size?: number) => Promise<void>;
  loadMemberGroups: (userId: number, page?: number, size?: number) => Promise<void>;

  // Member management
  joinGroup: (groupId: number, answers?: any[]) => Promise<JoinGroupResponse>;
  leaveGroup: (groupId: number) => Promise<LeaveGroupResponse>;
  loadMembers: (groupId: number, page?: number, size?: number) => Promise<void>;
  updateMemberRole: (groupId: number, userId: number, role: 'moderator' | 'member') => Promise<void>;
  removeMember: (groupId: number, userId: number) => Promise<void>;
  
  // User blocking
  blockUserFromGroup: (request: BlockUserFromGroupRequest) => Promise<BlockUserFromGroupResponse>;
  unblockUserFromGroup: (userId: number, groupId: number) => Promise<void>;
  getUserGroupHistory: (userId: number, page?: number, size?: number) => Promise<GroupsResponse>;

  // Join questions & requests
  loadJoinQuestions: (groupId: number) => Promise<void>;
  updateJoinQuestions: (groupId: number, questions: JoinQuestion[]) => Promise<void>;
  submitJoinRequest: (groupId: number, answers: SubmitJoinRequestData) => Promise<void>;
  loadPendingJoinRequests: (groupId: number, page?: number, size?: number) => Promise<void>;
  reviewJoinRequest: (requestId: number, reviewData: ReviewJoinRequestData) => Promise<void>;
  getMyJoinRequest: (groupId: number) => Promise<JoinRequest | null>;
  cancelJoinRequest: (requestId: number) => Promise<void>;

  // Utility functions
  clearError: () => void;
  setCurrentGroup: (group: Group | null) => void;
  canManageGroup: (groupId: number) => Promise<boolean>;
  isGroupOwner: (groupId: number) => Promise<boolean>;
}

export const useGroups = (): UseGroupsResult => {
  const [state, setState] = useState<GroupState>({
    groups: [],
    currentGroup: null,
    members: [],
    joinRequests: [],
    joinQuestions: [],
    isLoading: false,
    error: null,
    pagination: {
      totalPages: 0,
      currentPage: 0,
      totalElements: 0,
    },
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const setCurrentGroup = useCallback((group: Group | null) => {
    setState(prev => ({ ...prev, currentGroup: group }));
  }, []);

  // ================== GROUP MANAGEMENT ==================

  const createGroup = useCallback(async (groupData: CreateGroupRequest | FormData): Promise<Group> => {
    setLoading(true);
    setError(null);
    try {
      debugLogger.log('useGroups', 'Creating group', {
        isFormData: groupData instanceof FormData,
        data: groupData instanceof FormData ? '[FormData]' : groupData
      });
      const newGroup = await groupService.createGroup(groupData);
      setState(prev => ({
        ...prev,
        groups: [newGroup, ...prev.groups],
        currentGroup: newGroup,
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Group created successfully', { groupId: newGroup.id });
      return newGroup;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create group';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to create group', { error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  const updateGroup = useCallback(async (groupId: number, updateData: UpdateGroupRequest): Promise<Group> => {
    setLoading(true);
    setError(null);
    try {
      const updatedGroup = await groupService.updateGroup(groupId, updateData);
      setState(prev => ({
        ...prev,
        groups: prev.groups.map(g => g.id === groupId ? updatedGroup : g),
        currentGroup: prev.currentGroup?.id === groupId ? updatedGroup : prev.currentGroup,
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Group updated successfully', { groupId });
      return updatedGroup;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update group';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to update group', { groupId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  const deleteGroup = useCallback(async (groupId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await groupService.deleteGroup(groupId);
      setState(prev => ({
        ...prev,
        groups: prev.groups.filter(g => g.id !== groupId),
        currentGroup: prev.currentGroup?.id === groupId ? null : prev.currentGroup,
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Group deleted successfully', { groupId });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete group';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to delete group', { groupId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  const getGroup = useCallback(async (groupId: number): Promise<Group> => {
    setLoading(true);
    setError(null);
    try {
      const group = await groupService.getGroupById(groupId);
      setState(prev => ({
        ...prev,
        currentGroup: group,
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Group loaded successfully', { groupId });
      return group;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load group';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to load group', { groupId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  const loadGroups = useCallback(async (page = 0, size = 10): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await groupService.listGroups(page, size);
      setState(prev => ({
        ...prev,
        groups: page === 0 ? response.content : [...prev.groups, ...response.content],
        pagination: {
          totalPages: response.totalPages,
          currentPage: response.number,
          totalElements: response.totalElements,
        },
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Groups loaded successfully', { 
        page, 
        size, 
        count: response.content.length 
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load groups';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to load groups', { error: errorMessage });
    }
  }, [setLoading, setError]);

  const loadOwnerGroups = useCallback(async (ownerId: number, page = 0, size = 10): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await groupService.listOwnerGroups(ownerId, page, size);
      setState(prev => ({
        ...prev,
        groups: page === 0 ? response.content : [...prev.groups, ...response.content],
        pagination: {
          totalPages: response.totalPages,
          currentPage: response.number,
          totalElements: response.totalElements,
        },
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Owner groups loaded successfully', { 
        ownerId, 
        page, 
        size, 
        count: response.content.length 
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load owner groups';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to load owner groups', { ownerId, error: errorMessage });
    }
  }, [setLoading, setError]);

  const loadMemberGroups = useCallback(async (userId: number, page = 0, size = 10): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await groupService.listMemberGroups(userId, page, size);
      setState(prev => ({
        ...prev,
        groups: page === 0 ? response.content : [...prev.groups, ...response.content],
        pagination: {
          totalPages: response.totalPages,
          currentPage: response.number,
          totalElements: response.totalElements,
        },
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Member groups loaded successfully', { 
        userId, 
        page, 
        size, 
        count: response.content.length 
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load member groups';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to load member groups', { userId, error: errorMessage });
    }
  }, [setLoading, setError]);

  // ================== MEMBER MANAGEMENT ==================

  const joinGroup = useCallback(async (groupId: number, answers?: any[]): Promise<JoinGroupResponse> => {
    setLoading(true);
    setError(null);
    try {
      const joinResponse = await groupService.joinGroup(groupId, answers);
      
      // Update the group's membership status if it's the current group
      setState(prev => ({
        ...prev,
        currentGroup: prev.currentGroup?.id === groupId 
          ? { 
              ...prev.currentGroup, 
              userMembershipStatus: 'joined' as const,
              userRole: joinResponse.role,
              member: true
            }
          : prev.currentGroup,
        isLoading: false,
      }));
      
      debugLogger.log('useGroups', '✅ Joined group successfully', { 
        groupId,
        groupName: joinResponse.groupName,
        role: joinResponse.role,
        joinedAt: joinResponse.joinedAt,
        hasAnswers: !!answers?.length
      });
      
      return joinResponse;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to join group';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to join group', { groupId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  const leaveGroup = useCallback(async (groupId: number): Promise<LeaveGroupResponse> => {
    setLoading(true);
    setError(null);
    try {
      const leaveResponse = await groupService.leaveGroup(groupId);
      
      setState(prev => ({
        ...prev,
        currentGroup: prev.currentGroup?.id === groupId 
          ? { 
              ...prev.currentGroup, 
              userMembershipStatus: 'not_member' as const,
              userRole: null,
              member: false
            }
          : prev.currentGroup,
        isLoading: false,
      }));
      
      debugLogger.log('useGroups', '✅ Left group successfully', { 
        groupId,
        groupName: leaveResponse.groupName,
        leftAt: leaveResponse.leftAt
      });
      
      return leaveResponse;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to leave group';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to leave group', { groupId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  const loadMembers = useCallback(async (groupId: number, page = 0, size = 10): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await groupService.listMembers(groupId, page, size);
      setState(prev => ({
        ...prev,
        members: page === 0 ? response.content : [...prev.members, ...response.content],
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Members loaded successfully', { 
        groupId, 
        page, 
        size, 
        count: response.content.length 
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load members';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to load members', { groupId, error: errorMessage });
    }
  }, [setLoading, setError]);

  const updateMemberRole = useCallback(async (groupId: number, userId: number, role: 'moderator' | 'member'): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await groupService.updateMemberRole(groupId, userId, role);
      setState(prev => ({
        ...prev,
        members: prev.members.map(m => 
          m.groupId === groupId && m.userId === userId 
            ? { ...m, role }
            : m
        ),
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Member role updated successfully', { groupId, userId, role });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update member role';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to update member role', { groupId, userId, role, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  const removeMember = useCallback(async (groupId: number, userId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await groupService.removeMember(groupId, userId);
      setState(prev => ({
        ...prev,
        members: prev.members.filter(m => !(m.groupId === groupId && m.userId === userId)),
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Member removed successfully', { groupId, userId });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove member';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to remove member', { groupId, userId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  // ================== USER BLOCKING ==================

  const blockUserFromGroup = useCallback(async (request: BlockUserFromGroupRequest): Promise<BlockUserFromGroupResponse> => {
    setLoading(true);
    setError(null);
    try {
      const blockResponse = await groupService.blockUserFromGroup(request);
      
      debugLogger.log('useGroups', '✅ User blocked from group successfully', { 
        userId: request.userId,
        groupId: request.groupId,
        groupName: blockResponse.groupName,
        blockedAt: blockResponse.blockedAt
      });
      
      setLoading(false);
      return blockResponse;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to block user from group';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to block user from group', { 
        userId: request.userId, 
        groupId: request.groupId, 
        error: errorMessage 
      });
      throw error;
    }
  }, [setLoading, setError]);

  const unblockUserFromGroup = useCallback(async (userId: number, groupId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await groupService.unblockUserFromGroup(userId, groupId);
      
      debugLogger.log('useGroups', '✅ User unblocked from group successfully', { userId, groupId });
      setLoading(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to unblock user from group';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to unblock user from group', { userId, groupId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  const getUserGroupHistory = useCallback(async (userId: number, page = 0, size = 10): Promise<GroupsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const historyResponse = await groupService.getUserGroupHistory(userId, page, size);
      
      debugLogger.log('useGroups', '✅ User group history loaded successfully', { 
        userId,
        groupsCount: historyResponse.content?.length || 0,
        totalElements: historyResponse.totalElements
      });
      
      setLoading(false);
      return historyResponse;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load user group history';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to load user group history', { userId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  // ================== JOIN QUESTIONS & REQUESTS ==================

  const loadJoinQuestions = useCallback(async (groupId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const questions = await groupService.getJoinQuestions(groupId);
      setState(prev => ({
        ...prev,
        joinQuestions: questions,
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Join questions loaded successfully', { groupId, count: questions.length });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load join questions';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to load join questions', { groupId, error: errorMessage });
    }
  }, [setLoading, setError]);

  const updateJoinQuestions = useCallback(async (groupId: number, questions: JoinQuestion[]): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const updatedQuestions = await groupService.updateJoinQuestions(groupId, questions);
      setState(prev => ({
        ...prev,
        joinQuestions: updatedQuestions,
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Join questions updated successfully', { groupId, count: questions.length });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update join questions';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to update join questions', { groupId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  const submitJoinRequest = useCallback(async (groupId: number, answers: SubmitJoinRequestData): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await groupService.submitJoinRequest(groupId, answers);
      setState(prev => ({
        ...prev,
        currentGroup: prev.currentGroup?.id === groupId 
          ? { ...prev.currentGroup, userMembershipStatus: 'pending' as const }
          : prev.currentGroup,
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Join request submitted successfully', { groupId });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit join request';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to submit join request', { groupId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  const loadPendingJoinRequests = useCallback(async (groupId: number, page = 0, size = 10): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await groupService.getPendingJoinRequests(groupId, page, size);
      setState(prev => ({
        ...prev,
        joinRequests: page === 0 ? response.content : [...prev.joinRequests, ...response.content],
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Pending join requests loaded successfully', { 
        groupId, 
        page, 
        size, 
        count: response.content.length 
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load join requests';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to load join requests', { groupId, error: errorMessage });
    }
  }, [setLoading, setError]);

  const reviewJoinRequest = useCallback(async (requestId: number, reviewData: ReviewJoinRequestData): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await groupService.reviewJoinRequest(requestId, reviewData);
      setState(prev => ({
        ...prev,
        joinRequests: prev.joinRequests.filter(r => r.id !== requestId),
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Join request reviewed successfully', { requestId, approved: reviewData.approved });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to review join request';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to review join request', { requestId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  const getMyJoinRequest = useCallback(async (groupId: number): Promise<JoinRequest | null> => {
    try {
      const request = await groupService.getMyJoinRequest(groupId);
      debugLogger.log('useGroups', '✅ My join request loaded', { groupId, hasRequest: !!request });
      return request;
    } catch (error: any) {
      debugLogger.log('useGroups', '❌ Failed to get my join request', { groupId, error: error.message });
      return null;
    }
  }, []);

  const cancelJoinRequest = useCallback(async (requestId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await groupService.cancelJoinRequest(requestId);
      setState(prev => ({
        ...prev,
        joinRequests: prev.joinRequests.filter(r => r.id !== requestId),
        isLoading: false,
      }));
      debugLogger.log('useGroups', '✅ Join request cancelled successfully', { requestId });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to cancel join request';
      setError(errorMessage);
      setLoading(false);
      debugLogger.log('useGroups', '❌ Failed to cancel join request', { requestId, error: errorMessage });
      throw error;
    }
  }, [setLoading, setError]);

  // ================== UTILITY FUNCTIONS ==================

  const canManageGroup = useCallback(async (groupId: number): Promise<boolean> => {
    try {
      return await groupService.canManageGroup(groupId);
    } catch (error) {
      debugLogger.log('useGroups', '❌ Failed to check manage permissions', { groupId });
      return false;
    }
  }, []);

  const isGroupOwner = useCallback(async (groupId: number): Promise<boolean> => {
    try {
      return await groupService.isGroupOwner(groupId);
    } catch (error) {
      debugLogger.log('useGroups', '❌ Failed to check owner status', { groupId });
      return false;
    }
  }, []);

  return {
    // State
    groups: state.groups,
    currentGroup: state.currentGroup,
    members: state.members,
    joinRequests: state.joinRequests,
    joinQuestions: state.joinQuestions,
    isLoading: state.isLoading,
    error: state.error,
    pagination: state.pagination,

    // Group management
    createGroup,
    updateGroup,
    deleteGroup,
    getGroup,
    loadGroups,
    loadOwnerGroups,
    loadMemberGroups,

    // Member management
    joinGroup,
    leaveGroup,
    loadMembers,
    updateMemberRole,
    removeMember,

    // User blocking
    blockUserFromGroup,
    unblockUserFromGroup,
    getUserGroupHistory,

    // Join questions & requests
    loadJoinQuestions,
    updateJoinQuestions,
    submitJoinRequest,
    loadPendingJoinRequests,
    reviewJoinRequest,
    getMyJoinRequest,
    cancelJoinRequest,

    // Utility functions
    clearError,
    setCurrentGroup,
    canManageGroup,
    isGroupOwner,
  };
};
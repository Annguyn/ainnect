import { apiClient } from './apiClient';
import { debugLogger } from '../utils/debugLogger';

export interface FriendRequest {
  id: number;
  senderId: number;
  senderUsername: string;
  senderAvatarUrl?: string;
  receiverId: number;
  receiverUsername?: string;
  receiverAvatarUrl?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  mutualFriendsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FriendRequestResponse {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data?: any;
}

export const fetchFriendRequests = async (): Promise<FriendRequest[]> => {
  const endpoint = '/api/friend-requests';
  debugLogger.logApiCall('GET', endpoint);
  
  try {
    const response = await apiClient.get<FriendRequestResponse>(endpoint);
    debugLogger.logApiResponse('GET', endpoint, response);
    
    if (response.result === 'ERROR') {
      throw new Error(response.message);
    }
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.content)) {
      return response.data.content;
    } else if (response.data && Array.isArray(response.data.requests)) {
      return response.data.requests;
    }
    
    return [];
  } catch (error) {
    debugLogger.logApiResponse('GET', endpoint, null, error);
    console.error('Error fetching friend requests:', error);
    throw error;
  }
};

/**
 * Accept a friend request
 */
export const acceptFriendRequest = async (requestId: number): Promise<void> => {
  const endpoint = `/api/friend-requests/${requestId}/accept`;
  debugLogger.logApiCall('PUT', endpoint, { requestId });
  
  try {
    const response = await apiClient.put<FriendRequestResponse>(endpoint);
    debugLogger.logApiResponse('PUT', endpoint, response);
    
    if (response.result === 'ERROR') {
      throw new Error(response.message);
    }
    
    debugLogger.log('FriendRequestService', '✅ Friend request accepted', { requestId });
  } catch (error) {
    debugLogger.logApiResponse('PUT', endpoint, null, error);
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

/**
 * Reject a friend request
 */
export const rejectFriendRequest = async (requestId: number): Promise<void> => {
  const endpoint = `/api/friend-requests/${requestId}/reject`;
  debugLogger.logApiCall('PUT', endpoint, { requestId });
  
  try {
    const response = await apiClient.put<FriendRequestResponse>(endpoint);
    debugLogger.logApiResponse('PUT', endpoint, response);
    
    if (response.result === 'ERROR') {
      throw new Error(response.message);
    }
    
    debugLogger.log('FriendRequestService', '❌ Friend request rejected', { requestId });
  } catch (error) {
    debugLogger.logApiResponse('PUT', endpoint, null, error);
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

/**
 * Send a friend request to a user
 */
export const sendFriendRequest = async (userId: number): Promise<void> => {
  const endpoint = '/api/friend-requests';
  debugLogger.logApiCall('POST', endpoint, { userId });
  
  try {
    const response = await apiClient.post<FriendRequestResponse>(endpoint, { receiverId: userId });
    debugLogger.logApiResponse('POST', endpoint, response);
    
    if (response.result === 'ERROR') {
      throw new Error(response.message);
    }
    
    debugLogger.log('FriendRequestService', '📤 Friend request sent', { userId });
  } catch (error) {
    debugLogger.logApiResponse('POST', endpoint, null, error);
    console.error('Error sending friend request:', error);
    throw error;
  }
};

/**
 * Cancel a sent friend request
 */
export const cancelFriendRequest = async (requestId: number): Promise<void> => {
  const endpoint = `/api/friend-requests/${requestId}`;
  debugLogger.logApiCall('DELETE', endpoint, { requestId });
  
  try {
    const response = await apiClient.delete<FriendRequestResponse>(endpoint);
    debugLogger.logApiResponse('DELETE', endpoint, response);
    
    if (response.result === 'ERROR') {
      throw new Error(response.message);
    }
    
    debugLogger.log('FriendRequestService', '🚫 Friend request cancelled', { requestId });
  } catch (error) {
    debugLogger.logApiResponse('DELETE', endpoint, null, error);
    console.error('Error cancelling friend request:', error);
    throw error;
  }
};
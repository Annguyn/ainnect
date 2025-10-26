import axios from 'axios';

interface FriendRequest {
  id: number;
  name: string;
  mutualFriends: number;
}

export const fetchFriendRequests = async (): Promise<FriendRequest[]> => {
  try {
    const response = await axios.get('/api/friend-requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    throw error;
  }
};
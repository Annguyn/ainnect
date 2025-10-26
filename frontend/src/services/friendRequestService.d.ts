export interface FriendRequest {
  id: number;
  name: string;
  mutualFriends: number;
}

export declare const fetchFriendRequests: () => Promise<FriendRequest[]>;
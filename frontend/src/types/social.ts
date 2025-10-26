export type RelationshipStatus =
  | "friends"
  | "following"
  | "followers"
  | "mutual_follow"
  | "pending_request"
  | "request_sent"
  | "blocked"
  | "none";

export type RelationshipAction =
  | "remove_friend"
  | "unfollow"
  | "follow"
  | "accept_friend_request"
  | "cancel_friend_request"
  | "unblock"
  | "send_friend_request";

export interface UserRelationship {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isMutualFollow: boolean;
  isFriend: boolean;
  canSendFriendRequest: boolean;
  friendshipStatus: string | null;
  isBlocked: boolean;
  isBlockedBy: boolean;
  relationshipStatus: RelationshipStatus;
  actionAvailable: RelationshipAction;
}

export interface SocialUser {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  mutualFriends?: number;
  relationship?: UserRelationship;
  createdAt?: string;
}

export interface FollowRequest {
  id: number
  followerId: number
  followingId: number
  follower: SocialUser
  following: SocialUser
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  updatedAt: string
}

export interface FriendRequest {
  id: number
  requesterId: number
  receiverId: number
  requester: SocialUser
  receiver: SocialUser
  status: 'pending' | 'accepted' | 'declined'
  message?: string
  createdAt: string
  updatedAt: string
}

export interface SocialNotification {
  id: number
  userId: number
  type: 'follow' | 'unfollow' | 'friend_request' | 'friend_accepted' | 'like' | 'comment' | 'share' | 'mention'
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
  actor?: SocialUser
  target?: {
    type: 'post' | 'comment' | 'user'
    id: number
    title?: string
  }
}

export interface SocialStats {
  followers: number
  following: number
  posts: number
  likes: number
  comments: number
  shares: number
}

export interface SocialActivity {
  id: number
  userId: number
  user: SocialUser
  type: 'post' | 'like' | 'comment' | 'share' | 'follow' | 'friend_request'
  targetId?: number
  targetType?: 'post' | 'user' | 'comment'
  target?: any
  content?: string
  createdAt: string
}

export interface SocialFeed {
  activities: SocialActivity[]
  hasMore: boolean
  nextPage?: number
}

export interface BlockRequest {
  userId: number
  blockedUserId: number
  reason?: string
}

export interface ReportRequest {
  userId: number
  reportedUserId?: number
  reportedPostId?: number
  reportedCommentId?: number
  reason: string
  description?: string
}

export interface SocialSettings {
  userId: number
  allowFriendRequests: boolean
  allowFollowRequests: boolean
  allowMessages: 'everyone' | 'friends' | 'none'
  showOnlineStatus: boolean
  showLastSeen: boolean
  allowTagging: boolean
  allowMentions: boolean
  privacyLevel: 'public' | 'friends' | 'private'
}

export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface BlockedUser {
  id: number;
  blockerId: number;
  blockerUsername: string;
  blockerDisplayName: string;
  blockerAvatarUrl?: string;
  blockedId: number;
  blockedUsername: string;
  blockedDisplayName: string;
  blockedAvatarUrl?: string;
  reason?: string;
  createdAt: string;
}

export interface BlockedUsersResponse {
  blocks: BlockedUser[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SocialFilters {
  page?: number;
  size?: number;
  type?: string;
  status?: string;
}

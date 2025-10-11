export interface UserProfile {
  id: number
  username: string
  displayName: string
  email: string
  avatarUrl?: string
  bio?: string
  location?: string
  website?: string
  isPrivate: boolean
  isVerified: boolean
  isOnline: boolean
  lastSeen?: string
  createdAt: string
  updatedAt: string
}

export interface SocialStats {
  followers: number
  following: number
  friends: number
  posts: number
  likes: number
  comments: number
  shares: number
}

export interface ProfileUpdateRequest {
  displayName?: string
  bio?: string
  location?: string
  website?: string
  isPrivate?: boolean
}

export interface ConnectionUser {
  id: number
  username: string
  displayName: string
  avatarUrl?: string
  bio?: string
  isVerified: boolean
  isOnline: boolean
  lastSeen?: string
  mutualFriends?: number
  connectionDate: string
}

export interface UserPost {
  id: number
  content: string
  images?: string[]
  media?: Array<{
    id: number
    mediaUrl: string
    mediaType: 'image' | 'video' | 'audio'
    thumbnailUrl?: string
  }>
  authorId: number
  author: {
    id: number
    username: string
    displayName: string
    avatarUrl?: string
  }
  createdAt: string
  updatedAt: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isShared: boolean
  userReaction?: string
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

export interface ProfileFilters {
  page?: number
  size?: number
  sortBy?: 'newest' | 'oldest' | 'popular'
}

export interface ProfileSettings {
  userId: number
  isPrivate: boolean
  allowFriendRequests: boolean
  allowFollowRequests: boolean
  allowMessages: 'everyone' | 'friends' | 'none'
  showOnlineStatus: boolean
  showLastSeen: boolean
  allowTagging: boolean
  allowMentions: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

export interface ProfileActivity {
  id: number
  type: 'post' | 'like' | 'comment' | 'share' | 'follow' | 'friend_request'
  description: string
  targetId?: number
  targetType?: 'post' | 'user' | 'comment'
  createdAt: string
  metadata?: any
}

export interface ProfileInsights {
  totalViews: number
  profileViews: number
  postViews: number
  engagementRate: number
  topPosts: UserPost[]
  recentActivity: ProfileActivity[]
  growthStats: {
    followersGrowth: number
    followingGrowth: number
    postsGrowth: number
    period: 'week' | 'month' | 'year'
  }
}

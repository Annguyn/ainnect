// API Response Types based on Ainnect Backend
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  gender?: string | null;
  birthday?: string | null;
  location?: string | null;
  isActive: boolean;
  
  // Legacy compatibility fields
  firstName?: string;
  lastName?: string;
  avatar?: string;
  position?: string;
  company?: string;
  website?: string;
  phoneNumber?: string;
  interests?: string[];
  skills?: Skill[];
  socialLinks?: SocialLink[];
  isVerified?: boolean;
  profileViews?: number;
  connectionCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  coverImage?: string;
}

// Auth Response Types
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userInfo: User;
}

// API Error Response
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: Record<string, string> | null;
}

// Request Types
export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  usernameOrEmail: string;  // Updated to match backend validation
  password: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  gender?: string;
  birthday?: string;
  location?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// New skill interface with proficiency levels
export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'other';
  proficiency: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  endorsements?: number;
  verified?: boolean;
}

// Social media links
export interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'other';
  url: string;
  username?: string;
  isPublic: boolean;
}

// Achievement system
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'career' | 'skill' | 'community' | 'milestone';
}

// Professional experience
export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  location?: string;
  isCurrentPosition: boolean;
}

// Education background
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  description?: string;
}

// Language proficiency
export interface Language {
  language: string;
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
}

// Form Data Types
export interface LoginFormData {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
  // Legacy compatibility
  email?: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  agreeToTerms: boolean;
  // Legacy compatibility
  firstName?: string;
  lastName?: string;
}

export interface ProfileFormData {
  displayName: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  gender: 'male' | 'female' | 'other' | '';
  birthday: string;
  location: string;
}

export interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Application State Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'checkbox' | 'select' | 'date' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
}

// API Response Wrapper
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

// Loading and Error States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Legacy compatibility types
export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'other';
  proficiency: 1 | 2 | 3 | 4 | 5;
  endorsements?: number;
  verified?: boolean;
}

export interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'other';
  url: string;
  username?: string;
  isPublic: boolean;
}

export interface ProfileUpdateData {
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string | null;
  gender?: string;
  birthday?: string;
  location?: string;
  // Legacy compatibility
  firstName?: string;
  lastName?: string;
  position?: string;
  company?: string;
  website?: string;
  phoneNumber?: string;
  interests?: string[];
}

// Post and Comment Types
export interface PostAuthor {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface PostReactions {
  like: number;
  love: number;
  wow: number;
  total: number;
}

export interface PostData {
  id: number;
  authorId: number;
  groupId?: number | null;
  content: string;
  visibility: 'public_' | 'friends' | 'private';
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  reactionsCount?: PostReactions;
  commentsCount: number;
  sharesCount: number;
  userReaction?: string | null;
  images?: string[];
}

export interface CommentData {
  id: number;
  postId: number;
  authorId: number;
  parentId?: number | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  reactionsCount: PostReactions;
  repliesCount: number;
  userReaction?: string | null;
  replies?: CommentData[];
}

// Profile Management Types (matching backend DTOs)
export interface ProfileEducation {
  id: number;
  schoolName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileWorkExperience {
  id: number;
  companyName: string;
  position: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileInterest {
  id: number;
  name: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileLocation {
  id: number;
  locationName: string;
  locationType: 'current' | 'hometown' | 'work' | 'education' | 'other';
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteProfileResponse {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data: {
    userId: number;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    bio?: string | null;
    educations: ProfileEducation[];
    workExperiences: ProfileWorkExperience[];
    interests: ProfileInterest[];
    locations: ProfileLocation[];
  };
}

export interface SuggestionData {
  id: number;
  name: string;
  category?: string;
  description?: string | null;
  imageUrl?: string | null;
  usageCount?: number;
  type: 'school' | 'company' | 'interest' | 'location';
}

export interface SuggestionCategoryData {
  id: number;
  name: string;
  description?: string | null;
  type: 'school' | 'company' | 'interest' | 'location';
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Social Features Types
export interface SocialUser {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface FollowRelationship {
  id: number;
  follower: SocialUser;
  followee: SocialUser;
  createdAt: string;
}

export interface Friendship {
  id: number;
  requester: SocialUser;
  addressee: SocialUser;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface BlockRelationship {
  id: number;
  blocker: SocialUser;
  blocked: SocialUser;
  reason?: string;
  createdAt: string;
}

export interface Share {
  id: number;
  user: SocialUser;
  post: {
    id: number;
    content: string;
    author: SocialUser;
    createdAt: string;
  };
  comment?: string;
  createdAt: string;
}

export interface SocialStats {
  userId: number;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  postsCount: number;
  sharesCount: number;
  isFollowing?: boolean;
  isFriend?: boolean;
  isBlocked?: boolean;
}

export interface PaginatedSocialResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Social Request Types
export interface FollowRequest {
  followeeId: number;
}

export interface FriendRequest {
  friendId: number;
}

export interface AcceptFriendRequest {
  friendshipId: number;
  action: 'accepted' | 'blocked';
}

export interface BlockRequest {
  blockedUserId: number;
  reason?: string;
}

export interface ShareRequest {
  postId: number;
  comment?: string;
}

// Media type definition
export interface Media {
  id: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
}

// Post and Comment Types
export interface PostAuthor {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface PostReactions {
  like: number;
  love: number;
  wow: number;
  total: number;
}

export interface Post {
  id: number;
  content: string;
  authorId: number;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl: string;
  visibility: string;
  commentCount: number;
  reactionCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  media: Media[];
}

// Group Types based on Postman Collection
export interface Group {
  id: number;
  name: string;
  description?: string | null;
  privacy: 'public_' | 'private_';
  avatarUrl?: string | null;
  coverUrl?: string | null;
  requiresApproval: boolean;
  ownerId: number;
  ownerUsername?: string;
  ownerDisplayName?: string;
  memberCount: number;
  hasPendingRequest?: boolean;
  userRole?: 'owner' | 'moderator' | 'member' | 'admin' | null;
  userMembershipStatus?: 'joined' | 'pending' | 'not_member';
  member?: boolean;
  isOwner?: boolean;
  moderator?: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export interface GroupMember {
  id?: number;
  groupId?: number;
  userId: number;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  role: 'owner' | 'moderator' | 'member' | 'admin';
  joinedAt: string;
  owner?: boolean;
  user?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    bio?: string | null;
  };
}

export interface JoinQuestion {
  id?: number;
  question: string;
  isRequired: boolean;
  displayOrder: number;
}

export interface JoinAnswer {
  questionId: number;
  answer: string;
}

export interface JoinRequest {
  id: number;
  groupId: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    bio?: string | null;
  };
  answers: Array<{
    questionId: number;
    question: string;
    answer: string;
  }>;
}

// Group Request Types
export interface CreateGroupData {
  name: string;
  description?: string;
  privacy: 'public_' | 'private_';
  avatarUrl?: string | null;
  coverUrl?: string | null;
  coverImage?: File | null;
  requiresApproval: boolean;
  joinQuestions?: JoinQuestion[];
}

export type CreateGroupRequest = CreateGroupData | FormData;

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  privacy?: 'public_' | 'private_';
  avatarUrl?: string | null;
  coverUrl?: string | null;
  requiresApproval?: boolean;
}

export interface UpdateMemberRoleRequest {
  role: 'moderator' | 'member';
}

export interface SubmitJoinRequestData {
  answers: JoinAnswer[];
}

export interface ReviewJoinRequestData {
  approved: boolean;
  message?: string;
}

// Group Response Types
export interface GroupsResponse {
  content: Group[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface GroupMembersResponse {
  content: GroupMember[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface JoinRequestsResponse {
  content: JoinRequest[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Group Post Types
export interface GroupPost extends Post {
  groupId: number;
  group?: {
    id: number;
    name: string;
    privacy: 'public_' | 'private_';
    avatarUrl?: string | null;
  };
}

export interface CreateGroupPostRequest {
  content: string;
  mediaUrls?: string[];
}

export interface JoinGroupResponse {
  groupId: number;
  groupName: string;
  role: 'owner' | 'moderator' | 'member' | 'admin';
  joinedAt: string;
  message: string;
}

export interface LeaveGroupResponse {
  groupId: number;
  groupName: string;
  leftAt: string;
  message: string;
}

export interface BlockUserFromGroupRequest {
  userId: number;
  groupId: number;
  reason?: string;
}

export interface BlockUserFromGroupResponse {
  userId: number;
  groupId: number;
  groupName: string;
  blockedAt: string;
  reason?: string;
  message: string;
}

// Group State Types
export interface GroupState {
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
}

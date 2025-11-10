// Enums matching backend
export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  EMOJI = 'emoji',
  VIDEO = 'video'
}

export enum ConversationMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  displayName?: string
  avatarUrl?: string
  avatar?: string
  isOnline?: boolean
  lastSeen?: string
}

export interface Conversation {
  id: number
  type: ConversationType
  title?: string
  createdById: number
  createdByUsername: string
  createdByDisplayName: string
  createdByAvatarUrl?: string
  memberCount: number
  unreadCount: number
  lastMessage?: Message
  createdAt: string
  updatedAt: string
  isMember: boolean
  userRole?: ConversationMemberRole
  isActive?: boolean
  participants?: User[]
  avatar?: string
  // For direct conversations - information about the other participant
  otherParticipantId?: number
  otherParticipantUsername?: string
  otherParticipantDisplayName?: string
  otherParticipantAvatarUrl?: string
  otherParticipantIsOnline?: boolean
  otherParticipantLastSeenAt?: string
  // For group conversations - list of all members
  members?: ConversationMember[]
}

export interface Message {
  id: number
  conversationId: number
  senderId: number
  senderUsername: string
  senderDisplayName: string
  senderAvatarUrl?: string
  content: string
  messageType: MessageType
  attachments: MessageAttachment[]
  reactionCounts?: {
    like: number
    love: number
    wow: number
    sad: number
    angry: number
    haha: number
  }
  currentUserReaction?: 'like' | 'love' | 'wow' | 'sad' | 'angry' | 'haha' | null
  isRead: boolean
  isEdited: boolean
  editedAt?: string
  createdAt: string
  deletedAt?: string
  isDeleted?: boolean
  sender?: User
  readBy?: Array<{ userId: number; readAt: string }>
  attachmentUrls?: string[]
  reactions?: Array<{ emoji: string; count: number; users: number[] }>
  replyTo?: ParentMessageInfo
}

export interface ParentMessageInfo {
  id: number
  senderId: number
  senderUsername: string
  contentPreview: string
  messageType: MessageType
  createdAt: string
}

export interface MessageAttachment {
  id: number
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: string
}

export interface ConversationMember {
  userId: number
  username: string
  displayName: string
  avatarUrl?: string
  role: ConversationMemberRole
  joinedAt: string
  lastReadMessageId?: number
  isOnline: boolean
  lastSeenAt?: string
}

export interface CreateConversationRequest {
  type: ConversationType
  title?: string
  participantIds: number[]
}

export interface SendMessageRequest {
  conversationId: number
  content: string
  messageType: MessageType
  attachmentUrls: string[]
  replyToMessageId?: number
}

export interface AddMemberRequest {
  conversationId: number
  userIds: number[]
}

export interface RemoveMemberRequest {
  conversationId: number
  userId: number
}

export interface UpdateMemberRoleRequest {
  conversationId: number
  userId: number
  role: ConversationMemberRole
}

export interface MarkAsReadRequest {
  conversationId: number
  messageId?: number
  userId: number
}

export interface TypingRequest {
  conversationId: number
  userId: number
  username: string
  isTyping: boolean
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'TYPING' | 'ERROR' | 'MESSAGE_READ' | 'MESSAGE_UPDATED' | 'MESSAGE_DELETED' | 'MESSAGE_REACTION' | 'USER_JOINED' | 'USER_LEFT' | 'NOTIFICATION_NEW' | 'NEW_CONVERSATION' | 'MEMBER_ADDED';
  data: any;
  conversationId: number;
  senderId: number;
  timestamp: string;
}

export interface MessageReactionData {
  messageId: number;
  reactionCounts: {
    like: number;
    love: number;
    wow: number;
    sad: number;
    angry: number;
    haha: number;
  };
  userId: number;
  currentUserReaction: string | null;
}

export interface NotificationResponse {
  id: number
  type: string
  title: string
  content: string
  senderId: number
  senderUsername: string
  senderAvatarUrl?: string
  targetId: number
  targetType: string
  isRead: boolean
  createdAt: string
  readAt?: string
}

export interface ConversationListResponse {
  conversations: Conversation[]
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface MessageListResponse {
  messages: Message[]
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ConversationMemberListResponse {
  members: ConversationMember[]
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface NotificationListResponse {
  notifications: NotificationResponse[]
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  unreadCount: number
}

export interface ConversationFilters {
  type?: ConversationType
  page?: number
  size?: number
}

export interface MessageFilters {
  page?: number
  size?: number
}

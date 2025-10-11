export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  isOnline?: boolean
  lastSeen?: string
}

export interface Conversation {
  id: number
  type: 'direct' | 'group'
  title?: string
  avatar?: string
  lastMessage?: Message
  unreadCount: number
  participants: User[]
  createdAt: string
  updatedAt: string
  isActive?: boolean
}

export interface Message {
  id: number
  conversationId: number
  senderId: number
  sender: User
  content: string
  messageType: 'text' | 'image' | 'file' | 'system'
  attachmentUrls: string[]
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  readBy: ReadStatus[]
  reactions?: MessageReaction[]
}

export interface ReadStatus {
  userId: number
  user: User
  readAt: string
}

export interface MessageReaction {
  id: number
  userId: number
  user: User
  emoji: string
  createdAt: string
}

export interface CreateConversationRequest {
  type: 'direct' | 'group'
  title?: string
  participantIds: number[]
}

export interface SendMessageRequest {
  conversationId: number
  content: string
  messageType: 'text' | 'image' | 'file'
  attachmentUrls: string[]
}

export interface EditMessageRequest {
  content: string
}

export interface MarkAsReadRequest {
  conversationId: number
  messageId: number
}

export interface AddMembersRequest {
  userIds: number[]
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

export interface UnreadCountResponse {
  totalUnreadCount: number
  conversationUnreadCounts: {
    [conversationId: number]: number
  }
}

export interface ConversationFilters {
  type?: 'direct' | 'group'
  page?: number
  size?: number
}

export interface MessageFilters {
  page?: number
  size?: number
}

import { apiClient } from './apiClient'
import {
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
  MarkAsReadRequest,
  AddMemberRequest,
  ConversationListResponse,
  MessageListResponse,
  ConversationMemberListResponse,
  ConversationFilters,
  MessageFilters,
  ConversationMember,
  ConversationType
} from '../types/messaging'

export const messagingService = {
  // Conversation Management
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    const response = await apiClient.post<any>('/api/messaging/conversations', data)
    console.log('CreateConversation API Response:', response)

    const payload = (response as any)?.data ?? response
    // Transform API response to match Conversation interface
    const transformedConversation = {
      id: payload.id,
      type: payload.type,
      title: payload.title || '',
      createdById: payload.createdById || payload.createdBy?.id || 0,
      createdByUsername: payload.createdByUsername || payload.createdBy?.username || '',
      createdByDisplayName: payload.createdByDisplayName || payload.createdBy?.displayName || '',
      createdByAvatarUrl: payload.createdByAvatarUrl || payload.createdBy?.avatarUrl || null,
      memberCount: payload.memberCount || 0,
      unreadCount: payload.unreadCount || 0,
      lastMessage: payload.lastMessage || null,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
      isMember: payload.isMember || payload.member || true,
      userRole: payload.userRole || null,
      isActive: payload.isActive || true,
      participants: payload.participants || [],
      avatar: payload.avatar || null,
      // For direct conversations
      otherParticipantId: payload.otherParticipantId,
      otherParticipantUsername: payload.otherParticipantUsername,
      otherParticipantDisplayName: payload.otherParticipantDisplayName,
      otherParticipantAvatarUrl: payload.otherParticipantAvatarUrl,
      otherParticipantIsOnline: payload.otherParticipantIsOnline,
      otherParticipantLastSeenAt: payload.otherParticipantLastSeenAt,
      // For group conversations
      members: payload.members || []
    } as Conversation

    console.log('Transformed Conversation:', transformedConversation)
    return transformedConversation
  },

  async getConversationById(id: number): Promise<Conversation> {
    const response = await apiClient.get<any>(`/api/messaging/conversations/${id}`)
    const payload = (response as any)?.data ?? response
    // Transform API response to match Conversation interface
    return {
      id: payload.id,
      type: payload.type,
      title: payload.title || '',
      createdById: payload.createdById || payload.createdBy?.id || 0,
      createdByUsername: payload.createdByUsername || payload.createdBy?.username || '',
      createdByDisplayName: payload.createdByDisplayName || payload.createdBy?.displayName || '',
      createdByAvatarUrl: payload.createdByAvatarUrl || payload.createdBy?.avatarUrl || null,
      memberCount: payload.memberCount || 0,
      unreadCount: payload.unreadCount || 0,
      lastMessage: payload.lastMessage || null,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
      isMember: payload.isMember || payload.member || true,
      userRole: payload.userRole || null,
      isActive: payload.isActive || true,
      participants: payload.participants || [],
      avatar: payload.avatar || null,
      // For direct conversations
      otherParticipantId: payload.otherParticipantId,
      otherParticipantUsername: payload.otherParticipantUsername,
      otherParticipantDisplayName: payload.otherParticipantDisplayName,
      otherParticipantAvatarUrl: payload.otherParticipantAvatarUrl,
      otherParticipantIsOnline: payload.otherParticipantIsOnline,
      otherParticipantLastSeenAt: payload.otherParticipantLastSeenAt,
      // For group conversations
      members: payload.members || []
    } as Conversation
  },

  async getUserConversations(filters: ConversationFilters = {}): Promise<ConversationListResponse> {
    const params = new URLSearchParams()
    if (filters.type) params.append('type', filters.type)
    if (filters.page !== undefined) params.append('page', filters.page.toString())
    if (filters.size !== undefined) params.append('size', filters.size.toString())
    
    const response = await apiClient.get<any>(`/api/messaging/conversations?${params}`)
    const payload = (response as any)?.data ?? response
    // Transform conversations array
    const transformedConversations = (payload.conversations || []).map((conv: any) => ({
      id: conv.id,
      type: conv.type,
      title: conv.title || '',
      createdById: conv.createdById || conv.createdBy?.id || 0,
      createdByUsername: conv.createdByUsername || conv.createdBy?.username || '',
      createdByDisplayName: conv.createdByDisplayName || conv.createdBy?.displayName || '',
      createdByAvatarUrl: conv.createdByAvatarUrl || conv.createdBy?.avatarUrl || null,
      memberCount: conv.memberCount || 0,
      unreadCount: conv.unreadCount || 0,
      lastMessage: conv.lastMessage || null,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      isMember: conv.isMember || conv.member || true,
      userRole: conv.userRole || null,
      isActive: conv.isActive || true,
      participants: conv.participants || [],
      avatar: conv.avatar || null,
      // For direct conversations
      otherParticipantId: conv.otherParticipantId,
      otherParticipantUsername: conv.otherParticipantUsername,
      otherParticipantDisplayName: conv.otherParticipantDisplayName,
      otherParticipantAvatarUrl: conv.otherParticipantAvatarUrl,
      otherParticipantIsOnline: conv.otherParticipantIsOnline,
      otherParticipantLastSeenAt: conv.otherParticipantLastSeenAt,
      // For group conversations
      members: conv.members || []
    })) as Conversation[]

    return {
      conversations: transformedConversations,
      totalElements: payload.totalElements || 0,
      totalPages: payload.totalPages || 0,
      currentPage: payload.currentPage || 0,
      pageSize: payload.pageSize || 10,
      hasNext: payload.hasNext || false,
      hasPrevious: payload.hasPrevious || false
    } as ConversationListResponse
  },

  // Message Operations
  async getConversationMessages(
    conversationId: number, 
    filters: MessageFilters = {}
  ): Promise<MessageListResponse> {
    const params = new URLSearchParams()
    if (filters.page !== undefined) params.append('page', filters.page.toString())
    if (filters.size !== undefined) params.append('size', filters.size.toString())
    
    const response = await apiClient.get<any>(`/api/messaging/conversations/${conversationId}/messages?${params}`)
    const payload = (response as any)?.data ?? response
    return payload as MessageListResponse
  },

  // Member Management
  async addMembersToConversation(conversationId: number, data: AddMemberRequest): Promise<void> {
    await apiClient.post(`/api/messaging/conversations/${conversationId}/members`, data)
  },

  // Read Status
  async markAsRead(data: MarkAsReadRequest): Promise<void> {
    await apiClient.post(`/api/messaging/conversations/${data.conversationId}/read`, data)
  },

  // Additional methods for components
  async getDirectConversations(filters: ConversationFilters = {}): Promise<ConversationListResponse> {
    return this.getUserConversations({ ...filters, type: ConversationType.DIRECT })
  },

  async getGroupConversations(filters: ConversationFilters = {}): Promise<ConversationListResponse> {
    return this.getUserConversations({ ...filters, type: ConversationType.GROUP })
  },

  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const response = await apiClient.post<any>(`/api/messaging/conversations/${data.conversationId}/messages`, data)
    const payload = (response as any)?.data ?? response
    return payload as Message
  },

  async markMessageAsRead(data: MarkAsReadRequest): Promise<void> {
    return this.markAsRead(data)
  },

  async editMessage(messageId: number, data: { content: string }): Promise<Message> {
    const response = await apiClient.put<any>(`/api/messaging/messages/${messageId}`, data)
    const payload = (response as any)?.data ?? response
    return payload as Message
  },

  async deleteMessage(messageId: number): Promise<void> {
    await apiClient.delete(`/api/messaging/messages/${messageId}`)
  },

  async getConversationMembers(conversationId: number, filters: MessageFilters = {}): Promise<ConversationMemberListResponse> {
    const params = new URLSearchParams()
    if (filters.page !== undefined) params.append('page', filters.page.toString())
    if (filters.size !== undefined) params.append('size', filters.size.toString())
    
    const response = await apiClient.get<any>(`/api/messaging/conversations/${conversationId}/members?${params}`)
    const payload = (response as any)?.data ?? response
    return payload as ConversationMemberListResponse
  },

  async removeMemberFromConversation(conversationId: number, userId: number): Promise<void> {
    await apiClient.delete(`/api/messaging/conversations/${conversationId}/members/${userId}`)
  },

  async leaveConversation(conversationId: number): Promise<void> {
    await apiClient.delete(`/api/messaging/conversations/${conversationId}/leave`)
  }
}

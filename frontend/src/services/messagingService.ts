import { apiClient } from './apiClient'
import {
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
  EditMessageRequest,
  MarkAsReadRequest,
  AddMembersRequest,
  PaginatedResponse,
  UnreadCountResponse,
  ConversationFilters,
  MessageFilters,
  User
} from '../types/messaging'

export const messagingService = {
  // Conversation Management
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    return await apiClient.post<Conversation>('/api/messages/conversations', data)
  },

  async getConversationById(id: number): Promise<Conversation> {
    return await apiClient.get<Conversation>(`/api/messages/conversations/${id}`)
  },

  async getUserConversations(filters: ConversationFilters = {}): Promise<PaginatedResponse<Conversation>> {
    const params = new URLSearchParams()
    if (filters.type) params.append('type', filters.type)
    if (filters.page !== undefined) params.append('page', filters.page.toString())
    if (filters.size !== undefined) params.append('size', filters.size.toString())
    
    return await apiClient.get<PaginatedResponse<Conversation>>(`/api/messages/conversations?${params}`)
  },

  async getDirectConversations(filters: ConversationFilters = {}): Promise<PaginatedResponse<Conversation>> {
    const params = new URLSearchParams()
    if (filters.page !== undefined) params.append('page', filters.page.toString())
    if (filters.size !== undefined) params.append('size', filters.size.toString())
    
    return await apiClient.get<PaginatedResponse<Conversation>>(`/api/messages/conversations/direct?${params}`)
  },

  async getGroupConversations(filters: ConversationFilters = {}): Promise<PaginatedResponse<Conversation>> {
    const params = new URLSearchParams()
    if (filters.page !== undefined) params.append('page', filters.page.toString())
    if (filters.size !== undefined) params.append('size', filters.size.toString())
    
    return await apiClient.get<PaginatedResponse<Conversation>>(`/api/messages/conversations/group?${params}`)
  },

  async getOrCreateDirectConversation(userId2: number): Promise<Conversation> {
    return await apiClient.post<Conversation>(`/api/messages/conversations/direct?userId2=${userId2}`)
  },

  // Message Operations
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    return await apiClient.post<Message>('/api/messages/send', data)
  },

  async getConversationMessages(
    conversationId: number, 
    filters: MessageFilters = {}
  ): Promise<PaginatedResponse<Message>> {
    const params = new URLSearchParams()
    if (filters.page !== undefined) params.append('page', filters.page.toString())
    if (filters.size !== undefined) params.append('size', filters.size.toString())
    
    return await apiClient.get<PaginatedResponse<Message>>(`/api/messages/conversations/${conversationId}/messages?${params}`)
  },

  async getMessageById(id: number): Promise<Message> {
    return await apiClient.get<Message>(`/api/messages/messages/${id}`)
  },

  async editMessage(id: number, data: EditMessageRequest): Promise<Message> {
    return await apiClient.put<Message>(`/api/messages/messages/${id}`, data.content)
  },

  async deleteMessage(id: number): Promise<void> {
    await apiClient.delete(`/api/messages/messages/${id}`)
  },

  // Member Management
  async getConversationMembers(
    conversationId: number, 
    filters: ConversationFilters = {}
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams()
    if (filters.page !== undefined) params.append('page', filters.page.toString())
    if (filters.size !== undefined) params.append('size', filters.size.toString())
    
    return await apiClient.get<PaginatedResponse<User>>(`/api/messages/conversations/${conversationId}/members?${params}`)
  },

  async addMembersToConversation(conversationId: number, data: AddMembersRequest): Promise<void> {
    await apiClient.post(`/api/messages/conversations/${conversationId}/members`, data)
  },

  async removeMemberFromConversation(conversationId: number, userId: number): Promise<void> {
    await apiClient.delete(`/api/messages/conversations/${conversationId}/members/${userId}`)
  },

  async leaveConversation(conversationId: number): Promise<void> {
    await apiClient.post(`/api/messages/conversations/${conversationId}/leave`)
  },

  // Read Status
  async markMessageAsRead(data: MarkAsReadRequest): Promise<void> {
    await apiClient.post('/api/messages/markAsRead', data)
  },

  async getTotalUnreadCount(): Promise<UnreadCountResponse> {
    return await apiClient.get<UnreadCountResponse>('/api/messages/unread-count')
  },

  async getConversationUnreadCount(conversationId: number): Promise<{ unreadCount: number }> {
    return await apiClient.get<{ unreadCount: number }>(`/api/messages/conversations/${conversationId}/unread-count`)
  }
}

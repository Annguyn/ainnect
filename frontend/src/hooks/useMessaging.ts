import { useState, useEffect, useCallback } from 'react'
import { Conversation, Message, UnreadCountResponse } from '../types/messaging'
import { messagingService } from '../services/messagingService'

interface UseMessagingOptions {
  currentUserId: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export const useMessaging = ({
  currentUserId,
  autoRefresh = true,
  refreshInterval = 30000
}: UseMessagingOptions) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    try {
      setError(null)
      const response = await messagingService.getUserConversations({ page: 0, size: 100 })
      setConversations(response.content)
    } catch (err) {
      setError('Failed to load conversations')
      console.error('Failed to load conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await messagingService.getTotalUnreadCount()
      setUnreadCount(response.totalUnreadCount)
    } catch (err) {
      console.error('Failed to load unread count:', err)
    }
  }, [])

  const markAsRead = useCallback(async (conversationId: number, messageId: number) => {
    try {
      await messagingService.markMessageAsRead({ conversationId, messageId })
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - 1) }
          : conv
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }, [])

  const sendMessage = useCallback(async (
    conversationId: number,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    attachmentUrls: string[] = []
  ) => {
    try {
      const newMessage = await messagingService.sendMessage({
        conversationId,
        content,
        messageType,
        attachmentUrls
      })
      
      // Update conversation with new last message
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: newMessage, updatedAt: newMessage.createdAt }
          : conv
      ))
      
      return newMessage
    } catch (err) {
      console.error('Failed to send message:', err)
      throw err
    }
  }, [])

  const createConversation = useCallback(async (
    type: 'direct' | 'group',
    title: string,
    participantIds: number[]
  ) => {
    try {
      const newConversation = await messagingService.createConversation({
        type,
        title: type === 'group' ? title : undefined,
        participantIds
      })
      
      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (err) {
      console.error('Failed to create conversation:', err)
      throw err
    }
  }, [])

  const addMembers = useCallback(async (conversationId: number, userIds: number[]) => {
    try {
      await messagingService.addMembersToConversation(conversationId, { userIds })
      // Reload conversation to get updated member list
      const updatedConversation = await messagingService.getConversationById(conversationId)
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? updatedConversation : conv
      ))
    } catch (err) {
      console.error('Failed to add members:', err)
      throw err
    }
  }, [])

  const removeMember = useCallback(async (conversationId: number, userId: number) => {
    try {
      await messagingService.removeMemberFromConversation(conversationId, userId)
      // Reload conversation to get updated member list
      const updatedConversation = await messagingService.getConversationById(conversationId)
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? updatedConversation : conv
      ))
    } catch (err) {
      console.error('Failed to remove member:', err)
      throw err
    }
  }, [])

  const leaveConversation = useCallback(async (conversationId: number) => {
    try {
      await messagingService.leaveConversation(conversationId)
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    } catch (err) {
      console.error('Failed to leave conversation:', err)
      throw err
    }
  }, [])

  const editMessage = useCallback(async (messageId: number, content: string) => {
    try {
      const updatedMessage = await messagingService.editMessage(messageId, { content })
      
      // Update conversation's last message if it was the last one
      setConversations(prev => prev.map(conv => 
        conv.lastMessage?.id === messageId 
          ? { ...conv, lastMessage: updatedMessage }
          : conv
      ))
      
      return updatedMessage
    } catch (err) {
      console.error('Failed to edit message:', err)
      throw err
    }
  }, [])

  const deleteMessage = useCallback(async (messageId: number) => {
    try {
      await messagingService.deleteMessage(messageId)
      
      // Update conversation's last message if it was the last one
      setConversations(prev => prev.map(conv => 
        conv.lastMessage?.id === messageId 
          ? { ...conv, lastMessage: { ...conv.lastMessage, isDeleted: true, content: '' } }
          : conv
      ))
    } catch (err) {
      console.error('Failed to delete message:', err)
      throw err
    }
  }, [])

  // Auto-refresh
  useEffect(() => {
    loadConversations()
    loadUnreadCount()
  }, [loadConversations, loadUnreadCount])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadUnreadCount()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadUnreadCount])

  return {
    conversations,
    unreadCount,
    loading,
    error,
    loadConversations,
    loadUnreadCount,
    markAsRead,
    sendMessage,
    createConversation,
    addMembers,
    removeMember,
    leaveConversation,
    editMessage,
    deleteMessage
  }
}

import { useState, useEffect, useCallback } from 'react'
import { 
  Conversation, 
  Message, 
  ConversationListResponse,
  MessageType,
  ConversationType,
  WebSocketMessage,
  TypingRequest
} from '../types/messaging'
import { messagingService } from '../services/messagingService'
import { useWebSocket } from './useWebSocket'
import { useAuth } from './useAuth'

interface UseMessagingOptions {
  currentUserId?: number
  autoRefresh?: boolean
  refreshInterval?: number
  currentConversationId?: number
}

export const useMessaging = ({
  currentUserId,
  autoRefresh = true,
  refreshInterval = 30000,
  currentConversationId
}: UseMessagingOptions = {}) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingRequest[]>([])

  // WebSocket message handlers
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'NEW_MESSAGE':
        const newMessage = message.data as Message
        setMessages(prev => {
          // Avoid duplicate messages
          const exists = prev?.some(m => m.id === newMessage.id)
          if (exists) return prev
          return [...(prev || []), newMessage]
        })
        
        // Update conversation with new last message
        setConversations(prev => (prev || []).map(conv => 
          conv.id === message.conversationId 
            ? { ...conv, lastMessage: newMessage, updatedAt: newMessage.createdAt }
            : conv
        ))
        
        // Update unread count if not current conversation
        if (message.conversationId !== currentConversationId) {
          setConversations(prev => (prev || []).map(conv => 
            conv.id === message.conversationId 
              ? { ...conv, unreadCount: conv.unreadCount + 1 }
              : conv
          ))
          setUnreadCount(prev => prev + 1)
        }
        break
      case 'MESSAGE_READ':
        // Handle message read status
        const readData = message.data as { messageId: number; userId: number }
        setMessages(prev => (prev || []).map(msg => 
          msg.id === readData.messageId 
            ? { 
                ...msg, 
                readBy: [...(msg.readBy || []), { userId: readData.userId, readAt: new Date().toISOString() }]
              }
            : msg
        ))
        break
      case 'MESSAGE_UPDATED':
        // Handle message updates
        const updatedMessage = message.data as Message
        setMessages(prev => (prev || []).map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        ))
        break
      case 'MESSAGE_DELETED':
        // Handle message deletion
        const deletedMessageId = message.data as number
        setMessages(prev => (prev || []).map(msg => 
          msg.id === deletedMessageId 
            ? { ...msg, isDeleted: true, content: '', deletedAt: new Date().toISOString() }
            : msg
        ))
        break
      case 'MESSAGE_REACTION':
        // Handle message reaction updates
        const reactionData = message.data as {
          messageId: number
          reactionCounts: {
            like: number
            love: number
            wow: number
            sad: number
            angry: number
            haha: number
          }
          userId: number
          currentUserReaction: 'like' | 'love' | 'wow' | 'sad' | 'angry' | 'haha' | null
        }
        setMessages(prev => (prev || []).map(msg => 
          msg.id === reactionData.messageId 
            ? { 
                ...msg, 
                reactionCounts: reactionData.reactionCounts,
                currentUserReaction: reactionData.userId === (user?.id || currentUserId) 
                  ? reactionData.currentUserReaction 
                  : msg.currentUserReaction
              }
            : msg
        ))
        break
      case 'ERROR':
        setError(message.data as string)
        break
    }
  }, [currentConversationId])

  const handleTypingIndicator = useCallback((typingData: TypingRequest) => {
    // Don't show typing indicator for current user
    if (typingData.userId === (user?.id || currentUserId)) {
      return
    }
    
    setTypingUsers(prev => {
      const filtered = prev.filter(t => t.userId !== typingData.userId)
      return typingData.isTyping ? [...filtered, typingData] : filtered
    })
  }, [user?.id, currentUserId])

  const handleWebSocketError = useCallback((error: any) => {
    setError(error.message || 'WebSocket connection error')
  }, [])

  // WebSocket integration
  const {
    isConnected: wsConnected,
    connectionError: wsError,
    sendMessage: wsSendMessage,
    sendTypingIndicator,
    markAsRead: wsMarkAsRead,
    typingUsers: wsTypingUsers
  } = useWebSocket({
    conversationId: currentConversationId,
    onMessage: handleWebSocketMessage,
    onTyping: handleTypingIndicator,
    onError: handleWebSocketError
  })

  // Debug WebSocket status
  useEffect(() => {
    console.log('🔌 WebSocket Status:', {
      wsConnected,
      wsError,
      currentConversationId,
      user: user?.id
    })
  }, [wsConnected, wsError, currentConversationId, user?.id])

  const loadConversations = useCallback(async () => {
    try {
      setError(null)
      const response = await messagingService.getUserConversations({ page: 0, size: 100 })
      setConversations(response.conversations || [])
      setUnreadCount((response.conversations || []).reduce((sum, conv) => sum + conv.unreadCount, 0))
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load conversations'
      setError(errorMessage)
      console.error('Failed to load conversations:', err)
      
      // If it's a session error, show a more user-friendly message
      if (errorMessage.includes('no Session') || errorMessage.includes('could not initialize proxy')) {
        setError('Tạm thời không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại sau.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      setError(null)
      const response = await messagingService.getConversationMessages(conversationId, { page: 0, size: 50 })
      setMessages((response.messages || []).reverse()) 
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load messages'
      setError(errorMessage)
      console.error('Failed to load messages:', err)
      
      // If it's a session error, show a more user-friendly message
      if (errorMessage.includes('no Session') || errorMessage.includes('could not initialize proxy')) {
        setError('Tạm thời không thể tải tin nhắn. Vui lòng thử lại sau.')
      }
    }
  }, [])

  const markAsRead = useCallback(async (conversationId: number, messageId?: number) => {
    if (!user) return
    
    try {
      // Try WebSocket first, fallback to REST API
      if (wsConnected) {
        wsMarkAsRead(messageId)
      } else {
        // Fallback to REST API
        await messagingService.markMessageAsRead({
          conversationId,
          messageId,
          userId: user.id
        })
      }
      
      // Update local state
      setConversations(prev => (prev || []).map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }, [user, wsConnected, wsMarkAsRead])

  const sendMessage = useCallback(async (
    conversationId: number,
    content: string,
    messageType: MessageType = MessageType.TEXT,
    attachmentUrls: string[] = [],
    replyToMessageId?: number
  ) => {
    if (!user) throw new Error('User not authenticated')
    
    console.log('🔍 Debug sendMessage:', {
      wsConnected,
      conversationId,
      content,
      messageType,
      attachmentUrls,
      wsSendMessageType: typeof wsSendMessage
    })
    
    try {
      // Try WebSocket first, fallback to REST API
      if (wsConnected && conversationId) {
        console.log('📤 Sending via WebSocket...')
        try {
          const wsResult = wsSendMessage({
            conversationId,
            content,
            messageType,
            attachmentUrls,
            replyToMessageId
          })
          console.log('✅ WebSocket message sent successfully', wsResult)
          return // Success, don't fallback
        } catch (wsError) {
          console.warn('⚠️ WebSocket failed, falling back to REST API:', wsError)
          // Fall through to REST API fallback
        }
      } else {
        console.log('🚫 WebSocket conditions not met:', { wsConnected, conversationId })
      }
      
      console.log('📤 Using REST API...', { wsConnected, conversationId })
      // Fallback to REST API
      const newMessage = await messagingService.sendMessage({
        conversationId,
        content,
        messageType,
        attachmentUrls,
        replyToMessageId
      })
      
      // Update local state
      setMessages(prev => [...(prev || []), newMessage])
      
      // Update conversation's last message
      setConversations(prev => (prev || []).map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: newMessage, updatedAt: newMessage.createdAt }
          : conv
      ))
      console.log('✅ REST API message sent successfully')
    } catch (err) {
      console.error('❌ Failed to send message:', err)
      throw err
    }
  }, [user, wsConnected, wsSendMessage])

  const createConversation = useCallback(async (
    type: ConversationType,
    title?: string,
    participantIds: number[] = []
  ) => {
    try {
      const newConversation = await messagingService.createConversation({
        type,
        title,
        participantIds
      })
      
      setConversations(prev => [newConversation, ...(prev || [])])
      return newConversation
    } catch (err) {
      console.error('Failed to create conversation:', err)
      throw err
    }
  }, [])

  const addMembers = useCallback(async (conversationId: number, userIds: number[]) => {
    try {
      await messagingService.addMembersToConversation(conversationId, { 
        conversationId, 
        userIds 
      })
      const updatedConversation = await messagingService.getConversationById(conversationId)
      setConversations(prev => (prev || []).map(conv => 
        conv.id === conversationId ? updatedConversation : conv
      ))
    } catch (err) {
      console.error('Failed to add members:', err)
      throw err
    }
  }, [])

  const handleTyping = useCallback((isTyping: boolean) => {
    sendTypingIndicator(isTyping)
  }, [sendTypingIndicator])

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId)
    }
  }, [currentConversationId, loadMessages])

  // Auto-refresh
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user, loadConversations])

  return {
    // State
    conversations,
    messages,
    unreadCount,
    loading,
    error: error || wsError,
    typingUsers: typingUsers.length > 0 ? typingUsers : wsTypingUsers,
    
    // WebSocket status
    wsConnected,
    wsError,
    
    // Actions
    loadConversations,
    loadMessages,
    markAsRead,
    sendMessage,
    createConversation,
    addMembers,
    handleTyping,
    
    // Computed
    currentUserId: user?.id || currentUserId
  }
}

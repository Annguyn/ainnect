import { useCallback, useEffect } from 'react'
import { useWebSocket } from './useWebSocket'
import { Message, Conversation } from '../types/messaging'

interface RealtimeMessagingOptions {
  token?: string
  currentUserId: number
  onNewMessage?: (message: Message) => void
  onMessageUpdate?: (message: Message) => void
  onMessageDelete?: (messageId: number) => void
  onConversationUpdate?: (conversation: Conversation) => void
  onTypingStart?: (conversationId: number, userId: number) => void
  onTypingStop?: (conversationId: number, userId: number) => void
  onUserOnline?: (userId: number) => void
  onUserOffline?: (userId: number) => void
}

export const useRealtimeMessaging = ({
  token,
  currentUserId,
  onNewMessage,
  onMessageUpdate,
  onMessageDelete,
  onConversationUpdate,
  onTypingStart,
  onTypingStop,
  onUserOnline,
  onUserOffline
}: RealtimeMessagingOptions) => {
  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'NEW_MESSAGE':
        onNewMessage?.(message.data)
        break
      
      case 'MESSAGE_UPDATE':
        onMessageUpdate?.(message.data)
        break
      
      case 'MESSAGE_DELETE':
        onMessageDelete?.(message.data.messageId)
        break
      
      case 'CONVERSATION_UPDATE':
        onConversationUpdate?.(message.data)
        break
      
      case 'TYPING_START':
        if (message.data.userId !== currentUserId) {
          onTypingStart?.(message.data.conversationId, message.data.userId)
        }
        break
      
      case 'TYPING_STOP':
        if (message.data.userId !== currentUserId) {
          onTypingStop?.(message.data.conversationId, message.data.userId)
        }
        break
      
      case 'USER_ONLINE':
        onUserOnline?.(message.data.userId)
        break
      
      case 'USER_OFFLINE':
        onUserOffline?.(message.data.userId)
        break
      
      default:
        console.log('Unknown WebSocket message type:', message.type)
    }
  }, [
    currentUserId,
    onNewMessage,
    onMessageUpdate,
    onMessageDelete,
    onConversationUpdate,
    onTypingStart,
    onTypingStop,
    onUserOnline,
    onUserOffline
  ])

  const { sendMessage, isConnected } = useWebSocket({
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws',
    token,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('Connected to real-time messaging')
    },
    onDisconnect: () => {
      console.log('Disconnected from real-time messaging')
    },
    onError: (error) => {
      console.error('WebSocket error:', error)
    }
  })

  const sendTypingStart = useCallback((conversationId: number) => {
    sendMessage({
      type: 'TYPING_START',
      data: { conversationId, userId: currentUserId }
    })
  }, [sendMessage, currentUserId])

  const sendTypingStop = useCallback((conversationId: number) => {
    sendMessage({
      type: 'TYPING_STOP',
      data: { conversationId, userId: currentUserId }
    })
  }, [sendMessage, currentUserId])

  const joinConversation = useCallback((conversationId: number) => {
    sendMessage({
      type: 'JOIN_CONVERSATION',
      data: { conversationId, userId: currentUserId }
    })
  }, [sendMessage, currentUserId])

  const leaveConversation = useCallback((conversationId: number) => {
    sendMessage({
      type: 'LEAVE_CONVERSATION',
      data: { conversationId, userId: currentUserId }
    })
  }, [sendMessage, currentUserId])

  return {
    isConnected,
    sendTypingStart,
    sendTypingStop,
    joinConversation,
    leaveConversation
  }
}

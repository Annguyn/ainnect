import React, { useState, useEffect, useRef } from 'react'
import { Conversation, Message, MessageType, ConversationType, TypingRequest } from '../../types/messaging'
import { messagingService } from '../../services/messagingService'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { cn } from '../../lib/utils'
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Search,
  Users,
  Settings,
  Info
} from 'lucide-react'

interface ChatInterfaceProps {
  conversation: Conversation
  messages: Message[]
  typingUsers: TypingRequest[]
  currentUserId: number
  onBack?: () => void
  onSendMessage?: (conversationId: number, content: string, messageType: any) => Promise<void>
  onTyping?: (isTyping: boolean) => void
  onMarkAsRead?: (conversationId: number, messageId: number) => void
  wsConnected?: boolean
  className?: string
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  messages: propMessages,
  typingUsers: propTypingUsers,
  currentUserId,
  onBack,
  onSendMessage: propOnSendMessage,
  onTyping: propOnTyping,
  onMarkAsRead: propOnMarkAsRead,
  wsConnected,
  className
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (propMessages) {
      setMessages(propMessages)
      setLoading(false)
    } else {
      loadMessages()
    }
  }, [conversation.id, propMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async (pageNum = 0) => {
    try {
      setLoading(true)
      const response = await messagingService.getConversationMessages(
        conversation.id,
        { page: pageNum, size: 50 }
      )
      
      if (pageNum === 0) {
        setMessages((response.messages || []).reverse())
      } else {
        setMessages(prev => [...(response.messages || []).reverse(), ...prev])
      }
      
      setHasMore(response.hasNext)
      setPage(pageNum)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreMessages = () => {
    if (hasMore && !loading) {
      loadMessages(page + 1)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string, messageType: MessageType, attachments: string[]) => {
    if (!content.trim() && attachments.length === 0) return

    try {
      setSending(true)
      
      if (propOnSendMessage) {
        await propOnSendMessage(conversation.id, content, messageType)
      } else {
        const newMessage = await messagingService.sendMessage({
          conversationId: conversation.id,
          content,
          messageType,
          attachmentUrls: attachments
        })
        
        setMessages(prev => [...prev, newMessage])
        
        // Mark as read
        if (propOnMarkAsRead) {
          await propOnMarkAsRead(conversation.id, newMessage.id)
        } else {
          await messagingService.markMessageAsRead({
            conversationId: conversation.id,
            messageId: newMessage.id,
            userId: currentUserId
          })
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleEditMessage = async (message: Message) => {
    const newContent = prompt('Edit message:', message.content)
    if (newContent && newContent !== message.content) {
      try {
        const updatedMessage = await messagingService.editMessage(message.id, {
          content: newContent
        })
        
        setMessages(prev => prev.map(m => 
          m.id === message.id ? updatedMessage : m
        ))
      } catch (error) {
        console.error('Failed to edit message:', error)
      }
    }
  }

  const handleDeleteMessage = async (message: Message) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messagingService.deleteMessage(message.id)
        setMessages(prev => prev.map(m => 
          m.id === message.id ? { ...m, isDeleted: true, content: '' } : m
        ))
      } catch (error) {
        console.error('Failed to delete message:', error)
      }
    }
  }

  const handleReplyMessage = (message: Message) => {
    // TODO: Implement reply functionality
    console.log('Reply to message:', message)
  }

  const handleReactMessage = (message: Message, emoji: string) => {
    // TODO: Implement reaction functionality
    console.log('React to message:', message, emoji)
  }

  const getConversationTitle = () => {
    if (conversation.title) return conversation.title
    
    if (conversation.type === ConversationType.DIRECT) {
      const otherParticipant = conversation.participants?.find(p => p.id !== currentUserId)
      return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Direct Message'
    }
    
    return 'Group Chat'
  }

  const getConversationAvatar = () => {
    if (conversation.avatar) return conversation.avatar
    
    if (conversation.type === ConversationType.DIRECT) {
      const otherParticipant = conversation.participants?.find(p => p.id !== currentUserId)
      return otherParticipant?.avatar || undefined
    }
    
    return undefined
  }

  const isConsecutiveMessage = (currentMessage: Message, previousMessage: Message | undefined) => {
    if (!previousMessage) return false
    return (
      currentMessage.senderId === previousMessage.senderId &&
      new Date(currentMessage.createdAt).getTime() - new Date(previousMessage.createdAt).getTime() < 300000 // 5 minutes
    )
  }

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            {getConversationAvatar() ? (
              <img
                src={getConversationAvatar()}
                alt={getConversationTitle()}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {getConversationTitle().charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <div>
              <h2 className="font-semibold text-gray-900">{getConversationTitle()}</h2>
              {conversation.type === ConversationType.DIRECT && (
                <p className="text-sm text-gray-500">
                  {conversation.participants?.find(p => p.id !== currentUserId)?.isOnline ? 'Online' : 'Offline'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={(e) => {
          const { scrollTop } = e.currentTarget
          if (scrollTop === 0 && hasMore) {
            loadMoreMessages()
          }
        }}
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              isConsecutive={isConsecutiveMessage(message, messages[index - 1])}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
              onReply={handleReplyMessage}
              onReact={handleReactMessage}
            />
          ))
        )}
        
        {loading && messages.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          </div>
        )}
        
        {/* Typing Indicator */}
        {propTypingUsers && propTypingUsers.length > 0 && (
          <TypingIndicator 
            users={propTypingUsers.map(t => ({
              id: t.userId,
              firstName: t.username,
              lastName: ''
            }))}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onStartTyping={() => propOnTyping?.(true)}
        onStopTyping={() => propOnTyping?.(false)}
        disabled={sending}
        placeholder={`Message ${getConversationTitle()}...`}
      />
    </div>
  )
}

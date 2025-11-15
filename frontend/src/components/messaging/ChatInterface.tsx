import React, { useState, useEffect, useRef } from 'react'
import { Conversation, Message, MessageType, ConversationType, TypingRequest } from '../../types/messaging'
import { messagingService } from '../../services/messagingService'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { useMessageReactions } from '../../hooks/useMessageReactions'
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

  // Initialize message reactions hook
  const {
    reactionCounts,
    currentUserReactions,
    isReacting,
    reactToMessage: handleReactToMessage,
    removeReaction: handleRemoveReaction,
    setInitialReactionsBatch
  } = useMessageReactions()

  useEffect(() => {
    if (propMessages) {
      setMessages(propMessages)
      setLoading(false)
      // Initialize reactions from messages
      const reactionsData: Record<number, any> = {}
      const userReactionsData: Record<number, 'like' | 'love' | 'wow' | 'sad' | 'angry' | 'haha' | null> = {}
      propMessages.forEach(msg => {
        if (msg.reactionCounts) {
          reactionsData[msg.id] = msg.reactionCounts
        }
        if (msg.currentUserReaction !== undefined) {
          userReactionsData[msg.id] = msg.currentUserReaction
        }
      })
      setInitialReactionsBatch(reactionsData, userReactionsData)
    } else {
      loadMessages()
    }
  }, [conversation.id, propMessages, setInitialReactionsBatch])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!messages || messages.length === 0) return
    const latest = messages[messages.length - 1]
    if (latest.senderId !== currentUserId && !latest.isRead) {
      if (propOnMarkAsRead) {
        propOnMarkAsRead(conversation.id, latest.id)
      }
    }
  }, [messages, currentUserId, conversation.id, propOnMarkAsRead])

  useEffect(() => {
    console.log('Conversation data:', conversation);
  }, [conversation]);

  const loadMessages = async (pageNum = 0) => {
    try {
      setLoading(true)
      const response = await messagingService.getConversationMessages(
        conversation.id,
        { page: pageNum, size: 50 }
      )
      
      const reversedMessages = (response.messages || []).reverse()
      
      if (pageNum === 0) {
        setMessages(reversedMessages)
      } else {
        setMessages(prev => [...reversedMessages, ...prev])
      }
      
      // Initialize reactions from loaded messages
      const reactionsData: Record<number, any> = {}
      const userReactionsData: Record<number, 'like' | 'love' | 'wow' | 'sad' | 'angry' | 'haha' | null> = {}
      reversedMessages.forEach(msg => {
        if (msg.reactionCounts) {
          reactionsData[msg.id] = msg.reactionCounts
        }
        if (msg.currentUserReaction !== undefined) {
          userReactionsData[msg.id] = msg.currentUserReaction
        }
      })
      setInitialReactionsBatch(reactionsData, userReactionsData)
      
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

  const handleSendMessage = async (content: string, messageType: MessageType, attachments: string[], _replyToMessageId?: number, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0) && attachments.length === 0) return

    try {
      setSending(true)

      // 1) If media files provided, use upload API for each file
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const uploadedMessage = await messagingService.uploadAndSendMessage(conversation.id, file)
            setMessages(prev => [...prev, uploadedMessage])
            if (propOnMarkAsRead) {
              await propOnMarkAsRead(conversation.id, uploadedMessage.id)
            } else {
              await messagingService.markMessageAsRead({
                conversationId: conversation.id,
                messageId: uploadedMessage.id,
                userId: currentUserId
              })
            }
          } catch (err) {
            console.error('Failed to upload/send media message:', err)
          }
        }
      }

      // 2) If there is text content, send it as a separate message
      if (content.trim()) {
        if (propOnSendMessage) {
          await propOnSendMessage(conversation.id, content, MessageType.TEXT)
        } else {
          const newMessage = await messagingService.sendMessage({
            conversationId: conversation.id,
            content,
            messageType: MessageType.TEXT,
            attachmentUrls: attachments || []
          })
          setMessages(prev => [...prev, newMessage])
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
    const preview = message.content?.slice(0, 120) || ''
    const event = new CustomEvent('setReplyTo', { detail: { id: message.id, preview } })
    window.dispatchEvent(event)
  }

  const handleReactMessage = async (message: Message, reactionType: 'like' | 'love' | 'wow' | 'sad' | 'angry' | 'haha') => {
    try {
      // Check if user already reacted with this type
      const currentReaction = currentUserReactions[message.id]
      
      if (currentReaction === reactionType) {
        // Remove reaction if clicking same type
        await handleRemoveReaction(message.id)
      } else {
        // Add or change reaction
        await handleReactToMessage(message.id, reactionType)
      }
    } catch (error) {
      console.error('Failed to react to message:', error)
    }
  }

  const getConversationTitle = () => {
    if (conversation.type === ConversationType.DIRECT) {
      return conversation.otherParticipantDisplayName || 'Người dùng';
    }
    return conversation.title || 'Trò chuyện nhóm';
  };

  const getConversationAvatar = () => {
    if (conversation.type === ConversationType.DIRECT) {
      return conversation.otherParticipantAvatarUrl || undefined;
    }
    return conversation.avatar || undefined;
  };

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
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
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
              <div className="flex items-center space-x-2">
                <h2 className="font-semibold text-gray-900">{getConversationTitle()}</h2>
                {conversation.type === ConversationType.DIRECT && (
                  <span className={cn(
                    'inline-flex items-center text-xs px-2 py-0.5 rounded-full',
                    conversation.participants?.find(p => p.id !== currentUserId)?.isOnline
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    {conversation.participants?.find(p => p.id !== currentUserId)?.isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Tìm kiếm trong cuộc trò chuyện">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Gọi thoại">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Gọi video">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Thành viên">
            <Users className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Thêm">
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
        {/* Top loader when fetching older messages */}
        {loading && page > 0 && (
          <div className="flex items-center justify-center py-2">
            <div className="w-full max-w-sm space-y-2">
              <div className="h-3 bg-gray-200 rounded w-24 mx-auto animate-pulse" />
              <div className="h-16 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p className="text-sm">Chưa có tin nhắn</p>
            <p className="text-xs">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const prev = messages[index - 1]
            const showDateDivider = !prev || new Date(message.createdAt).toDateString() !== new Date(prev.createdAt).toDateString()
            return (
              <div key={message.id}>
                {showDateDivider && (
                  <div className="flex items-center justify-center py-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={message}
                  currentUserId={currentUserId}
                  isConsecutive={isConsecutiveMessage(message, prev)}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onReply={handleReplyMessage}
                  onReact={handleReactMessage}
                  reactionCounts={reactionCounts[message.id]}
                  currentUserReaction={currentUserReactions[message.id]}
                  isReacting={isReacting[message.id]}
                />
              </div>
            )
          })
        )}
        
        {/* Bottom subtle loader (e.g., after send) */}
        {loading && messages.length > 0 && page === 0 && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          </div>
        )}
        
        {/* Typing Indicator */}
        {propTypingUsers && propTypingUsers.length > 0 && (
          <TypingIndicator 
            typingUsers={propTypingUsers}
            participants={conversation.type === ConversationType.DIRECT
              ? [
                  {
                    id: conversation.otherParticipantId || 0,
                    displayName: conversation.otherParticipantDisplayName,
                    username: conversation.otherParticipantUsername || ''
                  }
                ]
              : conversation.participants?.map(p => ({
                  id: p.id,
                  displayName: p.displayName,
                  username: p.username
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
        placeholder={`Nhập tin nhắn tới ${getConversationTitle()}...`}
      />
    </div>
  )
}

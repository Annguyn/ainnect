import React, { useState, useEffect } from 'react'
import { Conversation, ConversationType } from '../../types/messaging'
import { User } from '../../types'
import { useMessaging } from '../../hooks/useMessaging'
import { ConversationList } from './ConversationList'
import { ChatInterface } from './ChatInterface'
import { CreateConversationModal } from './CreateConversationModal'
import { socialService } from '../../services/socialService'
import { cn } from '../../lib/utils'

interface MessagingAppProps {
  currentUserId?: number
  initialConversationId?: number
  className?: string
}

export const MessagingApp: React.FC<MessagingAppProps> = ({
  currentUserId,
  initialConversationId,
  className
}) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showWebSocketTest, setShowWebSocketTest] = useState(false)
  const [friends, setFriends] = useState<User[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)

  const {
    conversations,
    messages,
    unreadCount,
    loading,
    error,
    typingUsers,
    wsConnected,
    wsError,
    loadConversations,
    loadMessages,
    markAsRead,
    sendMessage,
    createConversation,
    addMembers,
    handleTyping,
    currentUserId: actualUserId
  } = useMessaging({
    currentUserId,
    currentConversationId: selectedConversation?.id
  })

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    // Mark messages as read when selecting conversation
    if (conversation.unreadCount > 0) {
      markAsRead(conversation.id)
    }
  }

  const loadFriends = async () => {
    try {
      setLoadingFriends(true)
      if (actualUserId) {
        const response = await socialService.getFriends(actualUserId, 0, 100) // Load up to 100 friends
        console.log('Friends API Response:', response)
        
        // Response is already transformed by socialService.getFriends()
        const friends = response.content || []
        
        console.log('Friends data:', friends)
        setFriends(friends)
      }
    } catch (error) {
      console.error('Error loading friends:', error)
    } finally {
      setLoadingFriends(false)
    }
  }

  const handleCreateConversation = async (
    type: ConversationType,
    title?: string,
    participantIds: number[] = []
  ) => {
    try {
      const newConversation = await createConversation(type, title, participantIds)
      setSelectedConversation(newConversation)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  const handleShowCreateModal = () => {
    loadFriends()
    setShowCreateModal(true)
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
  }

  // Auto-select conversation when initialConversationId is provided
  useEffect(() => {
    if (initialConversationId && conversations && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === initialConversationId)
      if (conversation && !selectedConversation) {
        setSelectedConversation(conversation)
      }
    }
  }, [initialConversationId, conversations, selectedConversation])

  return (
    <div className={cn("flex h-full bg-gray-50", className)}>
      {/* Error Status Indicator */}
      {error && (
        <div className="absolute top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="text-sm mb-2">{error}</p>
          <button 
            onClick={() => {
              loadConversations()
            }}
            className="text-xs bg-red-200 hover:bg-red-300 px-2 py-1 rounded transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Conversation List - Hidden on mobile when chat is open */}
      <div className={cn(
        "w-full lg:w-80 flex-shrink-0",
        selectedConversation ? "hidden lg:block" : "block"
      )}>
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onConversationSelect={handleConversationSelect}
          onCreateConversation={handleShowCreateModal}
          loading={loading}
          error={error}
        />
      </div>

      {/* Chat Interface */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            conversation={selectedConversation}
            messages={messages}
            typingUsers={typingUsers}
            currentUserId={actualUserId || 0}
            onBack={handleBackToList}
            onSendMessage={sendMessage}
            onTyping={handleTyping}
            onMarkAsRead={markAsRead}
            wsConnected={wsConnected}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chào mừng đến với Tin nhắn</h3>
            <p className="text-gray-600 mb-4">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
            <button
              onClick={handleShowCreateModal}
              className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Cuộc trò chuyện mới
            </button>
          </div>
        </div>
      )}

      {/* Create Conversation Modal */}
      <CreateConversationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateConversation={handleCreateConversation}
        currentUserId={actualUserId || 0}
        friends={friends}
        loadingFriends={loadingFriends}
      />

      {/* WebSocket Test Modal removed */}
    </div>
  )
}

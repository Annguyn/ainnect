import React, { useState, useEffect } from 'react'
import { Conversation } from '../../types/messaging'
import { messagingService } from '../../services/messagingService'
import { ConversationList } from './ConversationList'
import { ChatInterface } from './ChatInterface'
import { CreateConversationModal } from './CreateConversationModal'
import { cn } from '../../lib/utils'

interface MessagingAppProps {
  currentUserId: number
  className?: string
}

export const MessagingApp: React.FC<MessagingAppProps> = ({
  currentUserId,
  className
}) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const response = await messagingService.getTotalUnreadCount()
      setUnreadCount(response.totalUnreadCount)
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const handleCreateConversation = async (
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
      
      setSelectedConversation(newConversation)
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
  }

  return (
    <div className={cn("flex h-full bg-gray-50", className)}>
      {/* Conversation List - Hidden on mobile when chat is open */}
      <div className={cn(
        "w-full lg:w-80 flex-shrink-0",
        selectedConversation ? "hidden lg:block" : "block"
      )}>
        <ConversationList
          selectedConversationId={selectedConversation?.id}
          onConversationSelect={handleConversationSelect}
          onCreateConversation={() => setShowCreateModal(true)}
        />
      </div>

      {/* Chat Interface */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            conversation={selectedConversation}
            currentUserId={currentUserId}
            onBack={handleBackToList}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Messages</h3>
            <p className="text-gray-600 mb-4">Select a conversation to start messaging</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Conversation
            </button>
          </div>
        </div>
      )}

      {/* Create Conversation Modal */}
      <CreateConversationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateConversation={handleCreateConversation}
        currentUserId={currentUserId}
      />
    </div>
  )
}

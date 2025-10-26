import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMessaging } from '../hooks/useMessaging'
import { Conversation, ConversationType } from '../types/messaging'
import { cn } from '../lib/utils'
import { 
  MessageCircle, 
  Plus, 
  Search,
  X,
  Users,
  User
} from 'lucide-react'

interface MessagingNavigationProps {
  className?: string
  showSearch?: boolean
  showCreateButton?: boolean
  maxConversations?: number
}

export const MessagingNavigation: React.FC<MessagingNavigationProps> = ({
  className,
  showSearch = true,
  showCreateButton = true,
  maxConversations = 5
}) => {
  const navigate = useNavigate()
  const { conversations, unreadCount } = useMessaging()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredConversations = (conversations || [])
    .filter(conv => 
      !searchQuery || 
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants?.some(p => 
        p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .slice(0, maxConversations)

  const handleConversationClick = (conversation: Conversation) => {
    navigate(`/messages/${conversation.id}`)
    setShowDropdown(false)
  }

  const handleCreateConversation = () => {
    navigate('/messages')
    setShowDropdown(false)
  }

  return (
    <div className={cn("relative", className)}>
      {/* Messages Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-primary-600 transition-colors"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Tin nhắn</h3>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Search */}
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Conversations List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Không tìm thấy cuộc trò chuyện nào</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation)}
                    className="w-full p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0 relative">
                        {conversation.avatar ? (
                          <img
                            src={conversation.avatar}
                            alt={conversation.title || 'Conversation'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {conversation.title?.charAt(0) || 
                               (conversation.type === ConversationType.DIRECT ? 'D' : 'G')}
                            </span>
                          </div>
                        )}
                        
                        {/* Online indicator */}
                        {conversation.type === ConversationType.DIRECT && conversation.participants?.[0]?.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate text-sm">
                            {conversation.title || 
                             (conversation.type === ConversationType.DIRECT && conversation.participants?.[0] 
                               ? `${conversation.participants[0].firstName} ${conversation.participants[0].lastName}`
                               : 'Group Chat')}
                          </h4>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {conversation.lastMessage.isDeleted ? (
                              <span className="italic text-gray-400">Message deleted</span>
                            ) : (
                              conversation.lastMessage.content
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200">
              {showCreateButton && (
                <button
                  onClick={handleCreateConversation}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cuộc trò chuyện mới</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MessagingNavigation

import React, { useState, useEffect } from 'react'
import { Conversation, ConversationType } from '../../types/messaging'
import { messagingService } from '../../services/messagingService'
import { cn } from '../../lib/utils'
import { GroupMembersDisplay } from './GroupMembersDisplay'
import { 
  MessageCircle, 
  Users, 
  Plus, 
  Search,
  MoreVertical,
  Settings
} from 'lucide-react'

interface ConversationListProps {
  conversations?: Conversation[]
  selectedConversationId?: number
  onConversationSelect: (conversation: Conversation) => void
  onCreateConversation: () => void
  loading?: boolean
  error?: string | null
  className?: string
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations: propConversations,
  selectedConversationId,
  onConversationSelect,
  onCreateConversation,
  loading: propLoading,
  error: propError,
  className
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'Tất cả' | 'Trực tiếp' | 'Nhóm'>('Tất cả')

  useEffect(() => {
    if (propConversations) {
      setConversations(propConversations)
      setLoading(false)
    } else {
      loadConversations()
    }
  }, [activeTab, propConversations])

  const loadConversations = async () => {
    try {
      setLoading(true)
      let response
      
      switch (activeTab) {
        case 'Trực tiếp':
          response = await messagingService.getDirectConversations({ page: 0, size: 50 })
          break
        case 'Nhóm':
          response = await messagingService.getGroupConversations({ page: 0, size: 50 })
          break
        default:
          response = await messagingService.getUserConversations({ page: 0, size: 50 })
      }
      
      setConversations(response.conversations)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = (conversations || []).filter(conversation => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      conversation.title?.toLowerCase().includes(searchLower) ||
      conversation.participants?.some(p => 
        p.firstName.toLowerCase().includes(searchLower) ||
        p.lastName.toLowerCase().includes(searchLower) ||
        p.username.toLowerCase().includes(searchLower)
      )
    )
  })

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title
    
    if (conversation.type === ConversationType.DIRECT) {
      if (conversation.otherParticipantDisplayName) {
        return conversation.otherParticipantDisplayName
      }
      if (conversation.otherParticipantUsername) {
        return conversation.otherParticipantUsername
      }
      const otherParticipant = conversation.participants?.[0]
      if (otherParticipant) {
        return otherParticipant.displayName || `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() || otherParticipant.username
      }
      return 'Tin nhắn riêng'
    }
    
    return 'Nhóm trò chuyện'
  }

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.avatar) return conversation.avatar
    
    if (conversation.type === ConversationType.DIRECT) {
      if (conversation.otherParticipantAvatarUrl) {
        return conversation.otherParticipantAvatarUrl
      }
      return conversation.participants?.[0]?.avatar || undefined
    }
    
    return undefined
  }

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-gray-200", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onCreateConversation}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex mt-4 space-x-1">
          {[
            { key: 'Tất cả', label: 'Tất cả', icon: MessageCircle },
            { key: 'Trực tiếp', label: 'Trực tiếp', icon: MessageCircle },
            { key: 'Nhóm', label: 'Nhóm', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === key
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <MessageCircle className="w-8 h-8 mb-2" />
            <p className="text-sm">Không tìm thấy cuộc trò chuyện nào</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation)}
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer transition-colors group",
                  selectedConversationId === conversation.id
                    ? "bg-primary-50 border border-primary-200"
                    : "hover:bg-gray-50"
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 mr-3">
                  {getConversationAvatar(conversation) ? (
                    <img
                      src={getConversationAvatar(conversation)}
                      alt={getConversationTitle(conversation)}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {getConversationTitle(conversation).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Online indicator for direct messages */}
                  {conversation.type === ConversationType.DIRECT && (
                    conversation.otherParticipantIsOnline || conversation.participants?.[0]?.isOnline
                  ) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                  
                  {/* Unread count */}
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {getConversationTitle(conversation)}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatLastMessageTime(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.isDeleted ? (
                        <span className="italic text-gray-400">Message deleted</span>
                      ) : (
                        conversation.lastMessage.content
                      )}
                    </p>
                  )}
                  
                  {/* Group members display for group conversations */}
                  {conversation.type === ConversationType.GROUP && (
                    <div className="mt-1">
                      <GroupMembersDisplay conversation={conversation} />
                    </div>
                  )}
                </div>

                {/* More options */}
                <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

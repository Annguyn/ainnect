import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Conversation, ConversationType } from '../types/messaging'
import { cn } from '../lib/utils'

interface ConversationLinkProps {
  conversation: Conversation
  className?: string
  children?: React.ReactNode
  showUnreadCount?: boolean
}

export const ConversationLink: React.FC<ConversationLinkProps> = ({
  conversation,
  className,
  children,
  showUnreadCount = true
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/messages/${conversation.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors",
        "border border-transparent hover:border-gray-200",
        className
      )}
    >
      {children || (
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
                  {conversation.title?.charAt(0) || 'C'}
                </span>
              </div>
            )}
            
            {/* Online indicator for direct messages */}
            {conversation.type === ConversationType.DIRECT && conversation.participants?.[0]?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 truncate">
                {conversation.title || 
                 (conversation.type === ConversationType.DIRECT && conversation.participants?.[0] 
                   ? `${conversation.participants[0].firstName} ${conversation.participants[0].lastName}`
                   : 'Group Chat')}
              </h3>
              {showUnreadCount && conversation.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </span>
              )}
            </div>
            
            {conversation.lastMessage && (
              <p className="text-sm text-gray-600 truncate mt-1">
                {conversation.lastMessage.isDeleted ? (
                  <span className="italic text-gray-400">Message deleted</span>
                ) : (
                  conversation.lastMessage.content
                )}
              </p>
            )}
          </div>

          {/* Time */}
          {conversation.lastMessage && (
            <div className="flex-shrink-0 text-xs text-gray-500">
              {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
        </div>
      )}
    </button>
  )
}

export default ConversationLink

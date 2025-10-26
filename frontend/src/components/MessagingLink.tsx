import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMessaging } from '../hooks/useMessaging'
import { cn } from '../lib/utils'

interface MessagingLinkProps {
  conversationId?: number
  className?: string
  children?: React.ReactNode
  showUnreadCount?: boolean
  variant?: 'button' | 'link'
}

export const MessagingLink: React.FC<MessagingLinkProps> = ({
  conversationId,
  className,
  children,
  showUnreadCount = true,
  variant = 'link'
}) => {
  const navigate = useNavigate()
  const { unreadCount } = useMessaging()

  const handleClick = () => {
    if (conversationId) {
      navigate(`/messages/${conversationId}`)
    } else {
      navigate('/messages')
    }
  }

  const baseClasses = variant === 'button' 
    ? "inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
    : "text-primary-600 hover:text-primary-700 transition-colors"

  return (
    <button
      onClick={handleClick}
      className={cn(baseClasses, className)}
    >
      {children || (
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          <span>Tin nhắn</span>
          {showUnreadCount && unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      )}
    </button>
  )
}

export default MessagingLink

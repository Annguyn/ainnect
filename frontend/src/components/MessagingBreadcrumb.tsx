import React from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, MessageCircle, ArrowLeft } from 'lucide-react'
import { cn } from '../lib/utils'

interface MessagingBreadcrumbProps {
  conversationTitle?: string
  className?: string
}

export const MessagingBreadcrumb: React.FC<MessagingBreadcrumbProps> = ({
  conversationTitle,
  className
}) => {
  const { conversationId } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()

  const handleBack = () => {
    if (conversationId) {
      navigate('/messages')
    } else {
      navigate('/')
    }
  }

  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      <button
        onClick={handleBack}
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </button>
      
      <ChevronRight className="w-4 h-4 text-gray-400" />
      
      <Link 
        to="/messages" 
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Tin nhắn</span>
      </Link>
      
      {conversationId && conversationTitle && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-48">
            {conversationTitle}
          </span>
        </>
      )}
    </nav>
  )
}

export default MessagingBreadcrumb

import React, { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { MessagingApp } from '../components/messaging/MessagingApp'
import { MessagingBreadcrumb } from '../components/MessagingBreadcrumb'
import { Header } from '../components/Header'
import { useAuth } from '../hooks/useAuth'
import { messagingService } from '../services/messagingService'
import { Conversation, ConversationType } from '../types/messaging'

const ConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user, isAuthenticated } = useAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) return
      
      try {
        setLoading(true)
        const conv = await messagingService.getConversationById(parseInt(conversationId))
        setConversation(conv)
      } catch (err) {
        setError('Failed to load conversation')
        console.error('Failed to load conversation:', err)
      } finally {
        setLoading(false)
      }
    }

    loadConversation()
  }, [conversationId])

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Conversation Not Found</h2>
          <p className="text-gray-600 mb-4">The conversation you're looking for doesn't exist or you don't have access to it.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={true} showUserMenu={true} />
      <div className="h-[calc(100vh-64px)] flex flex-col">
        <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200">
          <MessagingBreadcrumb 
            conversationTitle={conversation.title || 
              (conversation.type === ConversationType.DIRECT && conversation.participants?.[0] 
                ? `${conversation.participants[0].firstName} ${conversation.participants[0].lastName}`
                : 'Group Chat')}
          />
        </div>
        <div className="flex-1 min-h-0">
          <MessagingApp initialConversationId={conversation.id} />
        </div>
      </div>
    </div>
  )
}

export default ConversationPage

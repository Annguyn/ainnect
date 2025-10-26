import React from 'react'
import { MessagingApp } from '../components/messaging/MessagingApp'
import { MessagingBreadcrumb } from '../components/MessagingBreadcrumb'
import { Header } from '../components/Header'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

const MessagingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={true} showUserMenu={true} />
      <div className="h-[calc(100vh-64px)] flex flex-col">
        <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200">
          <MessagingBreadcrumb />
        </div>
        <div className="flex-1 min-h-0">
          <MessagingApp />
        </div>
      </div>
    </div>
  )
}

export default MessagingPage
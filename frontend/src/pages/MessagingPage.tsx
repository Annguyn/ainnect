import React from 'react'
import { MessagingApp } from '../components/messaging'

interface MessagingPageProps {
  currentUserId: number
}

export const MessagingPage: React.FC<MessagingPageProps> = ({ currentUserId }) => {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Stay connected with your team</p>
      </div>

      {/* Messaging App */}
      <div className="flex-1 overflow-hidden">
        <MessagingApp currentUserId={currentUserId} />
      </div>
    </div>
  )
}

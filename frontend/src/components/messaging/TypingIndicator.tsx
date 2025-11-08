import React from 'react'
import { cn } from '../../lib/utils'
import { TypingRequest } from '../../types/messaging'

interface TypingIndicatorProps {
  typingUsers: TypingRequest[]
  participants?: Array<{
    id: number
    displayName?: string
    username: string
  }>
  className?: string
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  participants,
  className
}) => {
  if (!typingUsers || typingUsers.length === 0) return null

  const getDisplayName = (userId: number, username: string): string => {
    if (participants) {
      const participant = participants.find(p => p.id === userId)
      if (participant?.displayName) {
        return participant.displayName
      }
    }
    return username
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      const user = typingUsers[0]
      const displayName = getDisplayName(user.userId, user.username)
      return `${displayName} đang gõ...`
    } else if (typingUsers.length === 2) {
      const user1 = typingUsers[0]
      const user2 = typingUsers[1]
      const displayName1 = getDisplayName(user1.userId, user1.username)
      const displayName2 = getDisplayName(user2.userId, user2.username)
      return `${displayName1} và ${displayName2} đang gõ...`
    } else {
      const user1 = typingUsers[0]
      const displayName1 = getDisplayName(user1.userId, user1.username)
      return `${displayName1} và ${typingUsers.length - 1} người khác đang gõ...`
    }
  }

  return (
    <div className={cn("flex items-center space-x-2 p-3 bg-gray-50 rounded-lg mx-4 mb-2", className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-gray-600 italic">{getTypingText()}</span>
    </div>
  )
}

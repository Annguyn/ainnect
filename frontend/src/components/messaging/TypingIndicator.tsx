import React from 'react'
import { cn } from '../../lib/utils'

interface TypingIndicatorProps {
  users: Array<{
    id: number
    firstName: string
    lastName: string
  }>
  className?: string
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  users,
  className
}) => {
  if (users.length === 0) return null

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].firstName} đang gõ...`
    } else if (users.length === 2) {
      return `${users[0].firstName} và ${users[1].firstName} đang gõ...`
    } else {
      return `${users[0].firstName} và ${users.length - 1} người khác đang gõ...`
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

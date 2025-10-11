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
      return `${users[0].firstName} is typing...`
    } else if (users.length === 2) {
      return `${users[0].firstName} and ${users[1].firstName} are typing...`
    } else {
      return `${users[0].firstName} and ${users.length - 1} others are typing...`
    }
  }

  return (
    <div className={cn("flex items-center space-x-2 p-3", className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-gray-500 italic">{getTypingText()}</span>
    </div>
  )
}

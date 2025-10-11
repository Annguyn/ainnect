import React, { useState } from 'react'
import { cn } from '../../lib/utils'

interface FollowButtonProps {
  userId: number
  isFollowing?: boolean
  isFollower?: boolean
  isFriend?: boolean
  onFollow?: (userId: number) => void
  onUnfollow?: (userId: number) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  disabled?: boolean
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing = false,
  isFollower = false,
  isFriend = false,
  onFollow,
  onUnfollow,
  className,
  size = 'md',
  variant = 'default',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentState, setCurrentState] = useState({
    isFollowing,
    isFollower,
    isFriend
  })

  const handleClick = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      if (currentState.isFollowing) {
        await onUnfollow?.(userId)
        setCurrentState(prev => ({ ...prev, isFollowing: false }))
      } else {
        await onFollow?.(userId)
        setCurrentState(prev => ({ ...prev, isFollowing: true }))
      }
    } catch (error) {
      console.error('Follow/Unfollow error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonText = () => {
    if (currentState.isFriend) return 'Bạn bè'
    if (currentState.isFollowing && currentState.isFollower) return 'Theo dõi lẫn nhau'
    if (currentState.isFollowing) return 'Đang theo dõi'
    if (currentState.isFollower) return 'Theo dõi lại'
    return 'Theo dõi'
  }

  const getButtonIcon = () => {
    if (currentState.isFollowing) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const variantClasses = {
    default: currentState.isFollowing
      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
      : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
    outline: currentState.isFollowing
      ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
      : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-600',
    ghost: currentState.isFollowing
      ? 'bg-transparent text-gray-700 hover:bg-gray-100'
      : 'bg-transparent text-blue-600 hover:bg-blue-50'
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        getButtonIcon()
      )}
      <span>{getButtonText()}</span>
    </button>
  )
}

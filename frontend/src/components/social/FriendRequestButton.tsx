import React, { useState } from 'react'
import { cn } from '../../lib/utils'

type FriendshipButtonStatus = 'none' | 'friends' | 'pending_request' | 'request_sent' | 'blocked';

interface FriendRequestButtonProps {
  userId: number
  friendshipStatus?: FriendshipButtonStatus
  onSendRequest?: (userId: number, message?: string) => void
  onAcceptRequest?: (requestId: number) => void
  onDeclineRequest?: (requestId: number) => void
  onRemoveFriend?: (userId: number) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  disabled?: boolean
  requestId?: number
}

export const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({
  userId,
  friendshipStatus = 'none',
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onRemoveFriend,
  className,
  size = 'md',
  variant = 'default',
  disabled = false,
  requestId
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showMessageInput, setShowMessageInput] = useState(false)
  const [message, setMessage] = useState('')

  const handleSendRequest = async () => {
    if (disabled || isLoading) return

    if (friendshipStatus === 'none') {
      setShowMessageInput(true)
      return
    }

    setIsLoading(true)
    try {
      await onSendRequest?.(userId, message)
      setShowMessageInput(false)
      setMessage('')
    } catch (error) {
      console.error('Send friend request error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRequest = async () => {
    if (disabled || isLoading || !requestId) return

    setIsLoading(true)
    try {
      await onAcceptRequest?.(requestId)
    } catch (error) {
      console.error('Accept friend request error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeclineRequest = async () => {
    if (disabled || isLoading || !requestId) return

    setIsLoading(true)
    try {
      await onDeclineRequest?.(requestId)
    } catch (error) {
      console.error('Decline friend request error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFriend = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      await onRemoveFriend?.(userId)
    } catch (error) {
      console.error('Remove friend error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonText = () => {
    switch (friendshipStatus) {
      case 'friends':
        return 'Bạn bè'
      case 'request_sent':
        return 'Đã gửi lời mời'
      case 'pending_request':
        return 'Chấp nhận'
      case 'blocked':
        return 'Đã chặn'
      default:
        return 'Kết bạn'
    }
  }

  const getButtonIcon = () => {
    switch (friendshipStatus) {
      case 'friends':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'request_sent':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'pending_request':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const variantClasses = {
    default: friendshipStatus === 'friends'
      ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
      : friendshipStatus === 'request_sent'
      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
      : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
    outline: friendshipStatus === 'friends'
      ? 'bg-white text-green-700 hover:bg-green-50 border border-green-300'
      : friendshipStatus === 'request_sent'
      ? 'bg-white text-yellow-700 hover:bg-yellow-50 border border-yellow-300'
      : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-600',
    ghost: friendshipStatus === 'friends'
      ? 'bg-transparent text-green-700 hover:bg-green-100'
      : friendshipStatus === 'request_sent'
      ? 'bg-transparent text-yellow-700 hover:bg-yellow-100'
      : 'bg-transparent text-blue-600 hover:bg-blue-50'
  }

  if (friendshipStatus === 'pending_request') {
    return (
      <div className="flex space-x-2">
        <button
          onClick={handleAcceptRequest}
          disabled={disabled || isLoading}
          className={cn(
            'inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-green-600 text-white hover:bg-green-700 border border-green-600',
            sizeClasses[size],
            className
          )}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span>Chấp nhận</span>
        </button>
        <button
          onClick={handleDeclineRequest}
          disabled={disabled || isLoading}
          className={cn(
            'inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-red-600 text-white hover:bg-red-700 border border-red-600',
            sizeClasses[size]
          )}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>Từ chối</span>
        </button>
      </div>
    )
  }

  if (showMessageInput) {
    return (
      <div className="space-y-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Gửi lời nhắn cùng lời mời kết bạn (tùy chọn)"
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        <div className="flex space-x-2">
          <button
            onClick={handleSendRequest}
            disabled={disabled || isLoading}
            className={cn(
              'inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
              sizeClasses[size]
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            <span>Gửi lời mời</span>
          </button>
          <button
            onClick={() => {
              setShowMessageInput(false)
              setMessage('')
            }}
            className={cn(
              'inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
              'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
              sizeClasses[size]
            )}
          >
            <span>Hủy</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={friendshipStatus === 'friends' ? handleRemoveFriend : handleSendRequest}
      disabled={disabled || isLoading || friendshipStatus === 'request_sent'}
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

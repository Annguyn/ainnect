import React, { useState } from 'react'
import { Message, User } from '../../types/messaging'
import { cn } from '../../lib/utils'
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Reply, 
  Smile,
  Check,
  CheckCheck
} from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  currentUserId: number
  isConsecutive?: boolean
  onEdit?: (message: Message) => void
  onDelete?: (message: Message) => void
  onReply?: (message: Message) => void
  onReact?: (message: Message, emoji: string) => void
  className?: string
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
  isConsecutive = false,
  onEdit,
  onDelete,
  onReply,
  onReact,
  className
}) => {
  const [showActions, setShowActions] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const isOwnMessage = message.senderId === currentUserId
  const isDeleted = message.deletedAt !== null
  const isEdited = message.isEdited

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getReadStatusIcon = () => {
    if (!isOwnMessage) return null
    
    const readByOthers = message.readBy?.filter(read => read.userId !== currentUserId) || []
    
    if (readByOthers.length === 0) {
      return <Check className="w-3 h-3 text-gray-400" aria-label="Đã gửi" />
    } else {
      return <CheckCheck className="w-3 h-3 text-blue-500" aria-label="Đã đọc" />
    }
  }

  const handleActionClick = (action: string) => {
    setShowActions(false)
    
    switch (action) {
      case 'edit':
        onEdit?.(message)
        break
      case 'delete':
        onDelete?.(message)
        break
      case 'reply':
        onReply?.(message)
        break
      case 'react':
        setShowReactions(true)
        break
    }
  }

  const handleReactionClick = (emoji: string) => {
    onReact?.(message, emoji)
    setShowReactions(false)
  }

  const reactions = ['😀', '❤️', '👍', '👎', '😂', '😮', '😢', '😡']

  return (
    <div className={cn("group relative", className)}>
      <div
        className={cn(
          "flex items-end space-x-2 max-w-xs lg:max-w-md",
          isOwnMessage ? "ml-auto flex-row-reverse space-x-reverse" : "mr-auto"
        )}
      >
        {/* Avatar */}
        {!isConsecutive && (
          <div className="flex-shrink-0">
            {message.sender?.avatar ? (
              <img
                src={message.sender.avatar}
                alt={message.sender.firstName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {message.sender?.firstName?.charAt(0) || message.senderDisplayName?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className="flex flex-col">
          {/* Sender name for group chats */}
          {!isConsecutive && !isOwnMessage && (
            <span className="text-xs text-gray-600 mb-1 px-1">
              {message.sender?.firstName} {message.sender?.lastName}
            </span>
          )}

          {/* Message bubble */}
          <div
            className={cn(
              "relative px-4 py-2 rounded-2xl shadow-sm",
              isOwnMessage
                ? "bg-primary-500 text-white"
                : "bg-white border border-gray-200 text-gray-900",
              isConsecutive && !isOwnMessage && "ml-10"
            )}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
          >
            {isDeleted ? (
              <div className="italic text-gray-500">
                Tin nhắn đã bị xóa
              </div>
            ) : (
              <>
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>

                {/* Attachments */}
                {message.attachmentUrls && message.attachmentUrls.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachmentUrls.map((url, index) => (
                      <div key={index} className="rounded-lg overflow-hidden">
                        {message.messageType === 'IMAGE' ? (
                          <img
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(url, '_blank')}
                          />
                        ) : (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <span className="text-sm">📎</span>
                            <span className="text-sm truncate">
                              {url.split('/').pop()}
                            </span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction, index) => (
                      <span
                        key={index}
                        className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full"
                      >
                        {reaction.emoji} {reaction.count}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Message actions */}
            {showActions && !isDeleted && (
              <div className="absolute top-0 right-0 transform translate-x-full -translate-y-2 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-10">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleActionClick('react')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="React"
                  >
                    <Smile className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleActionClick('reply')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Reply"
                  >
                    <Reply className="w-4 h-4 text-gray-600" />
                  </button>
                  {isOwnMessage && (
                    <>
                      <button
                        onClick={() => handleActionClick('edit')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleActionClick('delete')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Reaction picker */}
            {showReactions && (
              <div className="absolute top-0 right-0 transform translate-x-full -translate-y-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20">
                <div className="flex items-center space-x-1">
                  {reactions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(emoji)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message metadata */}
          <div className={cn(
            "flex items-center space-x-1 mt-1 px-1",
            isOwnMessage ? "justify-end" : "justify-start"
          )}>
            <span className="text-xs text-gray-500">
              {formatTime(message.createdAt)}
            </span>
            {isEdited && (
              <span className="text-xs text-gray-500">(đã sửa)</span>
            )}
            {getReadStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  )
}

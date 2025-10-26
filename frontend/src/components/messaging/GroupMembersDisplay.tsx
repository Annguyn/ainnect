import React from 'react'
import { Conversation, ConversationMember } from '../../types/messaging'
import { cn } from '../../utils/cn'

interface GroupMembersDisplayProps {
  conversation: Conversation
  maxVisible?: number
  className?: string
}

export const GroupMembersDisplay: React.FC<GroupMembersDisplayProps> = ({
  conversation,
  maxVisible = 3,
  className
}) => {
  if (conversation.type !== 'group' || !conversation.members || conversation.members.length === 0) {
    return null
  }

  const visibleMembers = conversation.members.slice(0, maxVisible)
  const remainingCount = conversation.members.length - maxVisible

  return (
    <div className={cn("flex items-center", className)}>
      {/* Member avatars */}
      <div className="flex -space-x-2">
        {visibleMembers.map((member, index) => (
          <div key={member.userId} className="relative">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.displayName || member.username}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {(member.displayName || member.username).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Online indicator */}
            {member.isOnline && (
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Remaining count */}
      {remainingCount > 0 && (
        <div className="ml-2 text-xs text-gray-500">
          +{remainingCount} khác
        </div>
      )}

      {/* Total member count */}
      <div className="ml-2 text-xs text-gray-400">
        {conversation.memberCount} thành viên
      </div>
    </div>
  )
}

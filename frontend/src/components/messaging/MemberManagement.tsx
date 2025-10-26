import React, { useState, useEffect } from 'react'
import { User, Conversation, ConversationMember, ConversationMemberRole } from '../../types/messaging'
import { messagingService } from '../../services/messagingService'
import { cn } from '../../lib/utils'
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Crown, 
  MoreVertical,
  Search,
  X
} from 'lucide-react'

interface MemberManagementProps {
  conversation: Conversation
  currentUserId: number
  onClose: () => void
  className?: string
}

export const MemberManagement: React.FC<MemberManagementProps> = ({
  conversation,
  currentUserId,
  onClose,
  className
}) => {
  const [members, setMembers] = useState<ConversationMember[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  useEffect(() => {
    loadMembers()
    loadAvailableUsers()
  }, [conversation.id])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const response = await messagingService.getConversationMembers(conversation.id, {
        page: 0,
        size: 100
      })
      setMembers(response.members)
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableUsers = async () => {
    try {
      // TODO: Replace with actual user service
      const mockUsers: User[] = [
        { id: 6, username: 'charlie_davis', email: 'charlie@example.com', firstName: 'Charlie', lastName: 'Davis', avatar: '', isOnline: true },
        { id: 7, username: 'diana_miller', email: 'diana@example.com', firstName: 'Diana', lastName: 'Miller', avatar: '', isOnline: false },
        { id: 8, username: 'eve_johnson', email: 'eve@example.com', firstName: 'Eve', lastName: 'Johnson', avatar: '', isOnline: true },
      ]
      setAvailableUsers(mockUsers)
    } catch (error) {
      console.error('Failed to load available users:', error)
    }
  }

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return

    try {
      await messagingService.addMembersToConversation(conversation.id, {
        conversationId: conversation.id,
        userIds: selectedUsers.map(user => user.id)
      })
      
      setMembers(prev => [...prev, ...selectedUsers.map(user => ({
        userId: user.id,
        username: user.username,
        displayName: user.displayName || `${user.firstName} ${user.lastName}`,
        avatarUrl: user.avatarUrl || user.avatar,
        role: 'MEMBER' as ConversationMemberRole,
        joinedAt: new Date().toISOString(),
        lastReadMessageId: undefined,
        isOnline: user.isOnline || false,
        lastSeenAt: undefined
      }))])
      setSelectedUsers([])
      setShowAddMembers(false)
    } catch (error) {
      console.error('Failed to add members:', error)
    }
  }

  const handleRemoveMember = async (userId: number) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await messagingService.removeMemberFromConversation(conversation.id, userId)
        setMembers(prev => prev.filter(member => member.userId !== userId))
      } catch (error) {
        console.error('Failed to remove member:', error)
      }
    }
  }

  const handleLeaveConversation = async () => {
    if (confirm('Are you sure you want to leave this conversation?')) {
      try {
        await messagingService.leaveConversation(conversation.id)
        onClose()
      } catch (error) {
        console.error('Failed to leave conversation:', error)
      }
    }
  }

  const filteredAvailableUsers = availableUsers.filter(user => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    )
  }).filter(user => !members.some(member => member.userId === user.id))

  const isCurrentUser = (userId: number) => userId === currentUserId
  const isAdmin = (userId: number) => {
    // TODO: Implement admin check based on your backend logic
    return false
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-lg w-full max-w-md", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Members ({members.length})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {!showAddMembers ? (
          <>
            {/* Add Members Button */}
            <button
              onClick={() => setShowAddMembers(true)}
              className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors mb-4"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Members</span>
            </button>

            {/* Members List */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No members found</p>
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {member.displayName.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {member.displayName}
                          </h3>
                          {isAdmin(member.userId) && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                          {member.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">@{member.username}</p>
                      </div>
                    </div>

                    {!isCurrentUser(member.userId) && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Leave Conversation Button */}
            <button
              onClick={handleLeaveConversation}
              className="w-full mt-6 p-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Leave Conversation
            </button>
          </>
        ) : (
          <>
            {/* Add Members Interface */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Add Members</h3>
                <button
                  onClick={() => setShowAddMembers(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredAvailableUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No users found</p>
                  </div>
                ) : (
                  filteredAvailableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        const isSelected = selectedUsers.some(u => u.id === user.id)
                        if (isSelected) {
                          setSelectedUsers(prev => prev.filter(u => u.id !== user.id))
                        } else {
                          setSelectedUsers(prev => [...prev, user])
                        }
                      }}
                      className={cn(
                        "w-full p-3 text-left rounded-lg transition-colors",
                        selectedUsers.some(u => u.id === user.id)
                          ? "bg-primary-50 border border-primary-200"
                          : "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.firstName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.firstName.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            {user.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                        </div>

                        {selectedUsers.some(u => u.id === user.id) && (
                          <div className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center">
                            <span className="text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleAddMembers}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Add Members
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

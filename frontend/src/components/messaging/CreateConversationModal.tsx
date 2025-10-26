import React, { useState, useEffect } from 'react'
import { ConversationType } from '../../types/messaging'
import { User } from '../../types'
import { cn } from '../../lib/utils'
import { X, Search, Users, User as UserIcon, Check } from 'lucide-react'

interface CreateConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateConversation: (type: ConversationType, title: string, participantIds: number[]) => void
  currentUserId: number
  friends?: User[]
  loadingFriends?: boolean
  className?: string
}

export const CreateConversationModal: React.FC<CreateConversationModalProps> = ({
  isOpen,
  onClose,
  onCreateConversation,
  currentUserId,
  friends = [],
  loadingFriends = false,
  className
}) => {
  const [step, setStep] = useState<'type' | 'participants' | 'details'>('type')
  const [conversationType, setConversationType] = useState<ConversationType>(ConversationType.DIRECT)
  const [title, setTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  useEffect(() => {
    if (friends && friends.length > 0) {
      console.log('Friends prop changed, reloading users:', friends)
      loadUsers()
    }
  }, [friends])

  useEffect(() => {
    if (conversationType === ConversationType.DIRECT) {
      setStep('participants')
    } else {
      setStep('details')
    }
  }, [conversationType])

  const loadUsers = async () => {
    try {
      setLoading(true)
      console.log('CreateConversationModal - Friends prop:', friends)
      console.log('CreateConversationModal - Loading friends:', loadingFriends)
      
      // Use friends prop if available, otherwise fallback to mock data
      if (friends && friends.length > 0) {
        console.log('Using real friends data:', friends)
        setAvailableUsers(friends.filter(user => user.id !== currentUserId))
      } else {
        console.log('Using mock data fallback')
        // Fallback mock data
        const mockUsers: User[] = [
          { id: 2, username: 'john_doe', email: 'john@example.com', displayName: 'John Doe', firstName: 'John', lastName: 'Doe', avatar: '', isActive: true },
          { id: 3, username: 'jane_smith', email: 'jane@example.com', displayName: 'Jane Smith', firstName: 'Jane', lastName: 'Smith', avatar: '', isActive: true },
          { id: 4, username: 'bob_wilson', email: 'bob@example.com', displayName: 'Bob Wilson', firstName: 'Bob', lastName: 'Wilson', avatar: '', isActive: true },
          { id: 5, username: 'alice_brown', email: 'alice@example.com', displayName: 'Alice Brown', firstName: 'Alice', lastName: 'Brown', avatar: '', isActive: true },
        ]
        setAvailableUsers(mockUsers.filter(user => user.id !== currentUserId))
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = availableUsers.filter(user => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.displayName.toLowerCase().includes(query) ||
      (user.firstName && user.firstName.toLowerCase().includes(query)) ||
      (user.lastName && user.lastName.toLowerCase().includes(query)) ||
      user.username.toLowerCase().includes(query)
    )
  })

  const handleUserSelect = (user: User) => {
    if (conversationType === ConversationType.DIRECT) {
      setSelectedUsers([user])
      handleCreateConversation()
    } else {
      setSelectedUsers(prev => {
        const isSelected = prev.some(u => u.id === user.id)
        if (isSelected) {
          return prev.filter(u => u.id !== user.id)
        } else {
          return [...prev, user]
        }
      })
    }
  }

  const handleCreateConversation = () => {
    if (selectedUsers.length === 0) return
    
    const participantIds = selectedUsers.map(user => user.id)
    onCreateConversation(conversationType, title, participantIds)
    handleClose()
  }

  const handleClose = () => {
    setStep('type')
    setConversationType(ConversationType.DIRECT)
    setTitle('')
    setSearchQuery('')
    setSelectedUsers([])
    onClose()
  }

  const canProceed = () => {
    if (conversationType === ConversationType.DIRECT) {
      return selectedUsers.length === 1
    } else {
      return selectedUsers.length > 0 && title.trim().length > 0
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={cn("bg-white rounded-lg shadow-xl w-full max-w-md", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {step === 'type' && 'Cuộc trò chuyện mới'}
            {step === 'participants' && 'Chọn liên hệ'}
            {step === 'details' && 'Chi tiết nhóm'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 'type' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Choose the type of conversation you want to create</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setConversationType(ConversationType.DIRECT)}
                  className={cn(
                    "w-full p-4 border rounded-lg text-left transition-colors",
                    conversationType === ConversationType.DIRECT
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <UserIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Tin nhắn riêng</h3>
                      <p className="text-sm text-gray-600">Bắt đầu cuộc trò chuyện riêng với một người</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setConversationType(ConversationType.GROUP)}
                  className={cn(
                    "w-full p-4 border rounded-lg text-left transition-colors",
                    conversationType === ConversationType.GROUP
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Nhóm trò chuyện</h3>
                      <p className="text-sm text-gray-600">Tạo cuộc trò chuyện nhóm với nhiều người</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'participants' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm liên hệ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Không tìm thấy liên hệ nào</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.displayName.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">
                              {user.displayName}
                            </h3>
                            {user.isActive && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tên nhóm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thành viên đã chọn ({selectedUsers.length})
                </label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {selectedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {user.displayName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {user.displayName}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Add more members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-32 overflow-y-auto space-y-2">
                {filteredUsers
                  .filter(user => !selectedUsers.some(selected => selected.id === user.id))
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {user.displayName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {user.displayName}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Hủy
          </button>
          
          {step === 'details' && (
            <button
              onClick={handleCreateConversation}
              disabled={!canProceed()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tạo nhóm
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

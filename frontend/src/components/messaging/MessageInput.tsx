import React, { useState, useRef, useCallback } from 'react'
import { MessageType } from '../../types/messaging'
import { cn } from '../../lib/utils'
import { 
  Send, 
  Paperclip, 
  Image, 
  File, 
  Smile,
  X,
  Mic,
  MicOff
} from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string, messageType: MessageType, attachments: string[], replyToMessageId?: number, files?: File[]) => void
  onStartTyping?: () => void
  onStopTyping?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  placeholder = "Type a message...",
  disabled = false,
  className
}) => {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [replyTo, setReplyTo] = useState<{ id: number; preview: string } | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)

    // Typing indicators
    if (value.trim() && onStartTyping) {
      onStartTyping()
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        if (onStopTyping) {
          onStopTyping()
        }
      }, 2000) // Tăng thời gian lên 2 giây
    } else if (!value.trim() && onStopTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      onStopTyping()
    }
  }

  const handleSendMessage = () => {
    if (!message.trim() && attachments.length === 0) return

    const hasMedia = mediaFiles.length > 0
    const messageType = hasMedia ? MessageType.IMAGE : MessageType.TEXT
    onSendMessage(message.trim(), messageType, attachments, replyTo?.id, mediaFiles)

    setMessage('')
    setAttachments([])
    setMediaFiles([])
    setReplyTo(null)

    if (onStopTyping) {
      onStopTyping()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments = files.map(file => URL.createObjectURL(file))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const media = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
    const newPreviews = media.map(file => URL.createObjectURL(file))
    if (media.length > 0) {
      setMediaFiles(prev => [...prev, ...media])
      setAttachments(prev => [...prev, ...newPreviews])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement voice recording functionality
  }

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '😢', '😮', '😡', '👏']

  // Cleanup typing timeout on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Wire reply events from parent
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: number; preview: string }
      setReplyTo(detail)
    }
    window.addEventListener('setReplyTo', handler as EventListener)
    return () => window.removeEventListener('setReplyTo', handler as EventListener)
  }, [])

  return (
    <div className={cn("bg-white border-t border-gray-200 p-3 sm:p-4", className)}>
      {replyTo && (
        <div className="mb-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">Đang trả lời</div>
            <div className="text-sm text-gray-700 line-clamp-2">{replyTo.preview}</div>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 p-1"
            onClick={() => setReplyTo(null)}
            title="Hủy trả lời"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative">
                {mediaFiles[index] && mediaFiles[index].type.startsWith('video/') ? (
                  <video
                    src={attachment}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    muted
                  />
                ) : (
                  <img
                    src={attachment}
                    alt={`Attachment ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-2">
        {/* Attachment Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add image"
          >
            <Image className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add file"
          >
            <File className="w-5 h-5" />
          </button>

          <button
            onClick={toggleRecording}
            disabled={disabled}
            className={cn(
              "p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              isRecording
                ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            )}
            title={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder || "Nhập tin nhắn..."}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
              <div className="grid grid-cols-6 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={disabled || (!message.trim() && attachments.length === 0)}
            className="px-3 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  )
}

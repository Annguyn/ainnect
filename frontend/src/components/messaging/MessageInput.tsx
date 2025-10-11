import React, { useState, useRef, useCallback } from 'react'
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
  onSendMessage: (content: string, messageType: 'text' | 'image' | 'file', attachments: string[]) => void
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
      }, 1000)
    } else if (!value.trim() && onStopTyping) {
      onStopTyping()
    }
  }

  const handleSendMessage = () => {
    if (!message.trim() && attachments.length === 0) return

    const messageType = attachments.length > 0 ? 'image' : 'text'
    onSendMessage(message.trim(), messageType, attachments)
    
    setMessage('')
    setAttachments([])
    
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments = files.map(file => URL.createObjectURL(file))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments = files.map(file => URL.createObjectURL(file))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
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

  return (
    <div className={cn("bg-white border-t border-gray-200 p-4", className)}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative">
                <img
                  src={attachment}
                  alt={`Attachment ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
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
            title={isRecording ? "Stop recording" : "Start recording"}
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
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Search, Minus } from 'lucide-react';
import { Avatar } from './Avatar';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useMessaging } from '../hooks/useMessaging';
import { useAuth } from '../hooks/useAuth';
import { Conversation, ConversationType } from '../types/messaging';
import { debugLogger } from '../utils/debugLogger';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const FloatingChatBubble: React.FC = () => {
  const { user } = useAuth();
  const { conversations, sendMessage, markAsRead } = useMessaging();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom();
    }
  }, [messages, selectedConversation]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsMinimized(false);
    
    // Mark as read
    if (conversation.unreadCount && conversation.unreadCount > 0) {
      await markAsRead(conversation.id);
    }
    
    // Load messages for this conversation
    // TODO: Implement actual message loading
    debugLogger.log('FloatingChatBubble', 'Selected conversation', { conversationId: conversation.id });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await sendMessage(selectedConversation.id, messageText);
      setMessageText('');
      
      // Add message to local state
      const newMessage = {
        id: Date.now(),
        text: messageText,
        senderId: user?.id,
        senderName: user?.username,
        timestamp: new Date().toISOString(),
        isMine: true
      };
      
      setMessages([...messages, newMessage]);
      scrollToBottom();
    } catch (error) {
      debugLogger.log('FloatingChatBubble', 'Failed to send message', { error });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationName = (conv: Conversation) => {
    if (conv.type === ConversationType.DIRECT) {
      return conv.otherParticipantDisplayName || conv.otherParticipantUsername || 'Unknown';
    }
    return conv.title || 'Nhóm không tên';
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type === ConversationType.DIRECT) {
      return conv.otherParticipantAvatarUrl;
    }
    return conv.avatar;
  };

  const filteredConversations = conversations.filter(conv =>
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleToggle}
          className="relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Mở chat"
        >
          <MessageCircle className="w-6 h-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">
                  {selectedConversation ? getConversationName(selectedConversation) : 'Tin nhắn'}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {selectedConversation && (
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Quay lại"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleMinimize}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  aria-label={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <>
              {!selectedConversation ? (
                // Conversation List
                <div className="h-96 flex flex-col">
                  {/* Search */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 text-sm"
                      />
                    </div>
                  </div>

                  {/* Conversations */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {filteredConversations.map((conversation) => {
                          const displayName = getConversationName(conversation);
                          const avatarUrl = getConversationAvatar(conversation);
                          const lastMessageText = conversation.lastMessage?.content || 'Chưa có tin nhắn';
                          const isOnline = conversation.type === ConversationType.DIRECT && conversation.otherParticipantIsOnline;
                          
                          return (
                            <button
                              key={conversation.id}
                              onClick={() => handleSelectConversation(conversation)}
                              className="w-full p-3 hover:bg-gray-50 transition-colors text-left flex items-center space-x-3"
                            >
                              <div className="relative flex-shrink-0">
                                <Avatar
                                  user={{
                                    avatarUrl,
                                    displayName,
                                    userId: conversation.type === ConversationType.DIRECT ? conversation.otherParticipantId : conversation.id
                                  }}
                                  size="md"
                                />
                                {isOnline && (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                                    {displayName}
                                  </h4>
                                  {conversation.lastMessage?.createdAt && (
                                    <span className="text-xs text-gray-500">
                                      {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                                        locale: vi,
                                        addSuffix: true
                                      })}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-gray-600 truncate">
                                    {lastMessageText}
                                  </p>
                                  {conversation.unreadCount > 0 && (
                                    <span className="ml-2 bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                      {conversation.unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                        <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm text-center">
                          {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Chat View
                <div className="h-96 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              message.isMine
                                ? 'bg-blue-500 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                            }`}
                          >
                            <p className="text-sm break-words">{message.text}</p>
                            <span
                              className={`text-xs mt-1 block ${
                                message.isMine ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {formatDistanceToNow(new Date(message.timestamp), {
                                locale: vi,
                                addSuffix: true
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p className="text-sm">Bắt đầu cuộc trò chuyện</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 bg-white border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 text-sm"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        size="sm"
                        className="px-3"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

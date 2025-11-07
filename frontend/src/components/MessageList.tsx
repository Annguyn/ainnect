import React from 'react';
import { Message } from '../types/messaging';
import { cn } from '../utils/cn';

interface MessageListProps {
  messages: Message[];
  onMessageClick?: (message: Message) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onMessageClick }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'p-4 rounded-lg shadow-md cursor-pointer',
            message.isRead ? 'bg-gray-100' : 'bg-blue-50'
          )}
          onClick={() => onMessageClick?.(message)}
        >
          <div className="flex items-center space-x-4">
            {message.senderAvatarUrl && (
              <img
                src={message.senderAvatarUrl}
                alt={message.senderDisplayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <h4 className="font-semibold text-gray-800">{message.senderDisplayName}</h4>
              <p className="text-sm text-gray-600">{message.content}</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500 mt-2">
            {new Date(message.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
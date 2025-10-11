import React from 'react';
import { Button } from './ui';

interface EmptyStateProps {
  type: 'loading' | 'error' | 'empty' | 'no-posts' | 'no-friends' | 'no-followers' | 'no-following' | 'no-blocked' | 'no-reports';
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  buttonText,
  onButtonClick,
  className = ''
}) => {
  const getContent = () => {
    switch (type) {
      case 'loading':
        return {
          icon: (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          ),
          title: title || 'Đang tải bài viết...',
          description: description || '',
          showButton: false
        };

      case 'error':
        return {
          icon: (
            <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: title || 'Có lỗi xảy ra',
          description: description || 'Vui lòng thử lại sau',
          showButton: true,
          buttonText: buttonText || 'Thử lại',
          buttonVariant: 'outline' as const
        };

      case 'empty':
        return {
          icon: (
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          ),
          title: title || 'Chưa có bài viết nào',
          description: description || 'Hãy bắt đầu chia sẻ những khoảnh khắc đáng nhớ của bạn!',
          showButton: true,
          buttonText: buttonText || 'Tạo bài viết đầu tiên',
          buttonVariant: 'primary' as const
        };

      case 'no-posts':
        return {
          icon: (
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          ),
          title: title || 'Chưa có bài viết nào',
          description: description || 'Bạn chưa đăng bài viết nào. Hãy chia sẻ những suy nghĩ và khoảnh khắc đặc biệt của mình!',
          showButton: true,
          buttonText: buttonText || 'Tạo bài viết đầu tiên',
          buttonVariant: 'primary' as const
        };

      case 'no-friends':
        return {
          icon: (
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          ),
          title: title || 'Chưa có bạn bè',
          description: description || 'Bạn chưa có bạn bè nào. Hãy kết bạn với những người khác để mở rộng mạng lưới của mình!',
          showButton: false
        };

      case 'no-followers':
        return {
          icon: (
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          ),
          title: title || 'Chưa có người theo dõi',
          description: description || 'Bạn chưa có người theo dõi nào. Hãy chia sẻ nội dung thú vị để thu hút người theo dõi!',
          showButton: false
        };

      case 'no-following':
        return {
          icon: (
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          ),
          title: title || 'Chưa theo dõi ai',
          description: description || 'Bạn chưa theo dõi ai. Hãy tìm kiếm và theo dõi những người bạn quan tâm!',
          showButton: false
        };

      case 'no-blocked':
        return {
          icon: (
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
          ),
          title: title || 'Chưa chặn ai',
          description: description || 'Bạn chưa chặn người dùng nào.',
          showButton: false
        };

      case 'no-reports':
        return {
          icon: (
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          ),
          title: title || 'Chưa có báo cáo nào',
          description: description || 'Bạn chưa gửi báo cáo nào.',
          showButton: false
        };

      default:
        return {
          icon: null,
          title: title || '',
          description: description || '',
          showButton: false
        };
    }
  };

  const content = getContent();
  const containerClass = type === 'no-posts' 
    ? "bg-white rounded-xl shadow-lg border border-gray-100 p-16 text-center"
    : "bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center";

  return (
    <div className={`${containerClass} ${className}`}>
      {content.icon}
      
      {content.title && (
        <h3 className={`font-bold text-gray-900 mb-3 ${
          type === 'no-posts' ? 'text-2xl' : 
          type === 'error' ? 'text-red-600' : 
          'text-lg'
        }`}>
          {content.title}
        </h3>
      )}
      
      {content.description && (
        <p className={`text-gray-600 mb-4 ${
          type === 'no-posts' ? 'max-w-md mx-auto' : ''
        }`}>
          {content.description}
        </p>
      )}
      
      {content.showButton && onButtonClick && (
        <Button 
          onClick={onButtonClick} 
          variant={content.buttonVariant || 'primary'}
          size="sm"
          className={type === 'no-posts' ? 'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white' : ''}
        >
          {content.buttonText}
        </Button>
      )}
    </div>
  );
};

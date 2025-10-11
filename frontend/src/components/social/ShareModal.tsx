import React, { useState } from 'react';
import { X, Share2, MessageSquare, Send } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (message?: string) => Promise<void>;
  postId: number;
  postContent?: string;
  postAuthor?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onShare,
  postId,
  postContent,
  postAuthor
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await onShare(message.trim() || undefined);
      onClose();
      setMessage('');
    } catch (error) {
      console.error('Share submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Chia sẻ bài viết</h2>
              <p className="text-sm text-gray-600">
                {postAuthor ? `Bài viết của ${postAuthor}` : `Bài viết #${postId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Original Post Preview */}
          {postContent && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {postAuthor?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {postAuthor || 'Người dùng'}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {postContent}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thêm bình luận (tùy chọn)
              </label>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Viết bình luận về bài viết này..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {message.length}/500
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || message.length > 500}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang chia sẻ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Chia sẻ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

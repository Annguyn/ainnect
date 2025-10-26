import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Avatar } from '../Avatar';
import { Image, X, Upload } from 'lucide-react';

interface CreateGroupPostProps {
  groupId: number;
  groupName: string;
  onCreatePost: (content: string, mediaFiles?: File[]) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CreateGroupPost: React.FC<CreateGroupPostProps> = ({
  groupId,
  groupName,
  onCreatePost,
  isLoading = false,
  disabled = false,
  className = ''
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleMediaUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    const incoming = Array.from(files);
    const remainingSlots = Math.max(0, 4 - selectedFiles.length);
    const allowed = incoming.slice(0, remainingSlots);
    
    if (allowed.length < incoming.length) {
      setErrorMsg('Chỉ cho phép tối đa 4 ảnh. Ảnh thứ 5 sẽ bị chặn.');
    }
    
    if (allowed.length === 0) return;
    
    setSelectedFiles((prev) => [...prev, ...allowed]);
    const newPreviewUrls = allowed.map(file => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && selectedFiles.length === 0) {
      setErrorMsg('Vui lòng thêm nội dung hoặc ảnh trước khi đăng.');
      return;
    }

    if (content.length > 5000) {
      setErrorMsg('Nội dung quá dài. Vui lòng giới hạn dưới 5000 ký tự.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    
    try {
      await onCreatePost(content.trim(), selectedFiles);
      
      // Reset form
      setContent('');
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      setIsExpanded(false);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      setErrorMsg(error.message || 'Không thể tạo bài viết. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaClick = () => {
    if (!disabled) {
      setIsExpanded(true);
    }
  };

  const handleCancel = () => {
    setContent('');
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setIsExpanded(false);
    setErrorMsg(null);
  };

  if (!user) return null;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar
            user={user}
            size="md"
          />
          <div className="flex-1">
            {!isExpanded ? (
              <button
                onClick={handleTextareaClick}
                disabled={disabled}
                className={`w-full text-left px-4 py-3 bg-gray-100 rounded-full transition-colors group ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200'}`}
              >
                <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  {disabled ? 'Bạn cần tham gia nhóm để đăng bài...' : `Chia sẻ điều gì đó với ${groupName}...`}
                </span>
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Textarea */}
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={disabled ? `Bạn cần tham gia nhóm để đăng bài...` : `Chia sẻ điều gì đó với ${groupName}...`}
                    className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px] text-gray-900 placeholder-gray-500 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    disabled={disabled}
                    autoFocus={!disabled}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <span className={`text-xs ${content.length > 4500 ? 'text-red-500' : 'text-gray-400'}`}>
                      {content.length}/5000
                    </span>
                  </div>
                </div>

                {/* Media Preview */}
                {previewUrls.length > 0 && (
                  <div className="relative p-3 bg-gray-50 rounded-xl">
                    <div className={`grid ${
                      previewUrls.length === 1 ? 'grid-cols-1' : 
                      previewUrls.length === 2 ? 'grid-cols-2' : 
                      'grid-cols-2'
                    } gap-2`}>
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full aspect-video object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {errorMsg && (
                  <div className="px-3 py-2 bg-red-50 text-sm text-red-600 rounded-lg border border-red-200">
                    {errorMsg}
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                      <Image className="w-5 h-5" />
                      <span className="text-sm font-medium">Ảnh/Video</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        multiple
                        onChange={(e) => handleMediaUpload(e.target.files)}
                      />
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isSubmitting || disabled}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={disabled || (!content.trim() && selectedFiles.length === 0) || isSubmitting}
                      className="min-w-[80px]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Đang đăng...</span>
                        </div>
                      ) : (
                        'Đăng'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Quick Actions (when not expanded) */}
        {!isExpanded && (
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
            <label className="flex items-center justify-center p-2 space-x-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              <Image className="w-5 h-5" />
              <span className="font-medium text-sm">Ảnh/Video</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  handleMediaUpload(e.target.files);
                  handleTextareaClick();
                }}
              />
            </label>
            <button
              type="button"
              onClick={handleTextareaClick}
              className="flex items-center justify-center p-2 space-x-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium text-sm">Đăng bài</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

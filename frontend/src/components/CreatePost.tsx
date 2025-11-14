import React, { useState } from 'react';
import { privacyMediaService } from '../services/privacyMediaService';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui';
import { Avatar } from './Avatar';

interface CreatePostProps {
  // Change to return the created post when available. If the backend can't finish
  // processing immediately the function may resolve to undefined/null — that's fine.
  onCreatePost: (content: string, visibility?: 'public_' | 'friends' | 'private_' | 'group', mediaFiles?: File[]) => Promise<any | void>;
  isLoading?: boolean;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onCreatePost, isLoading }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public_' | 'friends' | 'private_' | 'group'>('public_');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleMediaUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    
    const incoming = Array.from(files);
    const remainingSlots = Math.max(0, 6 - selectedFiles.length);
    
    // Check if trying to upload more than 6 images total
    if (selectedFiles.length >= 6) {
      setErrorMsg('⚠️ Chỉ cho phép tối đa 6 ảnh/video. Vui lòng xóa bớt để thêm mới.');
      return;
    }
    
    if (incoming.length > remainingSlots) {
      setErrorMsg(`⚠️ Chỉ có thể thêm ${remainingSlots} ảnh/video nữa (tối đa 6 ảnh/video).`);
    }
    
    const allowed = incoming.slice(0, remainingSlots);
    
    // Validate file size (max 10MB per file)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const oversizedFiles = allowed.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      setErrorMsg(`⚠️ File quá lớn: ${fileNames}. Dung lượng tối đa cho mỗi file là 10MB.`);
      return;
    }
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    const invalidFiles = allowed.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setErrorMsg('⚠️ Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP) hoặc video (MP4, WebM).');
      return;
    }
    
    if (allowed.length === 0) return;
    
    setSelectedFiles((prev) => [...prev, ...allowed]);
    const newPreviewUrls = allowed.map(file => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]); // Clean up memory
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation: Content cannot be empty (unless has media)
    if (!content.trim() && selectedFiles.length === 0) {
      setErrorMsg('⚠️ Vui lòng nhập nội dung hoặc chọn ảnh/video để đăng bài.');
      return;
    }

    // Validation: Content length (max 5000 characters)
    if (content.length > 5000) {
      setErrorMsg(`⚠️ Nội dung quá dài (${content.length}/5000 ký tự). Vui lòng rút ngắn nội dung.`);
      return;
    }

    // Validation: Max 6 images
    if (selectedFiles.length > 6) {
      setErrorMsg('⚠️ Chỉ cho phép tối đa 6 ảnh/video. Vui lòng xóa bớt.');
      return;
    }

    // Validation: Total file size (max 10MB per file already checked in handleMediaUpload)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setErrorMsg(`⚠️ Một số file quá lớn (> 10MB). Vui lòng chọn file nhỏ hơn.`);
      return;
    }

    setIsSubmitting(true);

    // Safety check: user should exist at this point (early return above)
    if (!user) {
      console.error('User is null in handleSubmit');
      setIsSubmitting(false);
      return;
    }

    try {
      // Call API to create post - backend will handle media async and notify via WebSocket
      const created = await onCreatePost(content.trim(), visibility, selectedFiles);

      // Show success message
      setErrorMsg(null);
      
      // Show success notification based on whether has media
      const hasMedia = selectedFiles.length > 0;
      showSuccessNotification(hasMedia);
      
      // Reset UI immediately after successful API call
      setContent('');
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      setIsExpanded(false);

      // Log appropriate message
      if (hasMedia) {
        console.log('✅ Post submitted with media. Backend is processing asynchronously. Waiting for response:', created);
      } else {
        console.log('✅ Post created successfully (text only):', created);
      }
    } catch (error: any) {
      console.error('❌ Failed to create post:', error);
      
      // Handle specific error messages from backend
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể đăng bài viết';
      setErrorMsg(`❌ ${errorMessage}. Vui lòng thử lại.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccessNotification = (hasMedia: boolean) => {
    // Create temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in';
    
    const message = hasMedia 
      ? '✅ Đang xử lý bài viết... Vui lòng đợi trong giây lát!'
      : '🎉 Đăng bài thành công!';
    
    successDiv.innerHTML = `
      ${hasMedia ? `
        <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ` : `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `}
      <div class="flex flex-col">
        <span class="font-medium">${message}</span>
        ${hasMedia ? '<span class="text-xs opacity-90">Backend đang xử lý ảnh/video của bạn</span>' : ''}
      </div>
    `;
    document.body.appendChild(successDiv);
    
    // Remove after duration (longer if has media)
    const duration = hasMedia ? 5000 : 3000;
    setTimeout(() => {
      successDiv.classList.add('animate-fade-out');
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 300);
    }, duration);
  };

  const handleTextareaClick = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setContent('');
    setSelectedFiles([]);
    // Clean up preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setIsExpanded(false);
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 max-w-2xl mx-auto">
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar
            user={user}
            size="lg"
          />
          <div className="flex-1">
            {!isExpanded ? (
              <button
                onClick={handleTextareaClick}
                className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors group"
              >
                <span className="text-sm text-gray-500 group-hover:text-gray-700">
                  Bạn đang nghĩ gì, {user.displayName?.split(' ').pop()}?
                </span>
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Bạn đang nghĩ gì, ${user.displayName?.split(' ').pop()}?`}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px]"
                  autoFocus
                />
                <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                  <span className={`text-xs font-medium ${
                    content.length > 5000 ? 'text-red-500' : 
                    content.length > 4500 ? 'text-yellow-500' : 
                    'text-gray-400'
                  }`}>
                    {content.length}/5000
                  </span>
                </div>
              </div>
              
              {/* Visibility and Options Bar */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'public_' | 'friends' | 'private_' | 'group')}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="public_">🌍 Công khai</option>
                  <option value="friends">👥 Bạn bè</option>
                  <option value="private_">🔒 Chỉ mình tôi</option>
                  <option value="group">👥 Nhóm</option>
                </select>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                    title="Thêm ảnh/video"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                    title="Thêm cảm xúc"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M12 10h.01M15 10h.01M19 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Media Preview Grid */}
              {previewUrls.length > 0 && (
                <div className="relative p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-medium text-gray-600">
                      {selectedFiles.length}/6 ảnh/video
                    </span>
                    <span className="text-xs text-gray-500">
                      {(selectedFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className={`grid ${
                    previewUrls.length === 1 ? 'grid-cols-1' : 
                    previewUrls.length <= 4 ? 'grid-cols-2' : 
                    'grid-cols-3'
                  } gap-2`}>
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Selected media ${index + 1}`}
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                          title="Xóa ảnh"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                          {(selectedFiles[index].size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errorMsg && (
                <div className="px-3 py-2 bg-red-50 text-sm text-red-600 rounded-lg">
                  {errorMsg}
                </div>
              )}
              
              {/* Action Bar */}
              <div className="flex flex-col space-y-3">
                {/* Media Upload Bar */}
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <span className="mr-4 text-sm font-medium text-gray-600">Thêm vào bài viết</span>
                  <div className="flex space-x-2">
                    <label className="p-2.5 flex items-center space-x-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors" title="Thêm ảnh/video">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Ảnh/Video</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        multiple
                        onChange={(e) => handleMediaUpload(e.target.files)}
                      />
                    </label>
                    <button
                      type="button"
                      className="p-2.5 flex items-center space-x-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Thêm cảm xúc/hoạt động"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Cảm xúc</span>
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={(!content.trim() && selectedFiles.length === 0) || isSubmitting || content.length > 5000}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
                      ${(!content.trim() && selectedFiles.length === 0) || isSubmitting || content.length > 5000
                        ? 'bg-primary-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700'
                      }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Đang đăng...</span>
                      </span>
                    ) : (
                      'Đăng'
                    )}
                  </button>
                </div>
              </div>
              </form>
            )}
          
            {!isExpanded && (
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
              <label className="flex items-center justify-center p-2 space-x-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm">Ảnh/Video</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => {
                    handleMediaUpload(e.target.files);
                    handleTextareaClick(); // Auto-expand when files are selected
                  }}
                />
              </label>
              <button
                type="button"
                onClick={handleTextareaClick}
                className="flex items-center justify-center p-2 space-x-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm">Cảm xúc</span>
              </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

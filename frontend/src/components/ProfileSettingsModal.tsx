import React, { useState, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Button, Input } from './ui';
import { Avatar } from './Avatar';
import { userService, UpdateProfileRequest } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { debugLogger } from '../utils/debugLogger';

interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  birthday?: string | null;
  gender?: string | null;
}

interface ProfileSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  user?: User | null;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isVisible,
  onClose,
  user
}) => {
  const { updateProfile: updateAuthProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ displayName?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    birthday: user?.birthday || '',
    gender: user?.gender || ''
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      debugLogger.log('ProfileSettings', 'File selected for upload', { 
        fileName: file.name, 
        fileSize: file.size,
        fileType: file.type 
      });

      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    debugLogger.logFormSubmit('Profile Settings Update', { 
      ...formData, 
      hasNewAvatar: !!selectedFile 
    });
    
    setIsLoading(true);
    setUploadStatus(null);
    setFieldErrors(null);

    const trimmedName = (formData.displayName || '').trim();
    if (trimmedName.length === 0) {
      setFieldErrors({ displayName: 'Tên người dùng không hợp lệ, không được để trống' });
      setUploadStatus('Lỗi: Tên người dùng không được để trống');
      setIsLoading(false);
      return;
    }
    if (trimmedName.length > 65) {
      setFieldErrors({ displayName: 'Tên người dùng không hợp lệ, quá dài (tối đa 65 ký tự)' });
      setUploadStatus('Lỗi: Tên người dùng vượt quá 65 ký tự');
      setIsLoading(false);
      return;
    }
    try {
      if (selectedFile) {
        setUploadStatus('Đang tải lên ảnh đại diện...');
        debugLogger.log('ProfileSettings', 'Uploading avatar', { 
          fileName: selectedFile.name,
          fileSize: selectedFile.size 
        });
        
        const uploadResponse = await userService.uploadAvatar(selectedFile);
        
        if (uploadResponse.result === 'SUCCESS') {
          debugLogger.log('ProfileSettings', 'Avatar uploaded successfully', {
            newAvatarUrl: uploadResponse.data
          });
          setUploadStatus('Ảnh đại diện đã được cập nhật!');
          
          // Update auth profile with new avatar URL
          if (uploadResponse.data) {
            await updateAuthProfile(uploadResponse.data);
          }
        } else {
          throw new Error(uploadResponse.message || 'Failed to upload avatar');
        }
      }

      // 2. Update profile information if any fields changed
      const profileUpdateData: UpdateProfileRequest = {};
      let hasChanges = false;

      if (formData.displayName !== user?.displayName) {
        profileUpdateData.displayName = formData.displayName;
        hasChanges = true;
      }
      if (formData.bio !== user?.bio) {
        profileUpdateData.bio = formData.bio || null;
        hasChanges = true;
      }
      if (formData.phone !== user?.phone) {
        profileUpdateData.phone = formData.phone;
        hasChanges = true;
      }
      if (formData.location !== user?.location) {
        profileUpdateData.location = formData.location || null;
        hasChanges = true;
      }
      if (formData.birthday !== user?.birthday) {
        profileUpdateData.birthday = formData.birthday || null;
        hasChanges = true;
      }
      if (formData.gender !== user?.gender) {
        profileUpdateData.gender = formData.gender as 'MALE' | 'FEMALE' | 'OTHER' | undefined;
        hasChanges = true;
      }

      if (hasChanges) {
        setUploadStatus('Đang cập nhật thông tin...');
        debugLogger.log('ProfileSettings', 'Updating profile information', {
          updatedFields: Object.keys(profileUpdateData)
        });
        
        const updatedProfile = await userService.updateProfile(profileUpdateData);
        
        debugLogger.log('ProfileSettings', 'Profile updated successfully', {
          updatedProfile: updatedProfile
        });
        
        // Update auth profile with new data
        await updateAuthProfile(updatedProfile);
        setUploadStatus('Thông tin đã được cập nhật!');
      }

      debugLogger.log('ProfileSettings', 'All updates completed successfully');
      
      // Show success message and close
      setTimeout(() => {
        setUploadStatus('Hoàn thành!');
        setTimeout(() => {
          onClose();
          // Reset form state
          setSelectedFile(null);
          setPreviewUrl(null);
          setUploadStatus(null);
        }, 1000);
      }, 500);
      
    } catch (error: any) {
      debugLogger.log('ProfileSettings', 'Failed to update profile', error);
      console.error('Failed to update profile:', error);
      setUploadStatus(`Lỗi: ${error.message || 'Có lỗi xảy ra khi cập nhật thông tin!'}`);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal isOpen={isVisible} onClose={onClose} title="Cài đặt hồ sơ">
      <div className="w-full max-w-md space-y-6">
        {/* Avatar Upload Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Avatar user={user || undefined} className="w-full h-full" />
              )}
            </div>
            
            <button
              onClick={() => {
                debugLogger.logButtonClick('Change Avatar Button');
                fileInputRef.current?.click();
              }}
              className="absolute bottom-0 right-0 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-2 shadow-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="mt-2 text-sm text-gray-500">
            Nhấn vào biểu tượng camera để thay đổi ảnh đại diện
          </p>
          {selectedFile && (
            <p className="text-xs text-green-600 mt-1">
              Đã chọn: {selectedFile.name}
            </p>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên hiển thị
            </label>
            <Input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Nhập tên hiển thị"
              maxLength={65}
            />
            <p className="mt-1 text-xs text-gray-500">Quy định: tối đa 65 ký tự, không được để trống</p>
            {fieldErrors?.displayName && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.displayName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giới thiệu bản thân
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Viết vài dòng về bản thân..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ
            </label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Nhập địa chỉ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày sinh
            </label>
            <Input
              type="date"
              value={formData.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giới tính
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            uploadStatus.startsWith('Lỗi') 
              ? 'bg-red-100 text-red-700 border border-red-200'
              : uploadStatus.includes('Hoàn thành')
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {uploadStatus}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              debugLogger.logButtonClick('Cancel Profile Settings');
              onClose();
            }}
            className="flex-1"
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {uploadStatus || 'Đang lưu...'}
              </div>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

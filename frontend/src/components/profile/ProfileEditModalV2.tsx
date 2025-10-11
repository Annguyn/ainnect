import React, { useState, useRef } from 'react';
import { userService, UpdateProfileRequest, ChangePasswordRequest } from '../../services/userService';
import { debugLogger } from '../../utils/debugLogger';
import { cn } from '../../lib/utils';

interface ProfileEditModalV2Props {
  isVisible: boolean;
  onClose: () => void;
  user: {
    id: number;
    username: string;
    displayName: string;
    email: string;
    phone?: string | null;
    bio?: string | null;
    gender?: string | null;
    birthday?: string | null;
    location?: string | null;
    avatarUrl?: string | null;
  };
  onProfileUpdated: (updatedUser: any) => void;
}

export const ProfileEditModalV2: React.FC<ProfileEditModalV2Props> = ({
  isVisible,
  onClose,
  user,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'account'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ displayName?: string; avatar?: string } | null>(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: user.displayName || '',
    phone: user.phone || '',
    bio: user.bio || '',
    gender: user.gender || '',
    birthday: user.birthday || '',
    location: user.location || ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors(null);

    // Local validation according to test cases
    const nextFieldErrors: { displayName?: string; avatar?: string } = {};
    const trimmedName = (profileData.displayName || '').trim();
    if (!trimmedName) {
      nextFieldErrors.displayName = 'Tên người dùng không hợp lệ, không được để trống';
    } else if (trimmedName.length > 65) {
      nextFieldErrors.displayName = 'Tên người dùng không hợp lệ, quá dài (tối đa 65 ký tự)';
    }

    if (avatarFile && avatarFile.size > 5 * 1024 * 1024) {
      nextFieldErrors.avatar = 'Ảnh vượt quá dung lượng cho phép (tối đa 5MB)';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const updateData: UpdateProfileRequest = {
        displayName: profileData.displayName,
        phone: profileData.phone,
        bio: profileData.bio,
        gender: profileData.gender as 'MALE' | 'FEMALE' | 'OTHER' | undefined,
        birthday: profileData.birthday,
        location: profileData.location,
        avatar: avatarFile || undefined
      };

      const updatedUser = await userService.updateProfile(updateData);
      onProfileUpdated(updatedUser);
      setSuccess('Hồ sơ đã được cập nhật thành công!');
      
      debugLogger.log('ProfileEditModalV2', 'Profile updated successfully', {
        userId: user.id,
        updatedFields: Object.keys(updateData)
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật hồ sơ';
      setError(errorMessage);
      debugLogger.log('ProfileEditModalV2', 'Profile update failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const changePasswordData: ChangePasswordRequest = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      await userService.changePassword(changePasswordData);
      setSuccess('Mật khẩu đã được thay đổi thành công!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      debugLogger.log('ProfileEditModalV2', 'Password changed successfully', {
        userId: user.id
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi thay đổi mật khẩu';
      setError(errorMessage);
      debugLogger.log('ProfileEditModalV2', 'Password change failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeactivate = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa tài khoản? Hành động này có thể không thể hoàn tác.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await userService.deactivateAccount();
      setSuccess('Tài khoản đã được vô hiệu hóa thành công!');
      debugLogger.log('ProfileEditModalV2', 'Account deactivated successfully', {
        userId: user.id
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi vô hiệu hóa tài khoản';
      setError(errorMessage);
      debugLogger.log('ProfileEditModalV2', 'Account deactivation failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors(prev => ({ ...(prev || {}), avatar: 'Ảnh vượt quá dung lượng cho phép (tối đa 5MB)' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (!file.type.startsWith('image/')) {
        setFieldErrors(prev => ({ ...(prev || {}), avatar: 'Tệp không hợp lệ. Chỉ chấp nhận ảnh (JPG, PNG, GIF)'}));
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setFieldErrors(prev => ({ ...(prev || {}), avatar: undefined }));
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              'flex-1 py-4 px-6 text-center font-semibold transition-colors',
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={cn(
              'flex-1 py-4 px-6 text-center font-semibold transition-colors',
              activeTab === 'password'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            Đổi mật khẩu
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={cn(
              'flex-1 py-4 px-6 text-center font-semibold transition-colors',
              activeTab === 'account'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            Tài khoản
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ảnh đại diện</h3>
                  <p className="text-sm text-gray-500">JPG, PNG hoặc GIF. Tối đa 5MB.</p>
                  {fieldErrors?.avatar && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.avatar}</p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên hiển thị *
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">Quy định: tối đa 65 ký tự, không được để trống</p>
                  {fieldErrors?.displayName && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.displayName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={profileData.birthday}
                    onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới thiệu
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Hãy kể về bản thân bạn..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu hiện tại *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Đang thay đổi...' : 'Thay đổi mật khẩu'}
                </button>
              </div>
            </form>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-yellow-700 font-medium">Cảnh báo</span>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  Các hành động trong phần này có thể ảnh hưởng nghiêm trọng đến tài khoản của bạn.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Vô hiệu hóa tài khoản</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Vô hiệu hóa tài khoản sẽ làm cho tài khoản của bạn không thể sử dụng được. 
                    Bạn có thể kích hoạt lại sau này.
                  </p>
                  <button
                    onClick={handleAccountDeactivate}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Vô hiệu hóa tài khoản'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

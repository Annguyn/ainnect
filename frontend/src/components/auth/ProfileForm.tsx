import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Alert, Card, CardHeader, CardTitle, CardContent } from '../ui';
import { ProfileFormData, PasswordFormData } from '../../types';
import { userService } from '../../services/api';

export const ProfileForm: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile');
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    displayName: '',
    phone: '',
    avatarUrl: '',
    bio: '',
    gender: '',
    birthday: '',
    location: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
        gender: (user.gender as 'male' | 'female' | 'other' | '') || '',
        birthday: user.birthday || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(profileData);
      setShowAlert({ type: 'success', message: 'Cập nhật hồ sơ thành công!' });
    } catch (error: any) {
      setShowAlert({ type: 'error', message: error.message || 'Cập nhật hồ sơ thất bại' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setShowAlert({ type: 'error', message: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    try {
      await userService.changePassword(passwordData);
      setShowAlert({ type: 'success', message: 'Đổi mật khẩu thành công!' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setShowAlert({ type: 'error', message: error.message || 'Đổi mật khẩu thất bại' });
    }
  };

  const handleDeactivateAccount = async () => {
    if (window.confirm('Bạn có chắc chắn muốn vô hiệu hóa tài khoản?')) {
      try {
        await userService.deactivateAccount();
        setShowAlert({ type: 'success', message: 'Vô hiệu hóa tài khoản thành công' });
      } catch (error: any) {
        setShowAlert({ type: 'error', message: error.message || 'Vô hiệu hóa tài khoản thất bại' });
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: '👤' },
    { id: 'password', label: 'Đổi mật khẩu', icon: '🔒' },
    { id: 'security', label: 'Bảo mật', icon: '🛡️' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt tài khoản</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt bảo mật</p>
      </div>

      {showAlert && (
        <Alert
          variant={showAlert.type}
          className="mb-6"
          onClose={() => setShowAlert(null)}
        >
          {showAlert.message}
        </Alert>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <Card variant="outlined" padding="none">
            <div className="p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:w-3/4">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Tên hiển thị"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                      required
                    />
                    <Input
                      label="Số điện thoại"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    label="URL Avatar"
                    value={profileData.avatarUrl}
                    onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giới tính
                      </label>
                      <select
                        value={profileData.gender}
                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value as any })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <Input
                      type="date"
                      label="Ngày sinh"
                      value={profileData.birthday}
                      onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Địa chỉ"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="Thành phố, Quốc gia"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới thiệu bản thân
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Viết một chút về bản thân..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <Input
                    type="password"
                    label="Mật khẩu hiện tại"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    required
                  />
                  
                  <Input
                    type="password"
                    label="Mật khẩu mới"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    helperText="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
                    required
                  />
                  
                  <Input
                    type="password"
                    label="Xác nhận mật khẩu mới"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                    >
                      Đổi mật khẩu
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Bảo mật tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Vùng nguy hiểm</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Vô hiệu hóa tài khoản sẽ ngăn bạn đăng nhập và sử dụng các tính năng của Ainnect.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleDeactivateAccount}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Vô hiệu hóa tài khoản
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

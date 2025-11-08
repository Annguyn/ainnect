import React, { useState } from 'react';
import { UserDetail } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { cn } from '../../lib/utils';

interface UserDetailsModalProps {
  user: UserDetail;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleLock = async () => {
    if (!window.confirm('Bạn có chắc muốn khóa tài khoản này?')) return;
    
    setIsProcessing(true);
    try {
      await adminService.lockUser(user.id);
      alert('Khóa tài khoản thành công');
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(error?.message || 'Khóa tài khoản thất bại');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlock = async () => {
    if (!window.confirm('Bạn có chắc muốn mở khóa tài khoản này?')) return;
    
    setIsProcessing(true);
    try {
      await adminService.unlockUser(user.id);
      alert('Mở khóa tài khoản thành công');
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(error?.message || 'Mở khóa tài khoản thất bại');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await adminService.deleteUser(user.id);
      alert('Xóa tài khoản thành công');
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(error?.message || 'Xóa tài khoản thất bại');
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold">Chi tiết người dùng</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.displayName[0]
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.displayName}</h3>
              <p className="text-gray-600">@{user.username}</p>
              <div className="flex gap-2 mt-2">
                {user.isActive ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Hoạt động
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Bị khóa
                  </span>
                )}
                {user.roles.includes('ADMIN') && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                <p className="text-gray-900">{user.phone || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Giới tính</label>
                <p className="text-gray-900">{user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày sinh</label>
                <p className="text-gray-900">{user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                <p className="text-gray-900">{user.location || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="text-gray-900">{new Date(user.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
                <p className="text-gray-900">{new Date(user.updatedAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>

          {user.bio && (
            <div>
              <label className="text-sm font-medium text-gray-500">Tiểu sử</label>
              <p className="text-gray-900 mt-1">{user.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{user.totalPosts}</p>
              <p className="text-sm text-gray-600">Bài viết</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{user.totalFriends}</p>
              <p className="text-sm text-gray-600">Bạn bè</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{user.totalGroups}</p>
              <p className="text-sm text-gray-600">Nhóm</p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <div className="flex gap-3 pt-4 border-t">
              {user.isActive ? (
                <button
                  onClick={handleLock}
                  disabled={isProcessing || user.roles.includes('ADMIN')}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg font-medium transition-colors",
                    "bg-orange-500 text-white hover:bg-orange-600",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  Khóa tài khoản
                </button>
              ) : (
                <button
                  onClick={handleUnlock}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors disabled:opacity-50"
                >
                  Mở khóa
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isProcessing || user.roles.includes('ADMIN')}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg font-medium transition-colors",
                  "bg-red-500 text-white hover:bg-red-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Xóa tài khoản
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-3">
                Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                >
                  Xác nhận xóa
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


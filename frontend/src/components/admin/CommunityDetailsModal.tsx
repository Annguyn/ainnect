import React, { useState } from 'react';
import { CommunityDetail } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { cn } from '../../lib/utils';

interface CommunityDetailsModalProps {
  community: CommunityDetail;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const CommunityDetailsModal: React.FC<CommunityDetailsModalProps> = ({
  community,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      alert('Vui lòng nhập lý do xóa');
      return;
    }

    setIsDeleting(true);
    try {
      await adminService.deleteCommunity(community.id, deleteReason);
      alert('Xóa cộng đồng thành công');
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(error?.message || 'Xóa cộng đồng thất bại');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold">Chi tiết cộng đồng</h2>
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
          <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
            {community.coverUrl ? (
              <img
                src={community.coverUrl}
                alt={community.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white text-8xl font-bold">
                {community.name[0]}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{community.name}</h3>
            <p className="text-gray-600">{community.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Thành viên</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{community.totalMembers}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Bài viết</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{community.totalPosts}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Quyền riêng tư</label>
              <p className="text-gray-900 mt-1">
                {community.privacy === 'public_' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 112 0 1 1 0 01-2 0zm4 0a1 1 0 112 0 1 1 0 01-2 0zm-5 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
                    </svg>
                    Công khai
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Riêng tư
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Người tạo</label>
              <p className="text-gray-900 mt-1">{community.creatorName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
              <p className="text-gray-900 mt-1">{new Date(community.createdAt).toLocaleString('vi-VN')}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
              <p className="text-gray-900 mt-1">{new Date(community.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <div className="pt-4 border-t">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors disabled:opacity-50"
              >
                Xóa cộng đồng
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-3">
                Xác nhận xóa cộng đồng? Hành động này không thể hoàn tác!
              </p>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do xóa <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Nhập lý do xóa cộng đồng..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteReason('');
                  }}
                  disabled={isDeleting}
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


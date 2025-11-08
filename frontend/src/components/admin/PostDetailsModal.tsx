import React, { useState } from 'react';
import { PostDetail } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { getMediaType } from '../../utils/mediaUtils';

interface PostDetailsModalProps {
  post: PostDetail;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const PostDetailsModal: React.FC<PostDetailsModalProps> = ({
  post,
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
      await adminService.deletePost(post.id, deleteReason);
      alert('Xóa bài viết thành công');
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(error?.message || 'Xóa bài viết thất bại');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">Chi tiết bài viết</h2>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {post.displayName[0]}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{post.displayName}</p>
                <p className="text-sm text-gray-600">@{post.username} • ID: {post.userId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Ngày đăng</p>
              <p className="font-medium text-gray-900">{new Date(post.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
          </div>

          {((post.media && post.media.length > 0) || (post.mediaUrls && post.mediaUrls.length > 0)) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Media ({post.media ? post.media.length : post.mediaUrls?.length || 0})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {post.media ? (
                  post.media.map((mediaItem, index) => (
                    <div key={mediaItem.id || index} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      {mediaItem.mediaType === 'video' ? (
                        <div className="relative">
                          <video
                            className="w-full h-48 object-contain bg-black"
                            controls
                            playsInline
                            preload="metadata"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.error('Video load error:', mediaItem.mediaUrl);
                            }}
                            onLoadStart={() => console.log('Video loading:', mediaItem.mediaUrl)}
                            onLoadedMetadata={() => console.log('Video metadata loaded')}
                          >
                            <source src={mediaItem.mediaUrl} type="video/mp4" />
                            <source src={mediaItem.mediaUrl} type="video/webm" />
                            <source src={mediaItem.mediaUrl} type="video/ogg" />
                            <source src={mediaItem.mediaUrl} type="video/avi" />
                            <p className="text-white p-4">
                              Trình duyệt không hỗ trợ định dạng video này (.avi).
                              <br />
                              <a 
                                href={mediaItem.mediaUrl} 
                                className="underline text-blue-400 hover:text-blue-300" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                download
                              >
                                Tải xuống video
                              </a>
                            </p>
                          </video>
                        </div>
                      ) : (
                        <img
                          src={mediaItem.mediaUrl}
                          alt={`Media ${index + 1}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23eee" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      )}
                    </div>
                  ))
                ) : post.mediaUrls ? (
                  post.mediaUrls.map((url, index) => {
                    if (!url) return null;
                    const mediaType = getMediaType(url);
                    
                    return (
                      <div key={index} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        {mediaType === 'video' ? (
                          <video
                            className="w-full h-48 object-contain bg-black"
                            controls
                            playsInline
                            preload="metadata"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.error('Video load error:', url);
                            }}
                          >
                            <source src={url} type="video/mp4" />
                            <source src={url} type="video/webm" />
                            <source src={url} type="video/ogg" />
                            <p className="text-white p-4">
                              Trình duyệt không hỗ trợ định dạng video này.
                            </p>
                          </video>
                        ) : mediaType === 'image' ? (
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23eee" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-xs">Unknown media type</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : null}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{post.totalLikes}</p>
              <p className="text-sm text-gray-600">Lượt thích</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{post.totalComments}</p>
              <p className="text-sm text-gray-600">Bình luận</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{post.totalShares}</p>
              <p className="text-sm text-gray-600">Chia sẻ</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{post.totalReports}</p>
              <p className="text-sm text-gray-600">Báo cáo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-500">Quyền riêng tư</label>
              <p className="text-gray-900 mt-1 capitalize">{post.visibility.replace('_', '')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
              <p className="text-gray-900 mt-1">{new Date(post.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <div className="pt-4 border-t">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors disabled:opacity-50"
              >
                Xóa bài viết
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-3">
                Xác nhận xóa bài viết? Hành động này không thể hoàn tác!
              </p>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do xóa <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Nhập lý do xóa bài viết..."
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


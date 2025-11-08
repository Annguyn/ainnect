import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { apkVersionService, ApkVersion } from '../../services/apkVersionService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Smartphone, Download, Edit, Trash2, Check, Plus, X, AlertCircle } from 'lucide-react';

export const AdminApkVersionsPage: React.FC = () => {
  const [versions, setVersions] = useState<ApkVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ApkVersion | null>(null);
  const [activeVersion, setActiveVersion] = useState<ApkVersion | null>(null);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apkVersionService.getAllVersions(0, 50);
      setVersions(Array.isArray(response.content) ? response.content : []);
      
      // Load active version
      try {
        const active = await apkVersionService.getActiveVersionAdmin();
        setActiveVersion(active);
      } catch (err) {
        console.error('No active version found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load APK versions');
      console.error('Failed to load APK versions:', err);
      setVersions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const handleDelete = async (versionId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phiên bản này?')) {
      return;
    }

    try {
      await apkVersionService.deleteVersion(versionId);
      await loadVersions();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa phiên bản này');
    }
  };

  const handleSetActive = async (versionId: number) => {
    if (!window.confirm('Đặt phiên bản này làm phiên bản active?')) {
      return;
    }

    try {
      await apkVersionService.setActiveVersion(versionId);
      await loadVersions();
    } catch (err: any) {
      alert(err.message || 'Không thể đặt phiên bản active');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Smartphone className="w-8 h-8 mr-3 text-blue-600" />
              Quản lý APK Versions
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý các phiên bản ứng dụng Android
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="!bg-blue-600 !text-white hover:!bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm phiên bản mới
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Active Version Card */}
        {activeVersion && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Check className="w-6 h-6 mr-2 text-green-600" />
                  Phiên bản Active
                </h2>
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  ACTIVE
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Version Name</p>
                  <p className="text-lg font-semibold text-gray-900">{activeVersion.versionName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Version Code</p>
                  <p className="text-lg font-semibold text-gray-900">{activeVersion.versionCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">File Name</p>
                  <p className="text-lg font-semibold text-gray-900">{activeVersion.fileName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="text-lg font-semibold text-gray-900">{formatFileSize(activeVersion.fileSize)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-base text-gray-900">{activeVersion.description}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">APK URL</p>
                  <a
                    href={activeVersion.apkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {activeVersion.apkUrl}
                  </a>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Versions List */}
        <div className="grid grid-cols-1 gap-4">
          {versions.map((version) => (
            <Card key={version.id} className={version.isActive ? 'border-2 border-blue-300' : ''}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {version.versionName}
                      </h3>
                      <span className="text-sm text-gray-600">
                        (Code: {version.versionCode})
                      </span>
                      {version.isActive && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">{version.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">File Name</p>
                        <p className="font-medium text-gray-900">{version.fileName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">File Size</p>
                        <p className="font-medium text-gray-900">{formatFileSize(version.fileSize)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created By</p>
                        <p className="font-medium text-gray-900">{version.createdByUsername}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Release Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(version.releaseDate || version.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <a
                        href={version.apkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm break-all"
                      >
                        {version.apkUrl}
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {!version.isActive && (
                      <Button
                        size="sm"
                        onClick={() => handleSetActive(version.id)}
                        className="!bg-green-600 !text-white hover:!bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Set Active
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedVersion(version);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {!version.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(version.id)}
                        className="!text-red-600 !border-red-600 hover:!bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {versions.length === 0 && (
            <div className="text-center py-12">
              <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Chưa có phiên bản APK nào</p>
              <p className="text-gray-500 text-sm mt-2">Nhấn "Thêm phiên bản mới" để tạo phiên bản đầu tiên</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateVersionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadVersions();
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedVersion && (
        <EditVersionModal
          version={selectedVersion}
          onClose={() => {
            setShowEditModal(false);
            setSelectedVersion(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedVersion(null);
            loadVersions();
          }}
        />
      )}
    </AdminLayout>
  );
};

// Create Version Modal Component
const CreateVersionModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    versionName: '',
    versionCode: '',
    apkUrl: '',
    description: '',
    fileSize: '',
    fileName: '',
    isActive: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apkVersionService.createVersion({
        versionName: formData.versionName,
        versionCode: parseInt(formData.versionCode),
        apkUrl: formData.apkUrl,
        description: formData.description,
        fileSize: parseInt(formData.fileSize),
        fileName: formData.fileName,
        isActive: formData.isActive
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create version');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tạo phiên bản mới</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.versionName}
                  onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1.0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version Code *
                </label>
                <input
                  type="number"
                  required
                  value={formData.versionCode}
                  onChange={(e) => setFormData({ ...formData, versionCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                APK URL *
              </label>
              <input
                type="url"
                required
                value={formData.apkUrl}
                onChange={(e) => setFormData({ ...formData, apkUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://cdn.ainnect.me/apk/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fileName}
                  onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ainnect-v1.0.0.apk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Size (bytes) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.fileSize}
                  onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả về phiên bản này..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Đặt làm phiên bản active ngay
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 !bg-blue-600 !text-white hover:!bg-blue-700"
              >
                {submitting ? 'Đang tạo...' : 'Tạo phiên bản'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Version Modal Component
const EditVersionModal: React.FC<{
  version: ApkVersion;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ version, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    versionName: version.versionName,
    apkUrl: version.apkUrl,
    description: version.description,
    isActive: version.isActive
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apkVersionService.updateVersion(version.id, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update version');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa phiên bản</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version Name
              </label>
              <input
                type="text"
                value={formData.versionName}
                onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                APK URL
              </label>
              <input
                type="url"
                value={formData.apkUrl}
                onChange={(e) => setFormData({ ...formData, apkUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActiveEdit"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActiveEdit" className="ml-2 text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 !bg-blue-600 !text-white hover:!bg-blue-700"
              >
                {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

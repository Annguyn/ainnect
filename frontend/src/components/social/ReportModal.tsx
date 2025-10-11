import React, { useState } from 'react';
import { X, AlertTriangle, User, MessageSquare, FileText } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string, description: string) => Promise<void>;
  targetType: 'USER' | 'POST' | 'COMMENT';
  targetId: number;
  targetName?: string;
}

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam', description: 'Nội dung spam hoặc quảng cáo không mong muốn' },
  { value: 'HARASSMENT', label: 'Quấy rối', description: 'Hành vi quấy rối hoặc đe dọa' },
  { value: 'HATE_SPEECH', label: 'Ngôn từ thù địch', description: 'Ngôn từ thù địch hoặc phân biệt đối xử' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Nội dung không phù hợp', description: 'Nội dung không phù hợp hoặc phản cảm' },
  { value: 'OTHER', label: 'Khác', description: 'Lý do khác' }
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onReport,
  targetType,
  targetId,
  targetName
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason || !description.trim()) return;

    try {
      setIsSubmitting(true);
      await onReport(selectedReason, description.trim());
      onClose();
      setSelectedReason('');
      setDescription('');
    } catch (error) {
      console.error('Report submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetIcon = () => {
    switch (targetType) {
      case 'USER':
        return <User className="w-5 h-5" />;
      case 'POST':
        return <FileText className="w-5 h-5" />;
      case 'COMMENT':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getTargetLabel = () => {
    switch (targetType) {
      case 'USER':
        return 'người dùng';
      case 'POST':
        return 'bài viết';
      case 'COMMENT':
        return 'bình luận';
      default:
        return 'nội dung';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Báo cáo {getTargetLabel()}</h2>
              <p className="text-sm text-gray-600">
                Báo cáo {targetName ? `"${targetName}"` : `ID: ${targetId}`}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Lý do báo cáo
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{reason.label}</div>
                    <div className="text-sm text-gray-600">{reason.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vui lòng mô tả chi tiết lý do báo cáo..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mô tả chi tiết sẽ giúp chúng tôi xử lý báo cáo hiệu quả hơn
            </p>
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
              disabled={!selectedReason || !description.trim() || isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/ui';
import { EmptyState } from '../components/EmptyState';
import { socialService, Report } from '../services/socialService';
import { useAuth } from '../hooks/useAuth';
import { debugLogger } from '../utils/debugLogger';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    loadReports();
  }, [currentUser, navigate]);

  const loadReports = async (page: number = 0) => {
    try {
      setIsLoading(true);
      const response = await socialService.getMyReports(page, 20);
      
      if (page === 0) {
        setReports(response.content);
      } else {
        setReports(prev => [...prev, ...response.content]);
      }
      
      setHasMore(response.hasNext);
      setCurrentPage(page);
      
      debugLogger.log('ReportsPage', 'Loaded reports', {
        page,
        count: response.content.length,
        hasMore: response.hasNext
      });
    } catch (error) {
      debugLogger.log('ReportsPage', 'Failed to load reports', error);
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadReports(currentPage + 1);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INVESTIGATING':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'DISMISSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ xử lý';
      case 'INVESTIGATING':
        return 'Đang điều tra';
      case 'RESOLVED':
        return 'Đã giải quyết';
      case 'DISMISSED':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const getTargetTypeText = (targetType: string) => {
    switch (targetType) {
      case 'USER':
        return 'Người dùng';
      case 'POST':
        return 'Bài viết';
      case 'COMMENT':
        return 'Bình luận';
      default:
        return targetType;
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'SPAM':
        return 'Spam';
      case 'HARASSMENT':
        return 'Quấy rối';
      case 'HATE_SPEECH':
        return 'Ngôn từ thù địch';
      case 'INAPPROPRIATE_CONTENT':
        return 'Nội dung không phù hợp';
      case 'OTHER':
        return 'Khác';
      default:
        return reason;
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={false} showUserMenu={true} onLogout={handleLogout} />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Báo cáo của tôi</h1>
          </div>
          <p className="text-gray-600">
            Danh sách các báo cáo bạn đã gửi
          </p>
        </div>

        {/* Content */}
        {isLoading && reports.length === 0 ? (
          <EmptyState type="loading" title="Đang tải danh sách báo cáo..." />
        ) : reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Báo cáo {getTargetTypeText(report.targetType).toLowerCase()}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-medium">Lý do:</span>
                        <span>{getReasonText(report.reason)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-medium">ID đối tượng:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{report.targetId}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-medium">Ngày gửi:</span>
                        <span>{new Date(report.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      
                      {report.updatedAt !== report.createdAt && (
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="font-medium">Cập nhật lần cuối:</span>
                          <span>{new Date(report.updatedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Mô tả:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {report.description}
                      </p>
                    </div>
                    
                    {report.adminNote && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Ghi chú từ quản trị viên:</p>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                          {report.adminNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Đang tải...' : 'Tải thêm'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState 
            type="no-friends" 
            title="Chưa có báo cáo nào"
            description="Bạn chưa gửi báo cáo nào."
          />
        )}
      </main>
    </div>
  );
};

export default ReportsPage;

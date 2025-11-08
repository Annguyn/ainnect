import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { LogsTable } from '../../components/admin/LogsTable';
import { adminService } from '../../services/adminService';
import { PaginatedLogsResponse } from '../../types/admin';
import { cn } from '../../lib/utils';

type FilterType = 'all' | 'user' | 'action';

export const AdminLogsPage: React.FC = () => {
  const [logsData, setLogsData] = useState<PaginatedLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [currentPage, filterType, userIdFilter, actionFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      let data: PaginatedLogsResponse;

      if (filterType === 'user' && userIdFilter) {
        data = await adminService.getUserLogs(parseInt(userIdFilter), currentPage, 50);
      } else if (filterType === 'action' && actionFilter) {
        data = await adminService.getLogsByAction(actionFilter, currentPage, 50);
      } else {
        data = await adminService.getAllLogs(currentPage, 50);
      }

      setLogsData(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setCurrentPage(0);
    loadLogs();
  };

  const handleClearFilter = () => {
    setFilterType('all');
    setUserIdFilter('');
    setActionFilter('');
    setCurrentPage(0);
  };

  const actionTypes = [
    'USER_LOGIN',
    'USER_LOCKED',
    'USER_UNLOCKED',
    'USER_DELETED',
    'POST_DELETED',
    'COMMUNITY_DELETED',
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nhật ký hoạt động</h1>
            <p className="text-gray-600 mt-1">
              Tổng số: {logsData?.page.totalElements || 0} bản ghi
            </p>
          </div>
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại lọc
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="user">Theo người dùng</option>
                <option value="action">Theo hành động</option>
              </select>
            </div>

            {filterType === 'user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="number"
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  placeholder="Nhập User ID..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            {filterType === 'action' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại hành động
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Chọn hành động...</option>
                  {actionTypes.map((action) => (
                    <option key={action} value={action}>
                      {action.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {filterType !== 'all' && (
              <>
                <button
                  onClick={handleApplyFilter}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Áp dụng
                </button>
                <button
                  onClick={handleClearFilter}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Xóa lọc
                </button>
              </>
            )}
          </div>
        </div>

        <LogsTable logs={logsData?.content || []} loading={loading} />

        {logsData && logsData.page.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="px-4 py-2 text-gray-700">
              Trang {currentPage + 1} / {logsData.page.totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(logsData.page.totalPages - 1, prev + 1))}
              disabled={currentPage === logsData.page.totalPages - 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};


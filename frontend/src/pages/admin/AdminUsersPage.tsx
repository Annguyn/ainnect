import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { UserTable } from '../../components/admin/UserTable';
import { UserDetailsModal } from '../../components/admin/UserDetailsModal';
import { adminService } from '../../services/adminService';
import { UserDetail, PaginatedUsersResponse } from '../../types/admin';
import { cn } from '../../lib/utils';

type TabType = 'all' | 'active' | 'inactive';

export const AdminUsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [usersData, setUsersData] = useState<PaginatedUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadUsers();
  }, [activeTab, currentPage, searchKeyword]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      let data: PaginatedUsersResponse;

      if (searchKeyword) {
        data = await adminService.searchUsers(searchKeyword, currentPage, 20);
      } else {
        switch (activeTab) {
          case 'active':
            data = await adminService.getActiveUsers(currentPage, 20);
            break;
          case 'inactive':
            data = await adminService.getInactiveUsers(currentPage, 20);
            break;
          default:
            data = await adminService.getAllUsers(currentPage, 20);
        }
      }

      setUsersData(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(searchInput);
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchKeyword('');
    setCurrentPage(0);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(0);
    setSearchKeyword('');
    setSearchInput('');
  };

  const tabs = [
    { id: 'all' as TabType, name: 'Tất cả', icon: '👥' },
    { id: 'active' as TabType, name: 'Hoạt động', icon: '✅' },
    { id: 'inactive' as TabType, name: 'Bị khóa', icon: '🔒' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
            <p className="text-gray-600 mt-1">
              Tổng số: {usersData?.page.totalElements || 0} người dùng
            </p>
          </div>
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo tên, username, email..."
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Tìm kiếm
          </button>
          {searchKeyword && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Xóa
            </button>
          )}
        </form>

        <div className="bg-white rounded-xl shadow-lg p-2">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200",
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <UserTable
          users={usersData?.content || []}
          onUserClick={setSelectedUser}
          loading={loading}
        />

        {usersData && usersData.page.totalPages > 1 && (
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

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, usersData.page.totalPages) }, (_, i) => {
                let pageNumber: number;
                if (usersData.page.totalPages <= 5) {
                  pageNumber = i;
                } else if (currentPage < 3) {
                  pageNumber = i;
                } else if (currentPage > usersData.page.totalPages - 4) {
                  pageNumber = usersData.page.totalPages - 5 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={cn(
                      "w-10 h-10 rounded-lg font-medium transition-colors",
                      currentPage === pageNumber
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {pageNumber + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(usersData.page.totalPages - 1, prev + 1))}
              disabled={currentPage === usersData.page.totalPages - 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            onUpdate={loadUsers}
          />
        )}
      </div>
    </AdminLayout>
  );
};


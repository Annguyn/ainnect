import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CommunityCard } from '../../components/admin/CommunityCard';
import { CommunityDetailsModal } from '../../components/admin/CommunityDetailsModal';
import { adminService } from '../../services/adminService';
import { CommunityDetail, PaginatedCommunitiesResponse } from '../../types/admin';

export const AdminGroupsPage: React.FC = () => {
  const [communitiesData, setCommunitiesData] = useState<PaginatedCommunitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityDetail | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadCommunities();
  }, [currentPage, searchKeyword]);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      let data: PaginatedCommunitiesResponse;

      if (searchKeyword) {
        data = await adminService.searchCommunities(searchKeyword, currentPage, 12);
      } else {
        data = await adminService.getAllCommunities(currentPage, 12);
      }

      setCommunitiesData(data);
    } catch (error) {
      console.error('Failed to load communities:', error);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý nhóm</h1>
            <p className="text-gray-600 mt-1">
              Tổng số: {communitiesData?.page.totalElements || 0} nhóm
            </p>
          </div>
          <button
            onClick={loadCommunities}
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
              placeholder="Tìm kiếm nhóm theo tên, mô tả..."
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-12 w-12 text-indigo-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : communitiesData && communitiesData.content.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communitiesData.content.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onSelect={setSelectedCommunity}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-xl text-gray-600">Không tìm thấy nhóm nào</p>
          </div>
        )}

        {communitiesData && communitiesData.page.totalPages > 1 && (
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
              Trang {currentPage + 1} / {communitiesData.page.totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(communitiesData.page.totalPages - 1, prev + 1))}
              disabled={currentPage === communitiesData.page.totalPages - 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {selectedCommunity && (
          <CommunityDetailsModal
            community={selectedCommunity}
            isOpen={!!selectedCommunity}
            onClose={() => setSelectedCommunity(null)}
            onUpdate={loadCommunities}
          />
        )}
      </div>
    </AdminLayout>
  );
};


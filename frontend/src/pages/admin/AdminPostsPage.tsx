import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PostCard } from '../../components/admin/PostCard';
import { PostDetailsModal } from '../../components/admin/PostDetailsModal';
import { adminService } from '../../services/adminService';
import { PostDetail, PaginatedPostsResponse } from '../../types/admin';
import { cn } from '../../lib/utils';

type FilterType = 'all' | 'user';

export const AdminPostsPage: React.FC = () => {
  const [postsData, setPostsData] = useState<PaginatedPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [userIdFilter, setUserIdFilter] = useState('');

  useEffect(() => {
    loadPosts();
  }, [currentPage, filterType, userIdFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let data: PaginatedPostsResponse;

      if (filterType === 'user' && userIdFilter) {
        data = await adminService.getUserPosts(parseInt(userIdFilter), currentPage, 12);
      } else {
        data = await adminService.getAllPosts(currentPage, 12);
      }

      setPostsData(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setCurrentPage(0);
    loadPosts();
  };

  const handleClearFilter = () => {
    setFilterType('all');
    setUserIdFilter('');
    setCurrentPage(0);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý bài viết</h1>
            <p className="text-gray-600 mt-1">
              Tổng số: {postsData?.page.totalElements || 0} bài viết
            </p>
          </div>
          <button
            onClick={loadPosts}
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
                <option value="all">Tất cả bài viết</option>
                <option value="user">Theo người dùng</option>
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-12 w-12 text-indigo-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : postsData && postsData.content.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsData.content.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onSelect={setSelectedPost}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl text-gray-600">Không tìm thấy bài viết nào</p>
          </div>
        )}

        {postsData && postsData.page.totalPages > 1 && (
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
              Trang {currentPage + 1} / {postsData.page.totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(postsData.page.totalPages - 1, prev + 1))}
              disabled={currentPage === postsData.page.totalPages - 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {selectedPost && (
          <PostDetailsModal
            post={selectedPost}
            isOpen={!!selectedPost}
            onClose={() => setSelectedPost(null)}
            onUpdate={loadPosts}
          />
        )}
      </div>
    </AdminLayout>
  );
};


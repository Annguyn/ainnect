import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { user } = useAuth();

  return (
    <div className={`${className}`}>
      <nav className="space-y-1 sticky top-20">
        {/* Profile Section */}
        <Link
          to="/profile"
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <img
            src={user?.avatarUrl || '/favicon.ico'}
            alt={user?.displayName || 'Profile'}
            className="w-8 h-8 rounded-full"
          />
          <span className="font-medium text-gray-800 text-sm truncate">{user?.displayName}</span>
        </Link>

        {/* Main Navigation */}
        <Link
          to="/friends"
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <span className="text-gray-700 text-sm">Bạn bè</span>
        </Link>

        <Link
          to="/groups"
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 7H7v6h6V7z" />
              <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-gray-700 text-sm">Nhóm</span>
        </Link>

        <Link
          to="/messaging"
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
          <span className="text-gray-700 text-sm">Tin nhắn</span>
        </Link>

        <hr className="my-4 border-gray-200" />

        {/* Shortcuts Section */}
        <div className="p-1">
          <h3 className="text-gray-500 font-medium text-xs mb-2 px-1">Lối tắt của bạn</h3>
          <div className="space-y-1">
            <Link
              to="/friend-requests"
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-xs"
            >
              <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full">
                <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </div>
              <span className="text-gray-700 truncate">Lời mời kết bạn</span>
            </Link>

            <Link
              to="/saved-posts"
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-xs"
            >
              <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full">
                <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </div>
              <span className="text-gray-700 truncate">Bài viết đã lưu</span>
            </Link>
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Footer Links */}
        <div className="p-1 text-xs text-gray-500 space-y-1">
          <div className="flex flex-wrap gap-1">
            <Link to="/about" className="hover:underline">Giới thiệu</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:underline">Quyền riêng tư</Link>
            <span>·</span>
            <Link to="/terms" className="hover:underline">Điều khoản</Link>
          </div>
          <div className="text-xs">© 2025 Ainnect</div>
        </div>
      </nav>
    </div>
  );
};

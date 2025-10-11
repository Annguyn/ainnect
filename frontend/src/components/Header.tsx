import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from './ui';
import { Button } from './ui';

interface HeaderProps {
  showSearch?: boolean;
  showUserMenu?: boolean;
  onLogout?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  showSearch = false,
  showUserMenu = true,
  onLogout,
  className = ''
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [showHistory, setShowHistory] = useState(false);
  const [showSocialMenu, setShowSocialMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSocialMenu) {
        setShowSocialMenu(false);
      }
    };

    if (showSocialMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSocialMenu]);

  const runSearch = (q: string) => {
    const keyword = q.trim();
    if (!keyword) return;
    const nextRecent = [keyword, ...recentSearches.filter(s => s !== keyword)].slice(0, 5);
    setRecentSearches(nextRecent);
    localStorage.setItem('recentSearches', JSON.stringify(nextRecent));
    setShowHistory(false);
    setHighlightIndex(-1);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <header className={`bg-white shadow-md border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <img
                src="/favicon.ico"
                alt="Ainnect Logo"
                className="w-10 h-10"
              />
              <h1 className="text-xl font-bold text-primary-600">
                ainnect
              </h1>
            </Link>
          </div>
          
          {/* Search Bar */}
          {/* Main Navigation */}
          <div className="hidden md:flex flex-1 justify-center space-x-2">
            <Link
              to="/"
              className="px-6 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </Link>
            <Link
              to="/friends"
              className="px-6 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </Link>
            <Link
              to="/messaging"
              className="px-6 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </Link>
            <Link
              to="/groups"
              className="px-6 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </Link>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tìm kiếm trên Ainnect"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const chosen = highlightIndex >= 0 ? recentSearches[highlightIndex] : searchQuery;
                      runSearch(chosen);
                    }
                    if (e.key === 'Escape') setShowHistory(false);
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      if (!showHistory) setShowHistory(true);
                      setHighlightIndex((prev) => {
                        const next = prev + 1;
                        return next >= recentSearches.length ? 0 : next;
                      });
                    }
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightIndex((prev) => {
                        const next = prev - 1;
                        return next < 0 ? recentSearches.length - 1 : next;
                      });
                    }
                  }}
                  className="pl-10 pr-10 py-2 w-full rounded-full border border-gray-200 bg-gray-100 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors"
                />
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  onClick={() => runSearch(searchQuery)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-primary-600 text-white rounded-full hover:bg-primary-700"
                >
                  Tìm
                </button>

                {showHistory && recentSearches.length > 0 && (
                  <div
                    className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                    onMouseLeave={() => setShowHistory(false)}
                  >
                    <div className="px-4 py-2 text-xs text-gray-500">Tìm kiếm gần đây</div>
                    <ul className="max-h-64 overflow-y-auto">
                      {recentSearches.map((term, idx) => (
                        <li key={term}>
                          <button
                            onClick={() => runSearch(term)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${idx === highlightIndex ? 'bg-gray-100' : ''}`}
                          >
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Search Page Link */}
          <Link
            to="/search"
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Quick Social Shortcuts */}
          <div className="hidden sm:flex items-center space-x-2 mr-2">
            <Link
              to="/friends"
              title="Danh sách bạn bè"
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <Link
              to="/friend-requests?tab=received"
              title="Lời mời kết bạn"
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </Link>
          </div>
          
          {/* User Menu or Auth Buttons */}
          {showUserMenu ? (
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  {/* Notifications */}
                  <button className="p-2 hover:bg-gray-100 rounded-full relative text-gray-600 hover:text-primary-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      3
                    </span>
                  </button>

                  {/* Social Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSocialMenu(!showSocialMenu)}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-primary-600"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    {showSocialMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900">Mạng xã hội</h3>
                        </div>
                        
                        <div className="py-1">
                          <button
                            onClick={() => {
                              navigate('/groups');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            <span>Nhóm</span>
                          </button>
                        <button
                          onClick={() => {
                            navigate('/friends');
                            setShowSocialMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <span>Danh sách bạn bè</span>
                        </button>

                          <button
                            onClick={() => {
                              navigate('/friend-requests?tab=received');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <span>Lời mời kết bạn</span>
                          </button>

                        <button
                          onClick={() => {
                            navigate('/friend-requests?tab=sent');
                            setShowSocialMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <span>Lời mời đã gửi</span>
                        </button>
                          
                          <button
                            onClick={() => {
                              navigate('/followers');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Người theo dõi</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/following');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Đang theo dõi</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/friends');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <span>Bạn bè</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/blocked-users');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                            <span>Người dùng đã chặn</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/reports');
                              setShowSocialMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>Báo cáo của tôi</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Messages Button with Counter */}
                  <button
                    onClick={() => navigate('/messaging')}
                    className="p-2 hover:bg-gray-100 rounded-full relative text-gray-600 hover:text-primary-600"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      2
                    </span>
                  </button>

                  {/* User Profile Link */}
                  <div className="relative">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 text-gray-800"
                    >
                      <img
                        src={user.avatarUrl || '/favicon.ico'}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <span className="hidden sm:block text-sm font-semibold">
                        {user.displayName?.split(' ').pop()}
                      </span>
                    </Link>
                  </div>

                  {/* Logout Button (for ProfilePage) */}
                  {onLogout && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onLogout}
                    >
                      Đăng xuất
                    </Button>
                  )}
                </>
              ) : (
                /* Auth Buttons for non-authenticated users */
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const event = new CustomEvent('openAuthModal', { detail: { mode: 'login' } });
                      window.dispatchEvent(event);
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const event = new CustomEvent('openAuthModal', { detail: { mode: 'register' } });
                      window.dispatchEvent(event);
                    }}
                  >
                    Đăng ký
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

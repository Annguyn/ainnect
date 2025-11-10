import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from '../components/auth';
import { Button } from '../components/ui';
import { CreatePost } from '../components/CreatePost';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { RightSidebar } from '../components/RightSidebar';
import { MessagingNavigation } from '../components/MessagingNavigation';
import { EmptyState } from '../components/EmptyState';
import { UserFeed } from '../components/social/UserFeed';
import { PostSkeleton } from '../components/PostSkeleton';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { debugLogger } from '../utils/debugLogger';
import { postService, Post } from '../services/postService';
import { groupService } from '../services/groupService';


const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const [publicPosts, setPublicPosts] = useState<Post[]>([]);
  const [publicPostsLoading, setPublicPostsLoading] = useState(false);
  const [publicPostsError, setPublicPostsError] = useState<string | null>(null);
  const [publicPostsPage, setPublicPostsPage] = useState(0);
  const [hasMorePublicPosts, setHasMorePublicPosts] = useState(true);
  const [publicPostsRetryCount, setPublicPostsRetryCount] = useState(0);
  const [isRetryingPublicPosts, setIsRetryingPublicPosts] = useState(false);
  const [hasInitialLoadAttempted, setHasInitialLoadAttempted] = useState(false);

  const [suggestedGroups, setSuggestedGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    debugLogger.logButtonClick('Auth Modal Open', { mode });
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  useEffect(() => {
    const handleAuthModalEvent = (event: CustomEvent) => {
      const { mode } = event.detail;
      handleOpenAuth(mode);
    };

    window.addEventListener('openAuthModal', handleAuthModalEvent as EventListener);
    
    return () => {
      window.removeEventListener('openAuthModal', handleAuthModalEvent as EventListener);
    };
  }, []);

  const loadPublicPosts = useCallback(async (page = 0, reset = false, isRetry = false) => {
    // Prevent multiple simultaneous requests
    if (publicPostsLoading) {
      debugLogger.log('HomePage', 'Skipping load - already loading');
      return;
    }
    
    // Stop if we've already hit an error and haven't manually retried
    if (!reset && !isRetry && publicPostsError && hasInitialLoadAttempted) {
      debugLogger.log('HomePage', 'Skipping load - error state exists');
      return;
    }

    if (!hasMorePublicPosts && page > 0) {
      debugLogger.log('HomePage', 'Skipping load - no more posts');
      return;
    }

    setPublicPostsLoading(true);
    setHasInitialLoadAttempted(true);
    
    if (!isRetry) {
      setPublicPostsError(null);
    }

    try {
      const response = await postService.getPublicPosts(page, 10);
      
      if (!response || !response.content || !Array.isArray(response.content)) {
        console.error('Invalid response structure:', response);
        throw new Error('Phản hồi không hợp lệ từ server');
      }
      
      debugLogger.log('HomePage', 'Public posts loaded successfully', {
        page,
        count: response.content.length,
        totalPages: response.page?.totalPages || 0,
        isRetry: isRetry ? `(retry ${publicPostsRetryCount + 1}/3)` : ''
      });

      if (reset || page === 0) {
        setPublicPosts(response.content);
      } else {
        setPublicPosts(prev => {
          const existingIds = new Set(prev.map(post => post.id));
          const newPosts = response.content.filter(post => !existingIds.has(post.id));

          if (newPosts.length !== response.content.length) {
            console.warn(`Filtered out ${response.content.length - newPosts.length} duplicate posts on page ${page}`);
          }

          return [...prev, ...newPosts];
        });
      }

      setPublicPostsPage(page);
      const hasMore = response.page?.number < response.page?.totalPages - 1;
      setHasMorePublicPosts(hasMore);

      // Reset retry count on success
      setPublicPostsRetryCount(0);
      setIsRetryingPublicPosts(false);
      
    } catch (error: any) {
      console.error('Failed to fetch public posts:', error);
      debugLogger.log('HomePage', 'Failed to fetch public posts', { error, retryCount: publicPostsRetryCount });

      const isNetworkError = error?.message?.includes('Network') || 
                            error?.message?.includes('fetch') ||
                            error?.code === 'ERR_NETWORK' ||
                            !error?.response;

      // Retry logic - only retry on network errors, max 2 retries
      if (isNetworkError && publicPostsRetryCount < 2 && !isRetry) {
        const newRetryCount = publicPostsRetryCount + 1;
        setPublicPostsRetryCount(newRetryCount);
        setIsRetryingPublicPosts(true);

        debugLogger.log('HomePage', `Retrying in 2 seconds... (${newRetryCount}/3)`);

        setTimeout(() => {
          loadPublicPosts(page, reset, true);
        }, 2000);
      } else {
        // Stop retrying and show error
        setIsRetryingPublicPosts(false);
        
        let errorMessage = 'Không thể kết nối đến server. ';
        
        if (isNetworkError) {
          errorMessage += 'Vui lòng kiểm tra kết nối internet và thử lại.';
        } else {
          errorMessage += 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
        }
        
        setPublicPostsError(errorMessage);
        setPublicPostsRetryCount(0);
        
        debugLogger.log('HomePage', 'Stopped retrying - max attempts reached or non-network error');
      }
    } finally {
      setPublicPostsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - use refs for values to prevent re-creation

  const loadMorePublicPosts = useCallback(() => {
    if (hasMorePublicPosts && !publicPostsLoading) {
      loadPublicPosts(publicPostsPage + 1, false);
    }
  }, [hasMorePublicPosts, publicPostsLoading, publicPostsPage, loadPublicPosts]);

  useEffect(() => {
    // Only load once when component mounts for non-authenticated users
    if (!isAuthenticated) {
      loadPublicPosts(0, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Load when authentication status changes

  useInfiniteScroll({
    hasMore: hasMorePublicPosts,
    isLoading: publicPostsLoading,
    onLoadMore: loadMorePublicPosts,
    threshold: 200
  });

  const handleCreatePost = async (
    content: string,
    visibility?: 'public_' | 'friends' | 'private_' | 'group',
    mediaFiles?: File[]
  ) => {
    debugLogger.logFormSubmit('Create Post', { content, visibility, mediaFilesCount: mediaFiles?.length || 0 });
    try {
      const post = await postService.createPost({
        content,
        visibility: visibility as 'public_' | 'friends' | 'private',
        mediaFiles
      });
      debugLogger.log('HomePage', 'Post created successfully', { postId: post?.id });
      return post;
    } catch (error) {
      // Don't throw: the UI should show optimistic content and not surface an error
      debugLogger.log('HomePage', 'Failed to create post (backend processing); returning undefined', error);
      console.error('Failed to create post (non-blocking):', error);
      return undefined;
    }
  };

  useEffect(() => {
    const fetchSuggestedGroups = async () => {
      // Only fetch if authenticated
      if (!isAuthenticated) {
        setSuggestedGroups([]);
        return;
      }

      setLoadingGroups(true);
      setGroupsError(null);
      
      try {
        const response = await groupService.getSuggestedGroups(0, 10);
        
        if (response && Array.isArray(response.content)) {
          setSuggestedGroups(response.content);
        } else if (Array.isArray(response)) {
          setSuggestedGroups(response);
        } else {
          console.warn('Suggested groups response is not in expected format:', response);
          setSuggestedGroups([]);
        }
        
        debugLogger.log('HomePage', 'Suggested groups loaded', { count: response?.content?.length || 0 });
      } catch (error: any) {
        console.error('Failed to fetch suggested groups:', error);
        
        const isNetworkError = error?.message?.includes('Network') || 
                              error?.message?.includes('fetch') ||
                              error?.code === 'ERR_NETWORK' ||
                              !error?.response;
        
        const errorMessage = isNetworkError 
          ? 'Không thể kết nối đến server để tải nhóm gợi ý.'
          : 'Không thể tải danh sách nhóm. Vui lòng thử lại sau.';
        
        setGroupsError(errorMessage);
        setSuggestedGroups([]);
        
        debugLogger.log('HomePage', 'Failed to load suggested groups', { error: error?.message });
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchSuggestedGroups();
  }, [isAuthenticated]);

  // Notifications are now handled in Header component, no need for duplicate logic here

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <Header showSearch={true} showUserMenu={true} />
        <main className="w-full py-4 px-1 sm:px-2 lg:px-4 xl:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 xl:gap-6 max-w-none">
            <div className="hidden lg:block lg:col-span-2">
              <Sidebar />
            </div>
            
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 max-w-2xl mx-auto">
                <div className="p-4 text-center py-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chia sẻ suy nghĩ của bạn</h3>
                  <p className="text-gray-500 mb-4">Đăng nhập để tạo bài viết và tương tác với cộng đồng</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => handleOpenAuth('login')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenAuth('register')}
                      className="border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                    >
                      Đăng ký
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {publicPostsError ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải bài viết</h3>
                    <p className="text-gray-500 mb-4">{publicPostsError}</p>
                    <Button
                      onClick={() => {
                        setPublicPostsError(null);
                        setPublicPostsRetryCount(0);
                        setPublicPostsPage(0);
                        setPublicPosts([]);
                        setHasMorePublicPosts(true);
                        setIsRetryingPublicPosts(false);
                        setHasInitialLoadAttempted(false);
                        loadPublicPosts(0, true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Thử lại
                    </Button>
                  </div>
                ) : (!publicPosts || publicPosts.length === 0) && !publicPostsLoading ? (
                  <EmptyState
                    type="empty"
                    title="Chưa có bài viết công khai"
                    description="Hãy đăng ký để bắt đầu chia sẻ và khám phá nội dung từ cộng đồng"
                    buttonText="Tham gia ngay"
                    onButtonClick={() => handleOpenAuth('register')}
                  />
                ) : (
                  <>
                    {publicPosts && Array.isArray(publicPosts) && publicPosts.map((post, index) => (
                      <div
                        key={`public-post-${post.id}-${index}`}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 max-w-2xl mx-auto p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleOpenAuth('login')}
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <img
                            src={post.authorAvatarUrl || '/default-avatar.png'}
                            alt={post.authorDisplayName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{post.authorDisplayName}</h3>
                            <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="text-gray-800">{post.content}</p>
                        {post.media && Array.isArray(post.media) && post.media.length > 0 && (
                          <div className="mt-4">
                            {post.media.map((media, index) => (
                              <img
                                key={index}
                                src={media.mediaUrl}
                                alt=""
                                className="rounded-lg max-h-96 w-full object-cover"
                              />
                            ))}
                          </div>
                        )}
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                          <span>{post.reactions?.totalCount || 0} reactions</span>
                          <span>{post.commentCount || 0} comments</span>
                          <span>{post.shareCount || 0} shares</span>
                        </div>
                      </div>
                    ))}
                    
                    {publicPostsLoading && (
                      <>
                        {isRetryingPublicPosts && publicPostsRetryCount > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-center space-x-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-600 border-t-transparent"></div>
                              <div className="text-sm text-yellow-800">
                                <p className="font-medium">Kết nối thất bại. Đang thử lại...</p>
                                <p className="text-xs mt-0.5">Lần thử {publicPostsRetryCount}/3</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {!isRetryingPublicPosts && (
                          <>
                        <PostSkeleton />
                        <PostSkeleton />
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="hidden lg:block lg:col-span-3">
              <div className="space-y-4">
                <RightSidebar suggestedGroups={suggestedGroups} />
              </div>
            </div>
          </div>
        </main>

        <AuthModal
          isOpen={showAuthModal}
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Header showSearch={true} showUserMenu={true} />
      <main className="w-full py-4 px-1 sm:px-2 lg:px-4 xl:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 xl:gap-6 max-w-none">
          <div className="hidden lg:block lg:col-span-2">
            <Sidebar />
          </div>
          
          <div className="lg:col-span-7">
            <CreatePost onCreatePost={handleCreatePost} />
            <UserFeed
              className="space-y-4"
              onDeletePost={(postId) => {
                // This will be handled internally by UserFeed for authenticated users
                console.log('Post deleted:', postId);
              }}
            />
          </div>
          
          <div className="hidden lg:block lg:col-span-3">
            <div className="space-y-4">
              <RightSidebar suggestedGroups={suggestedGroups} />
              {isAuthenticated && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Messages</h3>
                  <MessagingNavigation 
                    showSearch={true}
                    showCreateButton={true}
                    maxConversations={3}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
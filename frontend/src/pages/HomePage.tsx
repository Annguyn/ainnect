import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { AuthModal } from '../components/auth';
import { Button } from '../components/ui';
import { CreatePost } from '../components/CreatePost';
import { PostCard } from '../components/PostCard';
import { PublicPostCard } from '../components/PublicPostCard';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { RightSidebar } from '../components/RightSidebar';
import { EmptyState } from '../components/EmptyState';
import { Link } from 'react-router-dom';
import type { ReactionType } from '../components/ReactionPicker';
import { debugLogger } from '../utils/debugLogger';
import { postService, Post } from '../services/postService';


const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const {
    posts,
    isLoading,
    error,
    createPost,
    reactToPost,
    unreactToPost,
    addComment,
    sharePost,
    deletePost,
    refreshPosts,
  } = usePosts();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // State for public posts (for unauthenticated users)
  const [publicPosts, setPublicPosts] = useState<Post[]>([]);
  const [publicPostsLoading, setPublicPostsLoading] = useState(false);
  const [publicPostsError, setPublicPostsError] = useState<string | null>(null);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    debugLogger.logButtonClick('Auth Modal Open', { mode });
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Listen for auth modal events from Header component
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

  // Fetch public posts for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const fetchPublicPosts = async () => {
        setPublicPostsLoading(true);
        setPublicPostsError(null);
        try {
          const response = await postService.getPublicPosts(0, 10);
          setPublicPosts(response.content);
          debugLogger.log('HomePage', 'Public posts loaded successfully', {
            count: response.content.length
          });
        } catch (error) {
          console.error('Failed to fetch public posts:', error);
          setPublicPostsError('Không thể tải nội dung công khai');
          debugLogger.log('HomePage', 'Failed to fetch public posts', error);
        } finally {
          setPublicPostsLoading(false);
        }
      };

      fetchPublicPosts();
    }
  }, [isAuthenticated]);

  const handleCreatePost = async (
    content: string,
    visibility?: 'public_' | 'friends' | 'private_' | 'group',
    mediaFiles?: File[]
  ) => {
    debugLogger.logFormSubmit('Create Post', { content, visibility, mediaFilesCount: mediaFiles?.length || 0 });
    try {
      await createPost(content, visibility as 'public_' | 'friends' | 'private', mediaFiles);
      debugLogger.log('HomePage', 'Post created successfully');
    } catch (error) {
      debugLogger.log('HomePage', 'Failed to create post', error);
      console.error('Failed to create post:', error);
      throw error;
    }
  };

  const handleReaction = (postId: number, reaction: ReactionType) => {
    debugLogger.logButtonClick('React to Post', { postId, reaction });
    reactToPost(postId, reaction);
  };

  const handleUnreact = (postId: number) => {
    debugLogger.logButtonClick('Unreact to Post', { postId });
    unreactToPost(postId);
  };

  const handleComment = async (postId: number, content: string) => {
    debugLogger.logFormSubmit('Add Comment', { postId, content });
    try {
      await addComment(postId, content);
      debugLogger.log('HomePage', 'Comment added successfully', { postId });
    } catch (error) {
      debugLogger.log('HomePage', 'Failed to add comment', error);
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const handleShare = (postId: number) => {
    debugLogger.logButtonClick('Share Post', { postId });
    sharePost(postId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <Header showSearch={true} showUserMenu={true} />
        <main className="w-full py-4 px-1 sm:px-2 lg:px-4 xl:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 xl:gap-6 max-w-none">
            {/* Left Sidebar - Hidden on mobile, 2 columns on desktop */}
            <div className="hidden lg:block lg:col-span-2">
              <Sidebar />
            </div>
            
            {/* Main Content - 7 columns on desktop, full width on mobile */}
            <div className="lg:col-span-7">
              {/* Auth prompt instead of CreatePost */}
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
                {publicPostsLoading ? (
                  <EmptyState type="loading" />
                ) : publicPostsError ? (
                  <EmptyState
                    type="error"
                    description={publicPostsError}
                    onButtonClick={() => window.location.reload()}
                  />
                ) : publicPosts.length === 0 ? (
                  <EmptyState
                    type="empty"
                    title="Chưa có bài viết công khai"
                    description="Hãy đăng ký để bắt đầu chia sẻ và khám phá nội dung từ cộng đồng"
                    buttonText="Tham gia ngay"
                    onButtonClick={() => handleOpenAuth('register')}
                  />
                ) : (
                  publicPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onReaction={() => handleOpenAuth('login')}
                      onUnreact={() => handleOpenAuth('login')}
                      onComment={async () => { handleOpenAuth('login'); }}
                      onShare={() => handleOpenAuth('login')}
                      onDelete={() => {}}
                      currentUser={null}
                    />
                  ))
                )}
              </div>
            </div>
            
            {/* Right Sidebar - Hidden on mobile, 3 columns on desktop */}
            <div className="hidden lg:block lg:col-span-3">
              <RightSidebar />
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
          {/* Left Sidebar - Hidden on mobile, 2 columns on desktop */}
          <div className="hidden lg:block lg:col-span-2">
            <Sidebar />
          </div>
          
          {/* Main Content - 7 columns on desktop, full width on mobile */}
          <div className="lg:col-span-7">
            <CreatePost onCreatePost={handleCreatePost} />
            <div className="space-y-4">
              {isLoading ? (
                <EmptyState type="loading" />
              ) : error ? (
                <EmptyState type="error" description={error} onButtonClick={refreshPosts} />
              ) : posts.length === 0 ? (
                <EmptyState type="empty" onButtonClick={() => document.querySelector('textarea')?.focus()} />
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onReaction={handleReaction}
                    onUnreact={handleUnreact}
                    onComment={handleComment}
                    onShare={handleShare}
                    onDelete={deletePost}
                    currentUser={user}
                  />
                ))
              )}
            </div>
          </div>
          
          {/* Right Sidebar - Hidden on mobile, 3 columns on desktop */}
          <div className="hidden lg:block lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
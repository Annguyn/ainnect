import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { PostCard } from '../components/PostCard';
import { Comments } from '../components/Comments';
import { postService, Post } from '../services/postService';
import { commentService } from '../services/commentService';
import { useAuth } from '../hooks/useAuth';

type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setError('ID bài viết không hợp lệ');
      setLoading(false);
      return;
    }

    loadPost();
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      setError(null);
      const postData = await postService.getPost(parseInt(postId));
      setPost(postData);
    } catch (err: any) {
      console.error('Failed to load post:', err);
      setError(err.message || 'Không thể tải bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPost(updatedPost);
  };

  const handlePostDelete = () => {
    navigate('/');
  };

  const handleReaction = async (postId: number, reactionType: ReactionType) => {
    try {
      await postService.reactToPost(postId, { type: reactionType });
      // Reload post to get updated reaction counts
      loadPost();
    } catch (error) {
      console.error('Failed to react to post:', error);
    }
  };

  const handleUnreact = async (postId: number) => {
    try {
      await postService.unreactPost(postId);
      // Reload post to get updated reaction counts
      loadPost();
    } catch (error) {
      console.error('Failed to unreact post:', error);
    }
  };

  const handleComment = async (postId: number, content: string) => {
    try {
      await commentService.addCommentToPost(postId, {
        content,
        parentId: null
      });
      // Reload post to get updated comment count
      loadPost();
    } catch (error) {
      console.error('Failed to comment on post:', error);
      throw error;
    }
  };

  const handleShare = async (postId: number) => {
    try {
      await postService.sharePost(postId, {});
      // Reload post to get updated share count
      loadPost();
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h2>
            <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem bài viết này</p>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-4 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Quay lại</span>
            </button>

            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-600 mb-4"></div>
                  <p className="text-gray-500">Đang tải bài viết...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải bài viết</h2>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={loadPost}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Thử lại
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Về trang chủ
                    </button>
                  </div>
                </div>
              </div>
            ) : post ? (
              <div className="space-y-6">
                {/* Post Card */}
                <PostCard 
                  post={post}
                  onReaction={handleReaction}
                  onUnreact={handleUnreact}
                  onComment={handleComment}
                  onShare={handleShare}
                  onDelete={handlePostDelete}
                />

                {/* Comments Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Bình luận ({post.commentCount || 0})
                    </h2>
                  </div>
                  <Comments postId={post.id} isVisible={true} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg">Không tìm thấy bài viết</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

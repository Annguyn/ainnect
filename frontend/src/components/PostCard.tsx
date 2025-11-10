import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from './Avatar';
import { Comments } from './Comments';
import { ReactionButton } from './ReactionButton';
import { ReactionsModal } from './ReactionsModal';
import { UserProfileCard } from './UserProfileCard';
import { Post, postService } from '../services/postService';
import { commentService } from '../services/commentService';
import { ShareModal, ReportModal } from './social';
import { useSocial } from '../hooks/useSocial';
import { ReactionPicker, ReactionType } from './ReactionPicker';
import { LinkPreview } from './LinkPreview';
import { debugLogger } from '../utils/debugLogger';
import { 
  getPostAuthorName, 
  getReactionCount, 
  getCommentCount, 
  getShareCount, 
  getPostAuthorForAvatar
} from '../utils/postUtils';

interface PostCardProps {
  post: Post;
  onReaction: (id: number, reaction: ReactionType) => void;
  onUnreact: (id: number) => void;
  onComment: (id: number, content: string) => Promise<void>;
  onShare: (id: number) => void;
  onDelete?: (id: number) => void;
  currentUser?: any;
  currentUserId?: number; // Added currentUserId prop
  className?: string;
  highlight?: string;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onReaction, 
  onUnreact, 
  onComment, 
  onShare, 
  onDelete,
  currentUser,
  currentUserId, // Destructure currentUserId
  className = '',
  highlight
}) => {
  const normalize = (text: string) => (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const renderHighlighted = (content: string, query?: string) => {
    if (!query) return <>{content}</>;
    const normContent = normalize(content);
    const normQuery = normalize(query.trim());
    if (!normQuery) return <>{content}</>;
    const parts: React.ReactNode[] = [];
    let start = 0;
    let index = normContent.indexOf(normQuery, start);
    while (index !== -1) {
      if (index > start) {
        parts.push(<span key={`t-${start}`}>{content.slice(start, index)}</span>);
      }
      parts.push(
        <mark key={`m-${index}`} className="bg-yellow-200 px-0.5 rounded">
          {content.slice(index, index + normQuery.length)}
        </mark>
      );
      start = index + normQuery.length;
      index = normContent.indexOf(normQuery, start);
    }
    parts.push(<span key={`t-end`}>{content.slice(start)}</span>);
    return <>{parts}</>;
  };

  const extractFirstUrl = (text: string): string | null => {
    const match = text.match(/https?:\/\/[^\s]+/i);
    return match ? match[0] : null;
  };
  const navigate = useNavigate();
  const { sharePost, reportPost } = useSocial();
  const [showComments, setShowComments] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [previewComments, setPreviewComments] = useState<any[]>([]);
  const [isLoadingPreviewComments, setIsLoadingPreviewComments] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userProfilePosition, setUserProfilePosition] = useState({ x: 0, y: 0 });
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedContent, setExpandedContent] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const contentRef = useRef<HTMLParagraphElement | null>(null);
  const userAvatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const isOverflowing = el.scrollHeight > el.clientHeight;
      setHasOverflow(isOverflowing);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [post.content]);

  const actualCommentCount = post.commentCount ?? 0;

  useEffect(() => {
    const loadPreviewComments = async () => {
      if (!showComments) return;

      try {
        setIsLoadingPreviewComments(true);
        
        const response = await commentService.getCommentsByPost(post.id, 0, 3);
        setPreviewComments(response.content || []);
        
        debugLogger.log('PostCard', 'Loaded preview comments', { 
          postId: post.id, 
          previewCommentsCount: response.content?.length || 0
        });
      } catch (error) {
        debugLogger.log('PostCard', 'Failed to load preview comments', { 
          postId: post.id, 
          error 
        });
        setPreviewComments([]);
      } finally {
        setIsLoadingPreviewComments(false);
      }
    };

    loadPreviewComments();
  }, [showComments, post.id]);

  const handleUserHover = (e: React.MouseEvent) => {
    if (userAvatarRef.current) {
      const rect = userAvatarRef.current.getBoundingClientRect();
      setUserProfilePosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setShowUserProfile(true);
    }
  };

  const handleUserLeave = () => {
    setShowUserProfile(false);
  };

  const handleUserClick = () => {
    navigate(`/profile/${post.authorId}`);
  };

  const handleShare = async (message?: string) => {
    try {
      await sharePost(post.id, message);
      onShare(post.id);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleReport = async (reason: string, description: string) => {
    try {
      await reportPost(post.id, reason, description);
    } catch (error) {
      console.error('Report error:', error);
    }
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  const handleNextImage = () => {
    if (post.media && currentImageIndex < post.media.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const loadPostReactions = async (postId: number, page: number = 0) => {
    const response = await postService.getPostReactions(postId, page, 10);
    return response.content || [];
  };

  const AnimatedIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="transition-transform duration-300 hover:scale-110">{children}</div>
  );

  const [activeReactionPicker, setActiveReactionPicker] = useState<number | null>(null);
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  
  const OFFSET_Y = 40;     
  const OFFSET_X = 10;        
  const PICKER_W = 280;     
  const PICKER_H = 56;      
  
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
  
  const handleReactionEnter = (e: React.MouseEvent, postId: number) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    console.log('Hovering over ReactionButton, postId:', postId); // Log hover event
    const timeout = setTimeout(() => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height;
      console.log('Showing ReactionPicker at position:', { x, y }); // Log picker position
      setPickerPos({ x, y });
      setActiveReactionPicker(postId);
      console.log('ReactionPicker state set to active for postId:', postId); // Log state change
    }, 500); // Show picker after 500ms
    setHoverTimeout(timeout);
  };
  
  const handleReactionLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    console.log('Hover leave detected, but ReactionPicker will remain open'); // Log hover leave
  }; // Prevent hiding on mouse leave

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(event.target as Node)
      ) {
        console.log('Closing ReactionPicker: Clicked outside'); // Log reason for closing
        setActiveReactionPicker(null);
      }
    };

    if (activeReactionPicker !== null) {
      console.log('Adding click outside listener for ReactionPicker'); // Log listener addition
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        console.log('Removing click outside listener for ReactionPicker'); // Log listener removal
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [activeReactionPicker]);
  
  const handleReactionMove = (e: React.MouseEvent) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
  
    let x = e.clientX;
    let y = e.clientY - 200000;
  
    // Clamp to prevent overflow
    x = clamp(x, 8, vw - PICKER_W - 8);
    y = clamp(y, 8, vh - PICKER_H - 8);
  
    setPickerPos({ x, y });
  };
  
  useEffect(() => {
    const onResize = () => setActiveReactionPicker(null);
    const onScroll = () => {
      if (activeReactionPicker) {
        setActiveReactionPicker(null);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);
  
  const handleReaction = (reaction: ReactionType) => {
    if (post.reactions) {
        const currentReactionType = post.reactions.currentUserReactionType;
        const reactionCounts = post.reactions.reactionCounts;

        if (currentReactionType === reaction) {
            // User is unreacting
            const reactionIndex = reactionCounts.findIndex(r => r.type === reaction);
            if (reactionIndex !== -1) {
                reactionCounts[reactionIndex].count -= 1;
                if (reactionCounts[reactionIndex].count === 0) {
                    reactionCounts.splice(reactionIndex, 1);
                }
            }
            post.reactions.currentUserReacted = false;
            post.reactions.currentUserReactionType = null;
        } else {
            // User is reacting
            if (currentReactionType) {
                // Remove previous reaction
                const previousReactionIndex = reactionCounts.findIndex(r => r.type === currentReactionType);
                if (previousReactionIndex !== -1) {
                    reactionCounts[previousReactionIndex].count -= 1;
                    if (reactionCounts[previousReactionIndex].count === 0) {
                        reactionCounts.splice(previousReactionIndex, 1);
                    }
                }
            }

            const newReactionIndex = reactionCounts.findIndex(r => r.type === reaction);
            if (newReactionIndex !== -1) {
                reactionCounts[newReactionIndex].count += 1;
            } else {
                reactionCounts.push({ type: reaction, count: 1 });
            }
            post.reactions.currentUserReacted = true;
            post.reactions.currentUserReactionType = reaction;
        }

        post.reactions.totalCount = reactionCounts.reduce((sum, r) => sum + r.count, 0);
    }

    onReaction(post.id, reaction);
    setShowReactionsModal(false); // Close the picker after reacting
  };

  const getReactionCount = (post: Post) => {
      if (!post.reactions) return 0;
      return post.reactions.totalCount || 0; // Use totalCount for accurate reaction count
  };

  const isCurrentUserPost = post.authorId === currentUserId; // Check if the post belongs to the current user
  const isPending = (post as any).isPending === true;
  const createFailed = (post as any).createFailed === true;

  const handleDelete = async () => {
    try {
      if (onDelete) {
        await postService.deletePost(post.id);
        onDelete(post.id);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 mb-6 max-w-2xl mx-auto ${className}`}>
      <div className="p-4 flex items-center space-x-3">
        <div
          ref={userAvatarRef}
          onMouseEnter={handleUserHover}
          onMouseLeave={handleUserLeave}
          onClick={handleUserClick}
          className="cursor-pointer"
        >
          <Avatar 
            user={getPostAuthorForAvatar(post)}
            size="lg"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 
              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleUserClick}
            >
              {getPostAuthorName(post)}
              {isPending && (
                <span className="ml-2 inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Đang tạo</span>
              )}
              {createFailed && (
                <span className="ml-2 inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Lỗi đăng</span>
              )}
            </h3>
            {(post.author?.isVerified || post.authorUsername) && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-500">
              @{post.authorUsername || post.author?.username || `user${post.authorId}`} · {new Date(post.createdAt).toLocaleDateString('vi-VN')}
            </p>
            {/* Visibility indicator */}
            <div className="flex items-center space-x-1">
              {/* Debug: Log visibility value */}
              {(() => {
                console.log('PostCard visibility:', post.visibility, 'for post:', post.id);
                return null;
              })()}
              {post.visibility === 'public_' && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span>Công khai</span>
                </div>
              )}
              {post.visibility === 'friends' && (
                <div className="flex items-center space-x-1 text-xs text-blue-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span>Bạn bè</span>
                </div>
              )}
              {post.visibility === 'private' && (
                <div className="flex items-center space-x-1 text-xs text-orange-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Riêng tư</span>
                </div>
              )}
              {/* Fallback for unknown visibility values */}
              {post.visibility && !['public_', 'friends', 'private'].includes(post.visibility) && (
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>{post.visibility}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Enhance header icons for better visibility and aesthetics */}
        <div className="flex items-center space-x-1">
          {currentUser && currentUser.id === post.authorId ? (
            <button 
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                  onDelete?.(post.id);
                }
              }}
              className="p-2 hover:bg-red-100 rounded-full group transition-all duration-300"
              title="Xóa bài viết"
            >
              <svg className="w-6 h-6 text-red-500 group-hover:text-red-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <button 
              onClick={() => setShowReportModal(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300"
              title="Báo cáo bài viết"
            >
              <svg className="w-6 h-6 text-gray-500 hover:text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-3">
        {post.content && (
          <>
            <p
              ref={(el) => { contentRef.current = el; }}
              className={`text-gray-900 leading-relaxed break-words whitespace-pre-wrap ${expandedContent ? '' : 'line-clamp-3'}`}
            >
              {renderHighlighted(post.content, highlight)}
            </p>
            {hasOverflow && (
              <div className="mt-1">
                {!expandedContent ? (
                  <button onClick={() => setExpandedContent(true)} className="text-sm text-blue-600 mt-1 cursor-pointer select-none">Xem thêm</button>
                ) : (
                  <button onClick={() => setExpandedContent(false)} className="text-sm text-blue-600 mt-1 cursor-pointer select-none">Thu gọn</button>
                )}
              </div>
            )}
          </>
        )}
        {extractFirstUrl(post.content) && (
          <div className="mt-3">
            <LinkPreview url={extractFirstUrl(post.content)!} />
          </div>
        )}
      </div>

      {post.images && post.images.length > 0 && (
        <div className="px-4 pb-3">
          <div className={`grid gap-2 ${post.images && post.images.length === 1 ? 'grid-cols-1' : post.images && post.images.length === 2 ? 'grid-cols-2' : post.images && post.images.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {post.images?.slice(0, 4).map((image, index) => (
              <div key={index} className={`${post.images && post.images.length === 3 && index === 0 ? 'col-span-2' : ''} overflow-hidden rounded-lg`}>
                <img
                  src={image}
                  alt={`Post content ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => window.open(image, '_blank')}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {post.media && post.media.length > 0 && (
        <div className="px-4 pb-3">
          <div className={`grid gap-2 ${post.media && post.media.length === 1 ? 'grid-cols-1' : post.media && post.media.length === 2 ? 'grid-cols-2' : post.media && post.media.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {post.media?.slice(0, 4).map((mediaItem, index) => {
              // Don't render if image failed to load
              if (imageErrors.has(index)) return null;
              
              return (
                <div key={index} className={`relative overflow-hidden rounded-lg ${post.media && post.media.length === 3 && index === 0 ? 'col-span-2' : ''}`}>
                  {mediaItem.mediaType === 'video' ? (
                    <video
                      src={mediaItem.mediaUrl}
                      controls
                      className="w-full h-64 object-cover"
                      preload="metadata"
                    >
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  ) : (
                    <img
                      src={mediaItem.mediaUrl}
                      alt={`Post media ${index + 1}`}
                      className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                      onClick={() => handleImageClick(index)}
                      onError={() => handleImageError(index)}
                    />
                  )}
                  {index === 3 && post.media && post.media.length > 4 && (
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center cursor-pointer"
                      onClick={() => handleImageClick(index)}
                    >
                      <span className="text-white text-3xl font-bold">+{post.media.length - 4}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100">
        <div className={`flex items-center space-x-4 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
          <button
            onClick={() => {
              if (getReactionCount(post) > 0) {
                debugLogger.logButtonClick('Reaction Count Click', { postId: post.id, count: getReactionCount(post) });
                setShowReactionsModal(true);
              }
            }}
            className={`hover:text-blue-600 transition-colors ${getReactionCount(post) > 0 ? 'cursor-pointer hover:underline' : 'cursor-default'}`}
          disabled={getReactionCount(post) === 0}
        >
          {getReactionCount(post) > 0 ? `${getReactionCount(post)} lượt thích` : 'Chưa có lượt thích'}
        </button>
        <span>
          {actualCommentCount > 0 ? `${actualCommentCount} bình luận` : 'Không có bình luận nào'}
        </span>
      </div>
      <span>{getShareCount(post) > 0 ? `${getShareCount(post)} lượt chia sẻ` : 'Chưa có chia sẻ'}</span>
    </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div
          className={`relative ${isPending ? 'pointer-events-none opacity-70' : ''}`}
          onMouseEnter={(e) => !isPending && handleReactionEnter(e, post.id)}
          onMouseMove={handleReactionMove}
        >
          <ReactionButton
            postId={post.id} // Added postId prop
            currentReaction={post.userReaction as ReactionType}
            onReaction={(reaction) => onReaction(post.id, reaction)}
            onUnreact={() => onUnreact(post.id)}
            reactionCount={getReactionCount(post)}
            reactions={post.reactions}
          />
        
        </div>
        
        <button
          onClick={() => {
            debugLogger.logButtonClick('Toggle Comments', { postId: post.id, currentlyVisible: showComments });
            setShowComments(!showComments);
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
            showComments ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className={showComments ? 'font-semibold' : ''}>
            {showComments ? 'Ẩn bình luận' : 'Bình luận'}
          </span>
        </button>

        <button
          onClick={() => {
            debugLogger.logButtonClick('Share Post', { postId: post.id });
            setShowShareModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* Handle case when there are no comments */}
      {!showComments && actualCommentCount !== null && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          {isLoadingPreviewComments ? (
            <div className="text-center text-gray-500 text-sm py-2">
              <div className="animate-pulse">Đang tải bình luận...</div>
            </div>
          ) : actualCommentCount > 0 ? (
            <div className="space-y-3">
              {previewComments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar 
                    user={comment.author}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.author?.displayName || comment.author?.username || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
              {actualCommentCount > 3 && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowComments(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  >
                    Xem tất cả {actualCommentCount} bình luận
                  </button>
                </div>
              )}
              {actualCommentCount <= 3 && actualCommentCount > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowComments(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  >
                    Xem bình luận
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm py-2">
              Chưa có bình luận nào, hãy là người đầu tiên bình luận.
            </div>
          )}
        </div>
      )}

      {/* Comments Section */}
      <Comments
        postId={post.id}
        isVisible={showComments}
        initialComments={previewComments}
        onCommentAdded={() => {
          // Comment count will be updated from parent component
        }}
        onCommentCountUpdate={(count) => {
          // Comment count is managed by the post data from API
          // Parent component should refresh the post data if needed
        }}
      />      {/* Reactions Modal */}
      <ReactionsModal
        isVisible={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        postId={post.id}
        reactions={post.reactions}
        onLoadReactions={loadPostReactions}
      />

      {/* User Profile Card */}
      <UserProfileCard
        user={{
          id: post.authorId,
          username: post.authorUsername || post.author?.username || `user${post.authorId}`,
          displayName: getPostAuthorName(post),
          avatarUrl: post.authorAvatarUrl || post.author?.avatarUrl || undefined
        }}
        isVisible={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        position={userProfilePosition}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
        postId={post.id}
        postContent={post.content}
        postAuthor={getPostAuthorName(post)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReport={handleReport}
        targetType="POST"
        targetId={post.id}
        targetName={getPostAuthorName(post)}
      />

      {/* Image Viewer Modal */}
      {showImageViewer && post.media && post.media.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setShowImageViewer(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowImageViewer(false);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {currentImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePreviousImage();
              }}
              className="absolute left-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="max-w-7xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={post.media[currentImageIndex]?.mediaUrl}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <div className="text-center text-white mt-4">
              <p className="text-sm">
                {currentImageIndex + 1} / {post.media.filter((_, idx) => !imageErrors.has(idx)).length}
              </p>
            </div>
          </div>

          {/* Next Button */}
          {currentImageIndex < post.media.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};


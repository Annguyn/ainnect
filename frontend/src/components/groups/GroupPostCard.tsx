import React from 'react';
import { Post } from '../../services/postService';
import { Avatar } from '../Avatar';

interface GroupPostCardProps {
  post: Post;
  onReact?: (postId: number) => Promise<void>;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
}

export const GroupPostCard: React.FC<GroupPostCardProps> = ({
  post,
  onReact,
  onComment,
  onShare
}) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleReact = async () => {
    if (onReact) {
      await onReact(post.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar
            user={{
              avatarUrl: post.authorAvatarUrl,
              displayName: post.authorDisplayName,
              userId: post.authorId
            }}
            size="md"
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {post.authorDisplayName}
              </h3>
              <span className="text-gray-500 text-sm">@{post.authorUsername}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <time dateTime={post.createdAt}>
                {formatTimeAgo(post.createdAt)}
              </time>
              <span>•</span>
              <span className="inline-flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v11h1a1 1 0 110 2h-1v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1H4a1 1 0 110-2h1V3zm2-1h6v12H7V2zm1 14a1 1 0 100 2h4a1 1 0 100-2H8z" />
                </svg>
                Nhóm
              </span>
              <span>•</span>
              {/* Visibility indicator */}
              <div className="flex items-center space-x-1">
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-[15px]">
          {post.content}
        </p>
      </div>

      {/* Post Media */}
      {post.media && post.media.length > 0 && (
        <div className="mb-1">
          <div className={`grid ${
            post.media.length === 1 ? 'grid-cols-1' :
            post.media.length === 2 ? 'grid-cols-2' :
            post.media.length === 3 ? 'grid-cols-2' :
            'grid-cols-2'
          } gap-1`}>
            {post.media.slice(0, 4).map((media, index) => (
              <div
                key={media.id}
                className={`relative ${
                  post.media && post.media.length === 3 && index === 0 ? 'col-span-2' : ''
                } ${
                  post.media && post.media.length === 1 ? 'max-h-[700px]' :
                  post.media && post.media.length === 2 ? 'max-h-[400px]' :
                  post.media && post.media.length >= 3 ? 'max-h-[300px]' : ''
                }`}
              >
                {media.mediaType === 'image' ? (
                  <img
                    src={media.mediaUrl}
                    alt={`Media ${index + 1}`}
                    className={`w-full h-full object-cover ${
                      post.media && post.media.length === 1 ? 'rounded-none' :
                      index === 0 ? 'rounded-tl-lg' :
                      index === 1 && post.media && post.media.length === 2 ? 'rounded-tr-lg' :
                      index === 1 && post.media && post.media.length >= 3 ? 'rounded-tr-lg' :
                      index === 2 ? 'rounded-bl-lg' :
                      index === 3 ? 'rounded-br-lg' : ''
                    }`}
                  />
                ) : (
                  <video
                    src={media.mediaUrl}
                    className={`w-full h-full object-cover ${
                      post.media && post.media.length === 1 ? 'rounded-none' :
                      index === 0 ? 'rounded-tl-lg' :
                      index === 1 ? 'rounded-tr-lg' :
                      index === 2 ? 'rounded-bl-lg' :
                      index === 3 ? 'rounded-br-lg' : ''
                    }`}
                    controls
                    preload="none"
                  />
                )}
                {post.media && post.media.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors rounded-br-lg">
                    <span className="text-white text-xl font-semibold">
                      +{post.media.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Stats & Actions */}
      <div className="px-4 py-1">
        {/* Reaction & Comment Counts */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center space-x-2">
            {post.reactions && post.reactions.totalCount > 0 && (
              <div className="flex -space-x-1">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 9h3l-4-4-4 4h3v6H9l4 4 4-4h-3z" />
                  </svg>
                </div>
                {post.reactions.reactionCounts.some(r => r.type === 'love') && (
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                )}
              </div>
            )}
            <span>{post.reactions?.totalCount || post.reactionCount || 0}</span>
          </div>
          <div className="space-x-3 text-gray-500">
            <span>{post.commentCount || 0} bình luận</span>
            <span>{post.shareCount || 0} chia sẻ</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-100 -mx-4 px-4">
          <div className="flex items-center justify-between py-1">
            <button
              onClick={handleReact}
              className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-lg transition-colors ${
                post.reactions?.currentUserReacted
                  ? 'text-blue-600 hover:bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span className="font-medium">Thích</span>
            </button>
            <button
              onClick={() => onComment?.(post.id)}
              className="flex-1 flex items-center justify-center space-x-2 p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">Bình luận</span>
            </button>
            <button
              onClick={() => onShare?.(post.id)}
              className="flex-1 flex items-center justify-center space-x-2 p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="font-medium">Chia sẻ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
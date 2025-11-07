import React from 'react';
import { Post } from '../services/postService';
import { Avatar } from './Avatar';

interface PublicPostCardProps {
  post: Post;
}

export const PublicPostCard: React.FC<PublicPostCardProps> = ({ post }) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
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
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
                Công khai
              </span>
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
            <div className="flex -space-x-1">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 9h3l-4-4-4 4h3v6H9l4 4 4-4h-3z" />
                </svg>
              </div>
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
            <span className="text-sm text-gray-500">{post.reactions?.totalCount || 0}</span>
          </div>
          <div className="space-x-3 text-gray-500">
            <span>{post.commentCount || 0} bình luận</span>
            <span>{post.shareCount || 0} chia sẻ</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-100 -mx-4 px-4">
          <div className="flex items-center justify-between py-1">
            <button className="flex-1 flex items-center justify-center space-x-2 p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span className="font-medium">Thích</span>
            </button>
            <button className="flex-1 flex items-center justify-center space-x-2 p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">Bình luận</span>
            </button>
            <button className="flex-1 flex items-center justify-center space-x-2 p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
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
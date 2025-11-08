import React from 'react';
import { PostDetail } from '../../types/admin';
import { cn } from '../../lib/utils';
import { getMediaType } from '../../utils/mediaUtils';

interface PostCardProps {
  post: PostDetail;
  onSelect: (post: PostDetail) => void;
}

const getVisibilityBadge = (visibility: string) => {
  switch (visibility) {
    case 'public_':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 112 0 1 1 0 01-2 0zm4 0a1 1 0 112 0 1 1 0 01-2 0zm-5 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
          </svg>
          Công khai
        </span>
      );
    case 'friends':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          Bạn bè
        </span>
      );
    case 'private_':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Riêng tư
        </span>
      );
    case 'group':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          Nhóm
        </span>
      );
    default:
      return null;
  }
};

export const PostCard: React.FC<PostCardProps> = ({ post, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(post)}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {post.displayName[0]}
            </div>
            <div>
              <p className="font-medium text-gray-900">{post.displayName}</p>
              <p className="text-sm text-gray-500">@{post.username}</p>
            </div>
          </div>
          {getVisibilityBadge(post.visibility)}
        </div>

        <p className="text-gray-900 mb-4 line-clamp-3">{post.content}</p>

        {((post.media && post.media.length > 0) || (post.mediaUrls && post.mediaUrls.length > 0 && post.mediaUrls[0])) && (
          <div className="mb-4 rounded-lg overflow-hidden">
            {post.media && post.media.length > 0 ? (
              <>
                {post.media[0].mediaType === 'video' ? (
                  <video
                    className="w-full h-48 object-cover bg-black"
                    controls
                    playsInline
                    preload="metadata"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Video load error:', post.media![0].mediaUrl, e);
                    }}
                  >
                    <source src={post.media[0].mediaUrl} type="video/mp4" />
                    <source src={post.media[0].mediaUrl} type="video/webm" />
                    <source src={post.media[0].mediaUrl} type="video/avi" />
                    <p className="text-white p-4">
                      Trình duyệt không hỗ trợ định dạng video này. 
                      <a href={post.media[0].mediaUrl} className="underline" target="_blank" rel="noopener noreferrer">
                        Tải xuống video
                      </a>
                    </p>
                  </video>
                ) : (
                  <img
                    src={post.media[0].mediaUrl}
                    alt="Post media"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                {post.media.length > 1 && (
                  <div className="mt-2 text-sm text-gray-500">
                    +{post.media.length - 1} media khác
                  </div>
                )}
              </>
            ) : post.mediaUrls && post.mediaUrls[0] && (
              <>
                {getMediaType(post.mediaUrls[0]) === 'video' ? (
                  <video
                    className="w-full h-48 object-cover bg-black"
                    controls
                    playsInline
                    preload="metadata"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Video load error:', post.mediaUrls![0], e);
                    }}
                  >
                    <source src={post.mediaUrls[0]} type="video/mp4" />
                    <source src={post.mediaUrls[0]} type="video/webm" />
                    <p className="text-white p-4">
                      Trình duyệt không hỗ trợ định dạng video này.
                    </p>
                  </video>
                ) : (
                  <img
                    src={post.mediaUrls[0]}
                    alt="Post media"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                {post.mediaUrls.length > 1 && (
                  <div className="mt-2 text-sm text-gray-500">
                    +{post.mediaUrls.length - 1} media khác
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{post.totalLikes}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span>{post.totalComments}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            <span>{post.totalShares}</span>
          </div>
          {post.totalReports > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{post.totalReports} báo cáo</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 text-sm text-gray-500">
          <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(post);
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};


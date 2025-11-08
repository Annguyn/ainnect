import React from 'react';
import { CommunityDetail } from '../../types/admin';
import { cn } from '../../lib/utils';

interface CommunityCardProps {
  community: CommunityDetail;
  onSelect: (community: CommunityDetail) => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(community)}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
        {community.coverUrl ? (
          <img
            src={community.coverUrl}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white text-6xl font-bold">
            {community.name[0]}
          </div>
        )}
        <div className="absolute top-4 right-4">
          {community.privacy === 'public_' ? (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 112 0 1 1 0 01-2 0zm4 0a1 1 0 112 0 1 1 0 01-2 0zm-5 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
              </svg>
              Công khai
            </span>
          ) : (
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Riêng tư
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{community.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{community.description}</p>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="font-medium">{community.totalMembers}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{community.totalPosts}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm">
            <p className="text-gray-500">Người tạo</p>
            <p className="font-medium text-gray-900">{community.creatorName}</p>
          </div>
          <div className="text-sm text-right">
            <p className="text-gray-500">Ngày tạo</p>
            <p className="font-medium text-gray-900">
              {new Date(community.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


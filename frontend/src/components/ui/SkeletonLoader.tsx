import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rectangle' | 'card' | 'avatar-text';
  width?: string;
  height?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'rectangle',
  width = 'w-full',
  height = 'h-4',
  count = 1
}) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'rounded',
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
    card: 'rounded-xl',
    'avatar-text': ''
  };

  const renderSkeleton = (index: number) => {
    if (variant === 'avatar-text') {
      return (
        <div key={index} className="flex items-center space-x-3 mb-3">
          <div className={`${baseClasses} w-10 h-10 rounded-full flex-shrink-0`} />
          <div className="flex-1 space-y-2">
            <div className={`${baseClasses} h-4 rounded w-3/4`} />
            <div className={`${baseClasses} h-3 rounded w-1/2`} />
          </div>
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`${baseClasses} ${variantClasses[variant]} ${width} ${height} ${className}`}
      />
    );
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
    </>
  );
};

// Specific skeleton components for common use cases
export const FriendCardSkeleton: React.FC = () => (
  <div className="aspect-square bg-gray-100 rounded-lg p-2 animate-pulse">
    <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-lg bg-[length:200%_100%]" />
  </div>
);

export const PhotoGridSkeleton: React.FC<{ count?: number }> = ({ count = 9 }) => (
  <div className="grid grid-cols-3 gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden animate-pulse">
        <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
      </div>
    ))}
  </div>
);

export const PostCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
    {/* Header */}
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse bg-[length:200%_100%]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/3 animate-pulse bg-[length:200%_100%]" />
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/4 animate-pulse bg-[length:200%_100%]" />
      </div>
    </div>
    
    {/* Content */}
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-full animate-pulse bg-[length:200%_100%]" />
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-5/6 animate-pulse bg-[length:200%_100%]" />
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-4/6 animate-pulse bg-[length:200%_100%]" />
    </div>
    
    {/* Image placeholder */}
    <div className="h-64 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-lg mb-4 animate-pulse bg-[length:200%_100%]" />
    
    {/* Actions */}
    <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
      <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 animate-pulse bg-[length:200%_100%]" />
      <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 animate-pulse bg-[length:200%_100%]" />
      <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 animate-pulse bg-[length:200%_100%]" />
    </div>
  </div>
);

export const ProfileHeaderSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 mb-6 overflow-hidden animate-pulse">
    {/* Cover */}
    <div className="h-64 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
    
    {/* Profile info */}
    <div className="px-6 pb-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-8">
        <div className="relative -mt-24 mb-4 lg:mb-0">
          <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-gray-300 via-gray-400 to-gray-300 shadow-2xl bg-[length:200%_100%]" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/3 bg-[length:200%_100%]" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/4 bg-[length:200%_100%]" />
          <div className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl w-3/4 bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  </div>
);

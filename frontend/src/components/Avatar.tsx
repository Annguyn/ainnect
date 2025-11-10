import React from 'react';
import { getAvatarProps } from '../utils/avatarUtils';

interface AvatarProps {
  user?: {
    avatarUrl?: string | null;
    displayName?: string;
    userId?: number;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm', 
  lg: 'w-10 h-10 text-base',
  xl: 'w-12 h-12 text-lg'
};

export const Avatar: React.FC<AvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '' 
}) => {
  const avatarProps = getAvatarProps(user);
  const sizeClass = sizeClasses[size];
  const [imageError, setImageError] = React.useState(false);
  
  // If image failed or no image, show initials
  if (avatarProps.type === 'initials' || imageError) {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 shadow-md ${className}`}
        style={{ background: avatarProps.backgroundColor }}
        title={avatarProps.alt}
      >
        {avatarProps.initials}
      </div>
    );
  }
  
  // Try to load image first
  return (
    <img
      src={avatarProps.src}
      alt={avatarProps.alt}
      className={`${sizeClass} rounded-full object-cover flex-shrink-0 shadow-md ${className}`}
      onError={() => setImageError(true)}
    />
  );
};

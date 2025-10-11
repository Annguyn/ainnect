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
  
  if (avatarProps.type === 'image') {
    return (
      <img
        src={avatarProps.src}
        alt={avatarProps.alt}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          const parent = target.parentElement;
          if (parent) {
            const fallbackProps = getAvatarProps({
              displayName: user?.displayName,
              userId: user?.userId
            });
            
            if (fallbackProps.type === 'initials') {
              parent.innerHTML = `
                <div class="${sizeClass} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0 ${className}" 
                     style="background-color: ${fallbackProps.backgroundColor}">
                  ${fallbackProps.initials}
                </div>
              `;
            }
          }
        }}
      />
    );
  }
  
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0 ${className}`}
      style={{ backgroundColor: avatarProps.backgroundColor }}
      title={avatarProps.alt}
    >
      {avatarProps.initials}
    </div>
  );
};

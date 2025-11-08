import React from 'react';
import { Interest } from '../../services/profileService';
import { Heart, Tag } from 'lucide-react';
import { cn } from '../../utils/cn';

interface InterestCardProps {
  interest: Interest;
  className?: string;
}

export const InterestCard: React.FC<InterestCardProps> = ({ interest, className }) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm",
        "border border-gray-200 dark:border-gray-700",
        "hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {interest.imageUrl ? (
          <img
            src={interest.imageUrl}
            alt={interest.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
            <Heart className="w-8 h-8 text-accent-600 dark:text-accent-400" />
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {interest.name}
          </h3>
          
          {interest.category && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
              <Tag className="w-4 h-4" />
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                {interest.category}
              </span>
            </div>
          )}

          {interest.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {interest.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


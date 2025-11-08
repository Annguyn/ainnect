import React from 'react';
import { WorkExperience } from '../../services/profileService';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';

interface WorkExperienceCardProps {
  work: WorkExperience;
  className?: string;
}

export const WorkExperienceCard: React.FC<WorkExperienceCardProps> = ({ work, className }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

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
        {work.imageUrl ? (
          <img
            src={work.imageUrl}
            alt={work.companyName}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {work.position}
          </h3>
          <p className="text-base text-gray-700 dark:text-gray-300 mt-1">
            {work.companyName}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(work.startDate)} - {work.isCurrent ? 'Present' : formatDate(work.endDate)}
              </span>
              {work.isCurrent && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                  Current
                </span>
              )}
            </div>
          </div>

          {work.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
              <MapPin className="w-4 h-4" />
              <span>{work.location}</span>
            </div>
          )}

          {work.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
              {work.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


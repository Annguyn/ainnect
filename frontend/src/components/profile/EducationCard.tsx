import React from 'react';
import { Education } from '../../services/profileService';
import { GraduationCap, Calendar, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EducationCardProps {
  education: Education;
  className?: string;
}

export const EducationCard: React.FC<EducationCardProps> = ({ education, className }) => {
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
        {education.imageUrl ? (
          <img
            src={education.imageUrl}
            alt={education.schoolName}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {education.schoolName}
          </h3>
          <p className="text-base text-gray-700 dark:text-gray-300 mt-1">
            {education.degree} - {education.fieldOfStudy}
          </p>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(education.startDate)} - {education.isCurrent ? 'Present' : formatDate(education.endDate)}
            </span>
            {education.isCurrent && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                Current
              </span>
            )}
          </div>

          {education.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
              {education.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


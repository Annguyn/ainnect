import React from 'react';
import { Location } from '../../services/profileService';
import { MapPin, Home, Building2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LocationCardProps {
  location: Location;
  className?: string;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, className }) => {
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'current':
        return MapPin;
      case 'hometown':
        return Home;
      case 'work':
      case 'education':
        return Building2;
      default:
        return MapPin;
    }
  };

  const Icon = getLocationIcon(location.locationType);

  const getLocationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      current: 'Current Location',
      hometown: 'Hometown',
      work: 'Work',
      education: 'Education',
      other: 'Other'
    };
    return labels[type] || type;
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
        {location.imageUrl ? (
          <img
            src={location.imageUrl}
            alt={location.locationName}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-tertiary-100 dark:bg-tertiary-900 flex items-center justify-center">
            <Icon className="w-8 h-8 text-tertiary-600 dark:text-tertiary-400" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {location.locationName}
            </h3>
            {location.isCurrent && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                Current
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {getLocationTypeLabel(location.locationType)}
          </p>

          {location.address && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {location.address}
            </p>
          )}

          {location.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {location.description}
            </p>
          )}

          {(location.latitude && location.longitude) && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


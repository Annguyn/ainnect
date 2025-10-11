import React from 'react';
import { CompleteProfile } from '../../services/profileService';
import { User } from '../../types';
import { cn } from '../../lib/utils';

interface ProfileOverviewProps {
  user: User;
  completeProfile?: CompleteProfile | null;
  isEditable?: boolean;
  className?: string;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  user,
  completeProfile,
  isEditable = false,
  className
}) => {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Arts': '🎨',
      'Sports': '⚽',
      'Technology': '💻',
      'Music': '🎵',
      'Travel': '✈️',
      'Food': '🍕',
      'Books': '📚',
      'Movies': '🎬',
      'Gaming': '🎮',
      'Photography': '📸',
      'Fitness': '💪',
      'Nature': '🌿'
    };
    return icons[category] || '🎯';
  };

  const getLocationTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'current': '🏠',
      'hometown': '🏘️',
      'work': '🏢',
      'education': '🎓',
      'other': '📍'
    };
    return icons[type] || '📍';
  };

  const getLocationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'current': 'Hiện tại',
      'hometown': 'Quê quán',
      'work': 'Làm việc',
      'education': 'Học tập',
      'other': 'Khác'
    };
    return labels[type] || type;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Education Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">🎓</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Học vấn</h3>
              <p className="text-sm text-gray-500">
                {completeProfile?.educations?.length || 0} trường học
              </p>
            </div>
          </div>
          
          {completeProfile?.educations && completeProfile.educations.length > 0 ? (
            <div className="space-y-3">
              {completeProfile.educations.slice(0, 2).map((education) => (
                <div key={education.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {education.imageUrl ? (
                    <img
                      src={education.imageUrl}
                      alt={`${education.schoolName} logo`}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border border-gray-200 flex items-center justify-center ${education.imageUrl ? 'hidden' : ''}`}>
                    <span className="text-lg">🎓</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {education.schoolName}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {education.degree} - {education.fieldOfStudy}
                    </p>
                    <p className="text-xs text-gray-500">
                      {education.isCurrent ? 'Hiện tại' : `${education.startDate} - ${education.endDate || 'Hiện tại'}`}
                    </p>
                  </div>
                </div>
              ))}
              {completeProfile.educations.length > 2 && (
                <p className="text-xs text-gray-500 text-center">
                  +{completeProfile.educations.length - 2} trường khác
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Chưa có thông tin học vấn</p>
              {isEditable && (
                <button className="text-xs text-blue-600 hover:text-blue-800 mt-2">
                  Thêm thông tin học vấn
                </button>
              )}
            </div>
          )}
        </div>

        {/* Work Experience Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💼</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Kinh nghiệm</h3>
              <p className="text-sm text-gray-500">
                {completeProfile?.workExperiences?.length || 0} công ty
              </p>
            </div>
          </div>
          
          {completeProfile?.workExperiences && completeProfile.workExperiences.length > 0 ? (
            <div className="space-y-3">
              {completeProfile.workExperiences.slice(0, 2).map((work) => (
                <div key={work.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {work.imageUrl ? (
                    <img
                      src={work.imageUrl}
                      alt={`${work.companyName} logo`}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg border border-gray-200 flex items-center justify-center ${work.imageUrl ? 'hidden' : ''}`}>
                    <span className="text-lg">💼</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {work.companyName}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {work.position}
                    </p>
                    <p className="text-xs text-gray-500">
                      {work.isCurrent ? 'Hiện tại' : `${work.startDate} - ${work.endDate || 'Hiện tại'}`}
                    </p>
                  </div>
                </div>
              ))}
              {completeProfile.workExperiences.length > 2 && (
                <p className="text-xs text-gray-500 text-center">
                  +{completeProfile.workExperiences.length - 2} công ty khác
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Chưa có thông tin kinh nghiệm</p>
              {isEditable && (
                <button className="text-xs text-blue-600 hover:text-blue-800 mt-2">
                  Thêm kinh nghiệm làm việc
                </button>
              )}
            </div>
          )}
        </div>

        {/* Current Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">📍</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Địa điểm</h3>
              <p className="text-sm text-gray-500">
                {completeProfile?.locations?.length || 0} địa điểm
              </p>
            </div>
          </div>
          
          {completeProfile?.locations && completeProfile.locations.length > 0 ? (
            <div className="space-y-3">
              {completeProfile.locations.filter(loc => loc.isCurrent).slice(0, 1).map((location) => (
                <div key={location.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {location.imageUrl ? (
                    <img
                      src={location.imageUrl}
                      alt={`${location.locationName} image`}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg border border-gray-200 flex items-center justify-center ${location.imageUrl ? 'hidden' : ''}`}>
                    <span className="text-lg">{getLocationTypeIcon(location.locationType)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {location.locationName}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {getLocationTypeLabel(location.locationType)}
                    </p>
                    {location.address && (
                      <p className="text-xs text-gray-500 truncate">
                        {location.address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {completeProfile.locations.filter(loc => loc.isCurrent).length === 0 && completeProfile.locations.length > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg border border-gray-200 flex items-center justify-center">
                    <span className="text-lg">{getLocationTypeIcon(completeProfile.locations[0].locationType)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {completeProfile.locations[0].locationName}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {getLocationTypeLabel(completeProfile.locations[0].locationType)}
                    </p>
                  </div>
                </div>
              )}
              {completeProfile.locations.length > 1 && (
                <p className="text-xs text-gray-500 text-center">
                  +{completeProfile.locations.length - 1} địa điểm khác
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Chưa có thông tin địa điểm</p>
              {isEditable && (
                <button className="text-xs text-blue-600 hover:text-blue-800 mt-2">
                  Thêm địa điểm
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interests Grid */}
      {completeProfile?.interests && completeProfile.interests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-xl">🎯</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sở thích</h3>
              <p className="text-sm text-gray-500">
                {completeProfile.interests.length} sở thích
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {completeProfile.interests.slice(0, 8).map((interest) => (
              <div key={interest.id} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                {interest.imageUrl ? (
                  <img
                    src={interest.imageUrl}
                    alt={`${interest.name} image`}
                    className="w-8 h-8 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg border border-gray-200 flex items-center justify-center ${interest.imageUrl ? 'hidden' : ''}`}>
                  <span className="text-sm">{getCategoryIcon(interest.category)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {interest.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {interest.category}
                  </p>
                </div>
              </div>
            ))}
            {completeProfile.interests.length > 8 && (
              <div className="flex items-center justify-center p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500">
                  +{completeProfile.interests.length - 8} khác
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <span className="text-indigo-600 text-xl">👤</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
            <p className="text-sm text-gray-500">Chi tiết về bản thân</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.email && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">📧</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          {user.phone && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">📱</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Số điện thoại</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{user.phone}</p>
              </div>
            </div>
          )}
          
          {user.location && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">📍</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Địa chỉ</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{user.location}</p>
              </div>
            </div>
          )}
          
          {user.birthday && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <span className="text-pink-600 text-sm">🎂</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Ngày sinh</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(user.birthday).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          )}
          
          {user.gender && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-sm">⚧</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Giới tính</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{user.gender}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 text-sm">📅</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Tham gia</p>
              <p className="text-sm font-semibold text-gray-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

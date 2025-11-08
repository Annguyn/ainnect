import React, { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { 
  Location, 
  CreateLocationRequest, 
  UpdateLocationRequest,
  getUserLocations
} from '../../services/profileService';
import { Button } from '../ui/Button';
import { LocationForm } from './LocationForm';
import { debugLogger } from '../../utils/debugLogger';

interface LocationsSectionProps {
  userId?: number;
  isEditable?: boolean;
}

export const LocationsSection: React.FC<LocationsSectionProps> = ({ 
  userId, 
  isEditable = false 
}) => {
  const { 
    createLocation,
    updateLocation,
    deleteLocation
  } = useProfile();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLocations = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getUserLocations(userId);
        setLocations(data);
      } catch (err) {
        console.error('Failed to load locations:', err);
        setError('Không thể tải thông tin địa điểm');
      } finally {
        setIsLoading(false);
      }
    };

    loadLocations();
  }, [userId]);

  const handleCreateLocation = async (data: CreateLocationRequest) => {
    setIsSubmitting(true);
    try {
      await createLocation(data);
      debugLogger.log('LocationsSection', 'Location created successfully');
      setShowAddForm(false);
      
      // Reload locations after save
      if (userId) {
        const fetchedData = await getUserLocations(userId);
        setLocations(fetchedData);
      }
    } catch (error) {
      debugLogger.log('LocationsSection', 'Failed to create location', { error });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLocation = async (data: UpdateLocationRequest) => {
    if (!editingLocation) return;
    
    setIsSubmitting(true);
    try {
      await updateLocation(editingLocation.id, data);
      debugLogger.log('LocationsSection', 'Location updated successfully');
      setEditingLocation(null);
      
      // Reload locations after save
      if (userId) {
        const fetchedData = await getUserLocations(userId);
        setLocations(fetchedData);
      }
    } catch (error) {
      debugLogger.log('LocationsSection', 'Failed to update location', { error });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocation = async (locationId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
      return;
    }
    
    try {
      await deleteLocation(locationId);
      debugLogger.log('LocationsSection', 'Location deleted successfully');
      
      // Reload locations after delete
      if (userId) {
        const fetchedData = await getUserLocations(userId);
        setLocations(fetchedData);
      }
    } catch (error) {
      debugLogger.log('LocationsSection', 'Failed to delete location', { error });
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setShowAddForm(false);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingLocation(null);
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
      'current': 'Nơi ở hiện tại',
      'hometown': 'Quê quán',
      'work': 'Nơi làm việc',
      'education': 'Nơi học tập',
      'other': 'Khác'
    };
    return labels[type] || type;
  };

  const getLocationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'current': 'bg-blue-100 text-blue-800',
      'hometown': 'bg-green-100 text-green-800',
      'work': 'bg-purple-100 text-purple-800',
      'education': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-xl">📍</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Địa điểm</h3>
            <p className="text-sm text-gray-500">Các địa điểm quan trọng trong cuộc sống</p>
          </div>
        </div>
        
        {isEditable && (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <span>+</span>
            <span>Thêm địa điểm</span>
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingLocation) && (
        <div className="mb-6">
          <LocationForm
            location={editingLocation || undefined}
            onSubmit={editingLocation ? handleUpdateLocation : handleCreateLocation}
            onCancel={handleCancelForm}
            isLoading={isSubmitting}
            isEditing={!!editingLocation}
          />
        </div>
      )}

      {/* Locations List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📍</span>
          </div>
          <p>Chưa có địa điểm nào</p>
          {isEditable && (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Thêm địa điểm đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((location: Location) => (
            <div key={location.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {/* Location Image */}
                  <div className="flex-shrink-0">
                    {location.imageUrl ? (
                      <img
                        src={location.imageUrl}
                        alt={`${location.locationName} image`}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border border-gray-200 flex items-center justify-center ${location.imageUrl ? 'hidden' : ''}`}>
                      <span className="text-xl">{getLocationTypeIcon(location.locationType)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-semibold text-gray-900">
                      {location.locationName}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLocationTypeColor(location.locationType)}`}>
                      {getLocationTypeLabel(location.locationType)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {location.isCurrent && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Hiện tại
                    </span>
                  )}
                  {isEditable && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditLocation(location)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {location.address && (
                <p className="text-sm text-gray-600 mb-2">
                  📍 {location.address}
                </p>
              )}
              
              {location.latitude && location.longitude && (
                <p className="text-xs text-gray-500 mb-2">
                  🌐 {location.latitude}, {location.longitude}
                </p>
              )}
              
              {location.description && (
                <p className="text-sm text-gray-600">{location.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

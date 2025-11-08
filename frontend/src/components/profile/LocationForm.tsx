import React, { useState, useEffect } from 'react';
import { Location, CreateLocationRequest } from '../../services/profileService';
import { getLocationSuggestions } from '../../services/suggestionService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AutocompleteInput } from '../ui/AutocompleteInput';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { debugLogger } from '../../utils/debugLogger';

interface LocationFormProps {
  location?: Location;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const LocationForm: React.FC<LocationFormProps> = ({
  location,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<CreateLocationRequest>({
    locationName: '',
    locationType: 'current',
    address: '',
    latitude: undefined,
    longitude: undefined,
    description: '',
    image: undefined,
    isCurrent: false
  });
  
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (location && isEditing) {
      setFormData({
        locationName: location.locationName,
        locationType: location.locationType,
        address: location.address || '',
        latitude: location.latitude || undefined,
        longitude: location.longitude || undefined,
        description: location.description || '',
        image: undefined,
        isCurrent: location.isCurrent
      });
      if (location.imageUrl) {
        setPreviewUrl(location.imageUrl);
      }
    }
  }, [location, isEditing]);

  const handleInputChange = (field: keyof CreateLocationRequest, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchLocationSuggestions = async (query: string): Promise<string[]> => {
    try {
      const suggestions = await getLocationSuggestions(query, 10);
      return suggestions.map(s => s.locationName);
    } catch (error) {
      debugLogger.log('LocationForm', 'Failed to get location suggestions', { error });
      return [];
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      debugLogger.log('LocationForm', 'Location form submitted successfully');
    } catch (error) {
      debugLogger.log('LocationForm', 'Failed to submit location form', { error });
    }
  };


  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <h4 className="text-md font-medium text-gray-900 mb-4">
        {isEditing ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm mới'}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên địa điểm *
            </label>
            <AutocompleteInput
              value={formData.locationName}
              onChange={(value) => handleInputChange('locationName', value)}
              onFetch={fetchLocationSuggestions}
              placeholder="Nhập tên địa điểm"
              required
              minChars={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại địa điểm *
            </label>
            <Select
              value={formData.locationType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('locationType', e.target.value as any)}
              required
            >
              <option value="current">🏠 Nơi ở hiện tại</option>
              <option value="hometown">🏘️ Quê quán</option>
              <option value="work">🏢 Nơi làm việc</option>
              <option value="education">🎓 Nơi học tập</option>
              <option value="other">📍 Khác</option>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ chi tiết
            </label>
            <Input
              type="text"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Nhập địa chỉ chi tiết"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vĩ độ
            </label>
            <Input
              type="number"
              step="any"
              value={formData.latitude || ''}
              onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
              placeholder="Ví dụ: 10.8231"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kinh độ
            </label>
            <Input
              type="number"
              step="any"
              value={formData.longitude || ''}
              onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
              placeholder="Ví dụ: 106.6297"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={formData.isCurrent}
              onChange={(e) => handleInputChange('isCurrent', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isCurrent" className="text-sm text-gray-700">
              Địa điểm hiện tại
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hình ảnh
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="location-image-upload"
              />
              <label
                htmlFor="location-image-upload"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors text-sm"
              >
                📁 Chọn file
              </label>
              {previewUrl && (
                <div className="flex items-center space-x-2">
                  <img
                    src={previewUrl}
                    alt="Location preview"
                    className="w-16 h-16 object-cover rounded-md border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: undefined }));
                      setPreviewUrl('');
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕ Xóa
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <Textarea
            value={formData.description || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
            placeholder="Mô tả về địa điểm này..."
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm')}
          </Button>
        </div>
      </form>
    </div>
  );
};

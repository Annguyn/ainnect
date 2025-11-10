import React, { useState, useEffect } from 'react';
import { Interest, CreateInterestRequest } from '../../services/profileService';
import { getInterestSuggestions } from '../../services/suggestionService';
import { Button } from '../ui/Button';
import { AutocompleteInputWithImage, SuggestionItem } from '../ui/AutocompleteInputWithImage';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { debugLogger } from '../../utils/debugLogger';
import { downloadImageFromUrl, fileToDataUrl } from '../../utils/imageUtils';

interface InterestFormProps {
  interest?: Interest;
  categories: any[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const InterestForm: React.FC<InterestFormProps> = ({
  interest,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<CreateInterestRequest>({
    name: '',
    category: '',
    description: '',
    image: undefined
  });
  
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (interest && isEditing) {
      setFormData({
        name: interest.name,
        category: interest.category,
        description: interest.description || '',
        image: undefined
      });
      if (interest.imageUrl) {
        setPreviewUrl(interest.imageUrl);
      }
    }
  }, [interest, isEditing]);

  const handleInputChange = (field: keyof CreateInterestRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchInterestSuggestions = async (query: string): Promise<SuggestionItem[]> => {
    try {
      const suggestions = await getInterestSuggestions(query, 10);
      return suggestions.map(s => ({
        label: s.name,
        imageUrl: s.imageUrl
      }));
    } catch (error) {
      debugLogger.log('InterestForm', 'Failed to get interest suggestions', { error });
      return [];
    }
  };

  const handleInterestSelect = async (item: SuggestionItem) => {
    const newFormData: any = {
      name: item.label
    };

    // If suggestion has an image URL, download it and convert to File
    if (item.imageUrl) {
      const imageFile = await downloadImageFromUrl(item.imageUrl, 'interest-image.jpg');
      newFormData.image = imageFile;
      
      // Update preview URL
      if (imageFile instanceof File) {
        try {
          const dataUrl = await fileToDataUrl(imageFile);
          setPreviewUrl(dataUrl);
        } catch (error) {
          debugLogger.log('InterestForm', 'Failed to create preview', { error });
          setPreviewUrl(item.imageUrl);
        }
      } else {
        setPreviewUrl(item.imageUrl);
      }
    }

    setFormData(prev => ({
      ...prev,
      ...newFormData
    }));
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
      debugLogger.log('InterestForm', 'Interest form submitted successfully');
    } catch (error) {
      debugLogger.log('InterestForm', 'Failed to submit interest form', { error });
    }
  };

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

  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <h4 className="text-md font-medium text-gray-900 mb-4">
        {isEditing ? 'Chỉnh sửa sở thích' : 'Thêm sở thích mới'}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sở thích *
            </label>
            <AutocompleteInputWithImage
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              onSelect={handleInterestSelect}
              onFetch={fetchInterestSuggestions}
              placeholder="Nhập tên sở thích"
              required
              minChars={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục *
            </label>
            <Select
              value={formData.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('category', e.target.value)}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {getCategoryIcon(category.name)} {category.name}
                </option>
              ))}
            </Select>
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
                id="interest-image-upload"
              />
              <label
                htmlFor="interest-image-upload"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors text-sm"
              >
                📁 Chọn file
              </label>
              {previewUrl && (
                <div className="flex items-center space-x-2">
                  <img
                    src={previewUrl}
                    alt="Interest preview"
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
            placeholder="Mô tả về sở thích của bạn..."
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

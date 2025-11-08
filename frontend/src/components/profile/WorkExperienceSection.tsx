import React, { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { WorkExperience, CreateWorkExperienceRequest } from '../../services/profileService';
import { getCompanySuggestions, getLocationSuggestions } from '../../services/suggestionService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AutocompleteInput } from '../ui/AutocompleteInput';
import { Textarea } from '../ui/Textarea';
import { debugLogger } from '../../utils/debugLogger';

interface WorkExperienceSectionProps {
  userId?: number;
  isEditable?: boolean;
}

export const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({ 
  userId, 
  isEditable = false 
}) => {
  const { 
    workExperiences, 
    isLoading, 
    error, 
    loadCompleteProfile, 
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience
  } = useProfile();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateWorkExperienceRequest>({
    companyName: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    image: undefined
  });

  useEffect(() => {
    if (userId) {
      loadCompleteProfile(userId);
    }
  }, [userId, loadCompleteProfile]);

  const handleInputChange = (field: keyof CreateWorkExperienceRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchCompanySuggestions = async (query: string): Promise<string[]> => {
    try {
      const suggestions = await getCompanySuggestions(query, 10);
      return suggestions.map(s => s.companyName);
    } catch (error) {
      debugLogger.log('WorkExperienceSection', 'Failed to get company suggestions', { error });
      return [];
    }
  };

  const fetchLocationSuggestions = async (query: string): Promise<string[]> => {
    try {
      const suggestions = await getLocationSuggestions(query, 10);
      return suggestions.map(s => s.locationName);
    } catch (error) {
      debugLogger.log('WorkExperienceSection', 'Failed to get location suggestions', { error });
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateWorkExperience(editingId, formData);
        debugLogger.log('WorkExperienceSection', 'Work experience updated successfully');
      } else {
        await createWorkExperience(formData);
        debugLogger.log('WorkExperienceSection', 'Work experience created successfully');
      }
      resetForm();
    } catch (error) {
      debugLogger.log('WorkExperienceSection', 'Failed to save work experience', { error });
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      image: undefined
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEdit = (experience: any) => {
    setFormData({
      companyName: experience.companyName || '',
      position: experience.position || '',
      location: experience.location || '',
      startDate: experience.startDate || '',
      endDate: experience.endDate || '',
      isCurrent: experience.isCurrent || false,
      description: experience.description || '',
      image: undefined
    });
    setEditingId(experience.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kinh nghiệm làm việc này?')) {
      try {
        await deleteWorkExperience(id);
        debugLogger.log('WorkExperienceSection', 'Work experience deleted successfully');
      } catch (error) {
        debugLogger.log('WorkExperienceSection', 'Failed to delete work experience', { error });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getDuration = (startDate: string, endDate?: string | null, isCurrent?: boolean) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : (isCurrent ? new Date() : null);
    
    if (!end) return 'Không xác định';
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} năm${months > 0 ? ` ${months} tháng` : ''}`;
    } else {
      return `${months} tháng`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-xl">💼</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Kinh nghiệm làm việc</h3>
            <p className="text-sm text-gray-500">Lịch sử công việc và kinh nghiệm</p>
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
            <span>Thêm kinh nghiệm</span>
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {editingId ? 'Chỉnh sửa kinh nghiệm làm việc' : 'Thêm kinh nghiệm làm việc'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name with Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Công ty *
                </label>
                <AutocompleteInput
                  value={formData.companyName}
                  onChange={(value) => handleInputChange('companyName', value)}
                  onFetch={fetchCompanySuggestions}
                  placeholder="Nhập tên công ty"
                  required
                  minChars={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vị trí *
                </label>
                <Input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Ví dụ: Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm
                </label>
                <AutocompleteInput
                  value={formData.location || ''}
                  onChange={(value) => handleInputChange('location', value)}
                  onFetch={fetchLocationSuggestions}
                  placeholder="Ví dụ: Hồ Chí Minh, Việt Nam"
                  minChars={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày kết thúc
                </label>
                <Input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  disabled={formData.isCurrent}
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
                  Đang làm việc
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình ảnh
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData(prev => ({ ...prev, image: file }));
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.image && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Work experience preview"
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: undefined }))}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕ Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả công việc
              </label>
              <Textarea
                value={formData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả về công việc, trách nhiệm, thành tích..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Đang lưu...' : 'Thêm'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Work Experience List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : workExperiences.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💼</span>
          </div>
          <p>Chưa có kinh nghiệm làm việc</p>
          {isEditable && (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Thêm kinh nghiệm đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {workExperiences.map((experience: any) => (
            <div key={experience.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    {/* Company Image */}
                    <div className="flex-shrink-0">
                      {experience.imageUrl ? (
                        <img
                          src={experience.imageUrl}
                          alt={`${experience.companyName} logo`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-lg border border-gray-200 flex items-center justify-center ${experience.imageUrl ? 'hidden' : ''}`}>
                        <span className="text-2xl">💼</span>
                      </div>
                    </div>
                    
                    {/* Work Experience Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {experience.position}
                        </h4>
                        {experience.isCurrent && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Hiện tại
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 font-medium mb-1">
                        {experience.companyName}
                      </p>
                      
                      {experience.location && (
                        <p className="text-sm text-gray-500 mb-2">
                          📍 {experience.location}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(experience.startDate)} - {experience.isCurrent ? 'Hiện tại' : (experience.endDate ? formatDate(experience.endDate) : 'Không xác định')}
                        <span className="ml-2 text-blue-600">
                          ({getDuration(experience.startDate, experience.endDate, experience.isCurrent)})
                        </span>
                      </p>
                      
                      {experience.description && (
                        <p className="text-sm text-gray-600">{experience.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Edit/Delete buttons */}
                {isEditable && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(experience)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Chỉnh sửa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(experience.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Xóa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
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

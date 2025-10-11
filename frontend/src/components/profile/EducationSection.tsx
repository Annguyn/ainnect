import React, { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { Education, CreateEducationRequest, UpdateEducationRequest } from '../../services/profileService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { debugLogger } from '../../utils/debugLogger';

interface EducationSectionProps {
  userId?: number;
  isEditable?: boolean;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ 
  userId, 
  isEditable = false 
}) => {
  const { 
    educations, 
    isLoading, 
    error, 
    loadCompleteProfile, 
    createEducation, 
    updateEducation, 
    deleteEducation,
    getSuggestions 
  } = useProfile();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [schoolSuggestions, setSchoolSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateEducationRequest>({
    schoolName: '',
    degree: '',
    fieldOfStudy: '',
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

  // Debug: Log education data when it changes
  useEffect(() => {
    if (educations.length > 0) {
      console.log('Education data received:', educations);
      educations.forEach((edu: any) => {
        console.log(`Education ${edu.id}:`, {
          schoolName: edu.schoolName,
          imageUrl: edu.imageUrl,
          hasImageUrl: !!edu.imageUrl
        });
      });
    }
  }, [educations]);

  const handleInputChange = (field: keyof CreateEducationRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Get school suggestions when typing school name
    if (field === 'schoolName' && typeof value === 'string' && value.length > 2) {
      getSchoolSuggestions(value);
    }
  };

  const getSchoolSuggestions = async (query: string) => {
    try {
      const suggestions = await getSuggestions(query);
      setSchoolSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      debugLogger.log('EducationSection', 'Failed to get school suggestions', { error });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateEducation(editingId, formData as UpdateEducationRequest);
        debugLogger.log('EducationSection', 'Education updated successfully', { educationId: editingId });
      } else {
        await createEducation(formData);
        debugLogger.log('EducationSection', 'Education created successfully');
      }
      
      resetForm();
    } catch (error) {
      debugLogger.log('EducationSection', 'Failed to save education', { error });
    }
  };

  const handleEdit = (education: Education) => {
    setFormData({
      schoolName: education.schoolName,
      degree: education.degree,
      fieldOfStudy: education.fieldOfStudy,
      startDate: education.startDate,
      endDate: education.endDate || '',
      isCurrent: education.isCurrent,
      description: education.description || '',
      image: undefined // Will be handled separately for file uploads
    });
    setEditingId(education.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông tin học vấn này?')) {
      try {
        await deleteEducation(id);
        debugLogger.log('EducationSection', 'Education deleted successfully', { educationId: id });
      } catch (error) {
        debugLogger.log('EducationSection', 'Failed to delete education', { error });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      schoolName: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      image: undefined
    });
    setEditingId(null);
    setShowAddForm(false);
    setShowSuggestions(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-xl">🎓</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Học vấn</h3>
            <p className="text-sm text-gray-500">Thông tin học tập và bằng cấp</p>
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
            <span>Thêm học vấn</span>
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {editingId ? 'Chỉnh sửa học vấn' : 'Thêm học vấn mới'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* School Name with Suggestions */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trường học *
                </label>
                <Input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  placeholder="Nhập tên trường học"
                  required
                />
                {showSuggestions && schoolSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {schoolSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                        onClick={() => {
                          handleInputChange('schoolName', suggestion.name);
                          setShowSuggestions(false);
                        }}
                      >
                        {suggestion.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bằng cấp *
                </label>
                <Select
                  value={formData.degree}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('degree', e.target.value)}
                  required
                >
                  <option value="">Chọn bằng cấp</option>
                  <option value="High School">Trung học phổ thông</option>
                  <option value="Associate">Cao đẳng</option>
                  <option value="Bachelor">Cử nhân</option>
                  <option value="Master">Thạc sĩ</option>
                  <option value="PhD">Tiến sĩ</option>
                  <option value="Certificate">Chứng chỉ</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên ngành *
                </label>
                <Input
                  type="text"
                  value={formData.fieldOfStudy}
                  onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                  placeholder="Ví dụ: Khoa học máy tính"
                  required
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
                  Đang học
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình ảnh
              </label>
              <div className="space-y-2">
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
                      alt="Education preview"
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
                Mô tả
              </label>
              <Textarea
                value={formData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả về quá trình học tập, thành tích..."
                rows={3}
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
                {isLoading ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Education List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : educations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎓</span>
          </div>
          <p>Chưa có thông tin học vấn</p>
          {isEditable && (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Thêm học vấn đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {educations.map((education: any) => (
            <div key={education.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    {/* Education Image */}
                    <div className="flex-shrink-0">
                      {education.imageUrl ? (
                        <img
                          src={education.imageUrl}
                          alt={`${education.schoolName} logo`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            console.log('Education image failed to load:', education.imageUrl);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                          onLoad={() => {
                            console.log('Education image loaded successfully:', education.imageUrl);
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border border-gray-200 flex items-center justify-center ${education.imageUrl ? 'hidden' : ''}`}>
                        <span className="text-2xl">🎓</span>
                      </div>
                    </div>
                    
                    {/* Education Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {education.schoolName}
                        </h4>
                        {education.isCurrent && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Đang học
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 font-medium mb-1">
                        {education.degree} - {education.fieldOfStudy}
                      </p>
                      
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(education.startDate)} - {education.isCurrent ? 'Hiện tại' : (education.endDate ? formatDate(education.endDate) : 'Không xác định')}
                      </p>
                      
                      {education.description && (
                        <p className="text-sm text-gray-600">{education.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {isEditable && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      onClick={() => handleEdit(education)}
                      variant="outline"
                      size="sm"
                    >
                      Sửa
                    </Button>
                    <Button
                      onClick={() => handleDelete(education.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Xóa
                    </Button>
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

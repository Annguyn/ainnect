import React, { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { Interest, CreateInterestRequest, UpdateInterestRequest } from '../../services/profileService';
import { getInterestCategories } from '../../services/suggestionService';
import { Button } from '../ui/Button';
import { InterestForm } from './InterestForm';
import { debugLogger } from '../../utils/debugLogger';

interface InterestsSectionProps {
  userId?: number;
  isEditable?: boolean;
}

export const InterestsSection: React.FC<InterestsSectionProps> = ({ 
  userId, 
  isEditable = false 
}) => {
  const { 
    interests, 
    isLoading, 
    error, 
    loadCompleteProfile, 
    createInterest,
    updateInterest,
    deleteInterest
  } = useProfile();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      loadCompleteProfile(userId);
      loadCategories();
    }
  }, [userId, loadCompleteProfile]);

  const loadCategories = async () => {
    try {
      const categoriesData = await getInterestCategories();
      setCategories(categoriesData.map((cat, index) => ({ id: index, name: cat.category })));
    } catch (error) {
      debugLogger.log('InterestsSection', 'Failed to load categories', { error });
    }
  };

  const handleCreateInterest = async (data: CreateInterestRequest) => {
    setIsSubmitting(true);
    try {
      await createInterest(data);
      debugLogger.log('InterestsSection', 'Interest created successfully');
      setShowAddForm(false);
    } catch (error) {
      debugLogger.log('InterestsSection', 'Failed to create interest', { error });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInterest = async (data: UpdateInterestRequest) => {
    if (!editingInterest) return;
    
    setIsSubmitting(true);
    try {
      await updateInterest(editingInterest.id, data);
      debugLogger.log('InterestsSection', 'Interest updated successfully');
      setEditingInterest(null);
    } catch (error) {
      debugLogger.log('InterestsSection', 'Failed to update interest', { error });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInterest = async (interestId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sở thích này?')) {
      return;
    }
    
    try {
      await deleteInterest(interestId);
      debugLogger.log('InterestsSection', 'Interest deleted successfully');
    } catch (error) {
      debugLogger.log('InterestsSection', 'Failed to delete interest', { error });
    }
  };

  const handleEditInterest = (interest: Interest) => {
    setEditingInterest(interest);
    setShowAddForm(false);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingInterest(null);
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Arts': 'bg-purple-100 text-purple-800',
      'Sports': 'bg-green-100 text-green-800',
      'Technology': 'bg-blue-100 text-blue-800',
      'Music': 'bg-pink-100 text-pink-800',
      'Travel': 'bg-yellow-100 text-yellow-800',
      'Food': 'bg-orange-100 text-orange-800',
      'Books': 'bg-indigo-100 text-indigo-800',
      'Movies': 'bg-red-100 text-red-800',
      'Gaming': 'bg-gray-100 text-gray-800',
      'Photography': 'bg-cyan-100 text-cyan-800',
      'Fitness': 'bg-emerald-100 text-emerald-800',
      'Nature': 'bg-lime-100 text-lime-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 text-xl">🎯</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sở thích</h3>
            <p className="text-sm text-gray-500">Các hoạt động và sở thích cá nhân</p>
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
            <span>Thêm sở thích</span>
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingInterest) && (
        <div className="mb-6">
          <InterestForm
            interest={editingInterest || undefined}
            categories={categories}
            onSubmit={editingInterest ? handleUpdateInterest : handleCreateInterest}
            onCancel={handleCancelForm}
            isLoading={isSubmitting}
            isEditing={!!editingInterest}
          />
        </div>
      )}

      {/* Interests List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : interests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <p>Chưa có sở thích nào</p>
          {isEditable && (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Thêm sở thích đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interests.map((interest: Interest) => (
            <div key={interest.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {/* Interest Image */}
                  <div className="flex-shrink-0">
                    {interest.imageUrl ? (
                      <img
                        src={interest.imageUrl}
                        alt={`${interest.name} image`}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg border border-gray-200 flex items-center justify-center ${interest.imageUrl ? 'hidden' : ''}`}>
                      <span className="text-xl">{getCategoryIcon(interest.category)}</span>
                    </div>
                  </div>
                  
                  <h4 className="text-md font-semibold text-gray-900">
                    {interest.name}
                  </h4>
                </div>
                
                {isEditable && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditInterest(interest)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteInterest(interest.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(interest.category)}`}>
                  {interest.category}
                </span>
              </div>
              
              {interest.description && (
                <p className="text-sm text-gray-600">{interest.description}</p>
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

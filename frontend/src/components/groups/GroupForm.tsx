import React, { useState, useRef } from 'react';
import { CreateGroupRequest, CreateGroupData, UpdateGroupRequest, JoinQuestion } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Plus, X, Move, Camera } from 'lucide-react';

interface GroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData | CreateGroupRequest | UpdateGroupRequest) => Promise<void>;
  initialData?: Partial<CreateGroupData>;
  isEditing?: boolean;
  isLoading?: boolean;
  title?: string;
}

interface JoinQuestionForm extends Omit<JoinQuestion, 'id'> {
  tempId: string;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  isLoading = false,
  title
}) => {
  const [formData, setFormData] = useState<CreateGroupData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    privacy: initialData?.privacy || 'public_' as const,
    requiresApproval: initialData?.requiresApproval || false,
    avatarUrl: initialData?.avatarUrl || '',
    coverUrl: initialData?.coverUrl || '',
    coverImage: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [joinQuestions, setJoinQuestions] = useState<JoinQuestionForm[]>(
    initialData?.joinQuestions?.map((q: JoinQuestion, index: number) => ({
      ...q,
      tempId: `existing-${index}`
    })) || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nextTempId, setNextTempId] = useState(1);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Group name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Group name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    joinQuestions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question-${question.tempId}`] = 'Question text is required';
      } else if (question.question.length > 200) {
        newErrors[`question-${question.tempId}`] = 'Question must be less than 200 characters';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.error('Validation failed: Group name is required.');
      return;
    }

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('name', formData.name);
      if (formData.description) {
        formDataToSubmit.append('description', formData.description);
      }
      formDataToSubmit.append('visibility', formData.privacy);
      formDataToSubmit.append('requiresApproval', String(formData.requiresApproval));
      if (formData.avatarUrl) {
        formDataToSubmit.append('avatarUrl', formData.avatarUrl);
      }
      if (formData.coverImage) {
        formDataToSubmit.append('coverImage', formData.coverImage);
      }
      
      const joinQuestionsData = joinQuestions.map(({ tempId, ...q }, index) => ({
        ...q,
        displayOrder: index + 1
      }));
      formDataToSubmit.append('joinQuestions', JSON.stringify(joinQuestionsData));
      console.log("Submit data: ", {
        name: formData.name,
        description: formData.description,
        visibility: formData.privacy,
        requiresApproval: formData.requiresApproval,
        avatarUrl: formData.avatarUrl,
        coverImage: formData.coverImage,
        joinQuestions: joinQuestions.map(({ tempId, ...q }, index) => ({
          ...q,
          displayOrder: index + 1
        }))
      });
      await onSubmit(formDataToSubmit as any);
      handleClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      privacy: 'public_',
      requiresApproval: false,
      avatarUrl: '',
      coverUrl: '',
      coverImage: null
    });
    setJoinQuestions([]);
    setErrors({});
    onClose();
  };

  const addQuestion = () => {
    const newQuestion: JoinQuestionForm = {
      tempId: `new-${nextTempId}`,
      question: '',
      isRequired: true,
      displayOrder: joinQuestions.length + 1
    };
    setJoinQuestions([...joinQuestions, newQuestion]);
    setNextTempId(nextTempId + 1);
  };

  const updateQuestion = (tempId: string, field: keyof Omit<JoinQuestionForm, 'tempId'>, value: any) => {
    setJoinQuestions(questions =>
      questions.map(q => 
        q.tempId === tempId ? { ...q, [field]: value } : q
      )
    );
    
    // Clear error for this question
    if (errors[`question-${tempId}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`question-${tempId}`];
        return newErrors;
      });
    }
  };

  const removeQuestion = (tempId: string) => {
    setJoinQuestions(questions => questions.filter(q => q.tempId !== tempId));
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...joinQuestions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);
    setJoinQuestions(newQuestions);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title || (isEditing ? 'Edit Group' : 'Create New Group')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          
          <Input
            label="Group Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="Enter group name"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
            placeholder="Describe what this group is about..."
            rows={3}
          />

          <Select
            label="Visibility *"
            value={formData.privacy}
            onChange={(e) => setFormData({ ...formData, privacy: e.target.value as 'public_' | 'private_' })}
            required
          >
            <option value="public_">Public - Anyone can see and join</option>
            <option value="private_">Private - Only members can see content</option>
          </Select>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requiresApproval"
              checked={formData.requiresApproval}
              onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="requiresApproval" className="text-sm text-gray-700">
              Require approval for new members
            </label>
          </div>
        </div>

        {/* Media Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Ảnh bìa nhóm</h3>
          
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, coverImage: file });
                }
              }}
            />
            
            {formData.coverImage ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(formData.coverImage)}
                  alt="Group cover preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImage: null })}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
              >
                <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Nhấp để tải lên ảnh bìa nhóm
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG hoặc GIF (tối đa 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Join Questions */}
        {formData.requiresApproval && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Join Questions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </Button>
            </div>

            {joinQuestions.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No questions added. Members will need approval but won't need to answer any questions.
              </p>
            ) : (
              <div className="space-y-3">
                {joinQuestions.map((question, index) => (
                  <div key={question.tempId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex flex-col space-y-1">
                        <button
                          type="button"
                          onClick={() => index > 0 && moveQuestion(index, index - 1)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          title="Move up"
                        >
                          <Move className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => index < joinQuestions.length - 1 && moveQuestion(index, index + 1)}
                          disabled={index === joinQuestions.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          title="Move down"
                        >
                          <Move className="w-4 h-4 rotate-180" />
                        </button>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Question {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(question.tempId)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Remove question"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <Textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(question.tempId, 'question', e.target.value)}
                          error={errors[`question-${question.tempId}`]}
                          placeholder="Enter your question..."
                          rows={2}
                        />
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`required-${question.tempId}`}
                            checked={question.isRequired}
                            onChange={(e) => updateQuestion(question.tempId, 'isRequired', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`required-${question.tempId}`} className="text-sm text-gray-700">
                            Required question
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isEditing ? 'Update Group' : 'Create Group'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
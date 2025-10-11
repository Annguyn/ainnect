import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { groupService } from '../../services/groupService';
import { JoinQuestion, JoinAnswer } from '../../types';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface JoinQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  groupName: string;
  onJoin: (answers: JoinAnswer[]) => Promise<void>;
  isLoading?: boolean;
}

export const JoinQuestionsModal: React.FC<JoinQuestionsModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  onJoin,
  isLoading = false,
}) => {
  const [questions, setQuestions] = useState<JoinQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load questions when modal opens
  useEffect(() => {
    if (isOpen && groupId) {
      loadQuestions();
    }
  }, [isOpen, groupId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuestions([]);
      setAnswers({});
      setError(null);
    }
  }, [isOpen]);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    setError(null);
    try {
      const fetchedQuestions = await groupService.getJoinQuestions(groupId);
      setQuestions(fetchedQuestions);
      
      // Initialize answers object
      const initialAnswers: Record<number, string> = {};
      fetchedQuestions.forEach(q => {
        if (q.id) {
          initialAnswers[q.id] = '';
        }
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load join questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const validateAnswers = (): boolean => {
    const requiredQuestions = questions.filter(q => q.isRequired);
    const missingAnswers = requiredQuestions.filter(q => 
      q.id && (!answers[q.id] || answers[q.id].trim() === '')
    );
    
    return missingAnswers.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      setError('Vui lòng trả lời tất cả các câu hỏi bắt buộc');
      return;
    }

    try {
      const joinAnswers: JoinAnswer[] = questions
        .filter(q => q.id && answers[q.id]?.trim())
        .map(q => ({
          questionId: q.id!,
          answer: answers[q.id!].trim()
        }));

      await onJoin(joinAnswers);
      onClose();
    } catch (err) {
      console.error('Failed to submit join request:', err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Tham gia nhóm "${groupName}"`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Loading State */}
        {loadingQuestions && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Đang tải câu hỏi...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Questions */}
        {!loadingQuestions && !error && questions.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Vui lòng trả lời các câu hỏi sau để tham gia nhóm:
            </div>
            
            {questions
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((question) => (
                <div key={question.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {question.question}
                    {question.isRequired && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <Textarea
                    value={answers[question.id!] || ''}
                    onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                    placeholder={`Trả lời câu hỏi: ${question.question}`}
                    rows={3}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
              ))}
          </div>
        )}

        {/* No Questions */}
        {!loadingQuestions && !error && questions.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Nhóm này không yêu cầu câu hỏi tham gia.
            </p>
            <p className="text-sm text-gray-500">
              Bạn có thể tham gia nhóm ngay lập tức.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || loadingQuestions || !validateAnswers()}
            isLoading={isLoading}
          >
            {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu tham gia'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

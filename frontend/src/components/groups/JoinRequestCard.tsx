import React, { useState } from 'react';
import { JoinRequest } from '../../types';
import { Avatar } from '../Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../utils/cn';

interface JoinRequestCardProps {
  request: JoinRequest;
  onApprove: (requestId: number, message?: string) => void;
  onReject: (requestId: number, message?: string) => void;
  isLoading?: boolean;
}

export const JoinRequestCard: React.FC<JoinRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = () => {
    setActionType('approve');
    setShowMessageInput(true);
  };

  const handleReject = () => {
    setActionType('reject');
    setShowMessageInput(true);
  };

  const handleConfirm = () => {
    if (actionType === 'approve') {
      onApprove(request.id, message || undefined);
    } else if (actionType === 'reject') {
      onReject(request.id, message || undefined);
    }
    setShowMessageInput(false);
    setMessage('');
    setActionType(null);
  };

  const handleCancel = () => {
    setShowMessageInput(false);
    setMessage('');
    setActionType(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="p-6">
      <div className="flex items-start space-x-4">
        <Avatar
          user={{
            avatarUrl: request.user?.avatarUrl,
            displayName: request.user?.displayName || request.user?.username,
            userId: request.user?.id
          }}
          size="lg"
        />
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {request.user?.displayName || request.user?.username}
              </h3>
              <p className="text-sm text-gray-500">@{request.user?.username}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>{formatDate(request.createdAt)}</span>
              </div>
            </div>

            {request.status === 'pending' && !showMessageInput && (
              <div className="flex space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Chấp nhận
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                  disabled={isLoading}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Từ chối
                </Button>
              </div>
            )}
          </div>

          {request.answers && request.answers.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showAnswers ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Ẩn câu trả lời
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Xem {request.answers.length} câu trả lời
                  </>
                )}
              </button>

              {showAnswers && (
                <div className="mt-3 space-y-3">
                  {request.answers.map((answer, index) => (
                    <div
                      key={`${answer.questionId}-${index}`}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {answer.question}
                      </p>
                      <p className="text-base text-gray-900">{answer.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showMessageInput && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tin nhắn {actionType === 'approve' ? 'chào mừng' : 'từ chối'} (tùy chọn)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? 'Chào mừng bạn đến với nhóm!'
                    : 'Lý do từ chối...'
                }
                rows={3}
                className={cn(
                  'w-full px-3 py-2 border rounded-md',
                  'focus:outline-none focus:ring-2',
                  actionType === 'approve'
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-red-300 focus:ring-red-500'
                )}
                disabled={isLoading}
              />
              <div className="flex justify-end space-x-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  isLoading={isLoading}
                  className={cn(
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  )}
                >
                  {actionType === 'approve' ? 'Xác nhận chấp nhận' : 'Xác nhận từ chối'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

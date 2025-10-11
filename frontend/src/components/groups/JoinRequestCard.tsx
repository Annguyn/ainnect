import React, { useState } from 'react';
import { JoinRequest } from '../../types';
import { Avatar } from '../Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Check, X, MessageSquare, Calendar } from 'lucide-react';

interface JoinRequestCardProps {
  request: JoinRequest;
  onApprove?: (requestId: number, message?: string) => void;
  onReject?: (requestId: number, message?: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const JoinRequestCard: React.FC<JoinRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  isLoading = false,
  className = ''
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = () => {
    if (request.answers.length > 0) {
      setActionType('approve');
      setShowMessage(true);
    } else {
      onApprove?.(request.id);
    }
  };

  const handleReject = () => {
    setActionType('reject');
    setShowMessage(true);
  };

  const handleSubmitResponse = () => {
    if (actionType === 'approve') {
      onApprove?.(request.id, responseMessage || undefined);
    } else if (actionType === 'reject') {
      onReject?.(request.id, responseMessage || undefined);
    }
    setShowMessage(false);
    setResponseMessage('');
    setActionType(null);
  };

  const handleCancel = () => {
    setShowMessage(false);
    setResponseMessage('');
    setActionType(null);
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <Avatar
          user={{
            avatarUrl: request.user.avatarUrl,
            displayName: request.user.displayName,
            userId: request.user.id
          }}
          size="lg"
        />

        {/* Request Content */}
        <div className="flex-1 min-w-0">
          {/* User Info */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {request.user.displayName}
              </h4>
              <p className="text-sm text-gray-500">@{request.user.username || 'user'}</p>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* User Bio */}
          {request.user.bio && (
            <p className="text-gray-600 mb-4">{request.user.bio}</p>
          )}

          {/* Answers to Questions */}
          {request.answers.length > 0 && (
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Answers to join questions
              </div>
              
              <div className="space-y-3">
                {request.answers.map((answer, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {answer.question}
                    </p>
                    <p className="text-sm text-gray-600">
                      {answer.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Message Form */}
          {showMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === 'approve' ? 'Welcome message (optional)' : 'Rejection reason (optional)'}
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={
                  actionType === 'approve' 
                    ? 'Welcome to the group! We\'re excited to have you...'
                    : 'Sorry, but we cannot approve your request at this time...'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              
              <div className="flex items-center justify-end space-x-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'approve' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleSubmitResponse}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className={actionType === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showMessage && (
            <div className="flex items-center space-x-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleApprove}
                disabled={isLoading}
                className="flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={isLoading}
                className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
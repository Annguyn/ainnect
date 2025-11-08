import React from 'react';
import { JoinRequest } from '../../types';
import { JoinRequestCard } from './JoinRequestCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { UserCheck, Clock, AlertCircle } from 'lucide-react';

interface JoinRequestsListProps {
  requests: JoinRequest[];
  isLoading?: boolean;
  error?: string | null;
  onApprove?: (requestId: number, message?: string) => void;
  onReject?: (requestId: number, message?: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  totalRequests?: number;
  className?: string;
}

export const JoinRequestsList: React.FC<JoinRequestsListProps> = ({
  requests,
  isLoading = false,
  error,
  onApprove,
  onReject,
  onLoadMore,
  hasMore = false,
  totalRequests,
  className = ''
}) => {
  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading requests</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!isLoading && requests.length === 0) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="text-center">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
          <p className="text-gray-600">
            There are no pending join requests for this group at the moment.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Join Requests</h3>
              <p className="text-sm text-gray-500">
                {totalRequests || requests.length} request{(totalRequests || requests.length) !== 1 ? 's' : ''} 
                waiting for review
              </p>
            </div>
          </div>
          
          {requests.length > 0 && (
            <div className="text-sm text-gray-500">
              Review requests to approve or reject new members
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && requests.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-16 bg-gray-200 rounded" />
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded w-20" />
                      <div className="h-8 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <JoinRequestCard
            key={request.id}
            request={request}
            onApprove={onApprove || (() => {})}
            onReject={onReject || (() => {})}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More Requests'}
          </Button>
        </div>
      )}

      {/* Instructions for new group owners */}
      {requests.length > 0 && (
        <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Review Guidelines</h4>
              <p className="text-sm text-blue-700">
                Take time to review each request carefully. Check their answers to join questions 
                and consider if they're a good fit for your group's community and goals.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { JoinRequest } from '../../types';
import { JoinRequestCard } from './JoinRequestCard';
import { useGroups } from '../../hooks/useGroups';
import { AlertCircle, Loader2, UserCheck } from 'lucide-react';

interface JoinRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  groupName: string;
}

export const JoinRequestsModal: React.FC<JoinRequestsModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName
}) => {
  const {
    joinRequests,
    isLoading,
    error,
    loadPendingJoinRequests,
    reviewJoinRequest
  } = useGroups();

  const [reviewingId, setReviewingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && groupId) {
      loadRequests();
    }
  }, [isOpen, groupId]);

  const loadRequests = async () => {
    try {
      await loadPendingJoinRequests(groupId, 0, 20);
    } catch (error) {
      console.error('Failed to load join requests:', error);
    }
  };

  const handleApprove = async (requestId: number, message?: string) => {
    setReviewingId(requestId);
    try {
      await reviewJoinRequest(requestId, { approved: true, message });
      await loadRequests();
    } catch (error) {
      console.error('Failed to approve request:', error);
    } finally {
      setReviewingId(null);
    }
  };

  const handleReject = async (requestId: number, message?: string) => {
    setReviewingId(requestId);
    try {
      await reviewJoinRequest(requestId, { approved: false, message });
      await loadRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Yêu cầu tham gia - ${groupName}`}
      size="xl"
    >
      <div className="space-y-4">
        {isLoading && joinRequests.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Đang tải yêu cầu...</span>
          </div>
        ) : error ? (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        ) : joinRequests.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có yêu cầu nào
            </h3>
            <p className="text-gray-500">
              Hiện tại không có yêu cầu tham gia đang chờ xét duyệt.
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4">
              Có <span className="font-semibold">{joinRequests.length}</span> yêu cầu đang chờ xét duyệt
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {joinRequests.map((request) => (
                <JoinRequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isLoading={reviewingId === request.id}
                />
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};


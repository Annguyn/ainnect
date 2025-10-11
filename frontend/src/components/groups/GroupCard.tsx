import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Group, JoinAnswer } from '../../types';
import { Avatar } from '../Avatar';
import { Button } from '../ui/Button';
import { Users, Lock, Globe, Settings } from 'lucide-react';
import { JoinQuestionsModal } from './JoinQuestionsModal';

interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: number, answers?: JoinAnswer[]) => void;
  onLeave?: (groupId: number) => void;
  onSettings?: (groupId: number) => void;
  showActions?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onJoin,
  onLeave,
  onSettings,
  showActions = true,
  isLoading = false,
  className = '',
}) => {
  const [showJoinModal, setShowJoinModal] = useState(false);

  const isPrivate = group.privacy === 'private_';
  
  // Check membership status with multiple fallbacks
  const isMember = group.userMembershipStatus === 'joined' || 
                   group.member === true || 
                   (group.userRole && group.userRole !== null);
  
  const isPending = group.userMembershipStatus === 'pending' || 
                    group.hasPendingRequest === true;
  
  const canManage = group.userRole === 'owner' || 
                    group.userRole === 'moderator' || 
                    group.userRole === 'admin';


  const handleJoinClick = () => {
    if (isLoading) return;
    
    // If group requires approval, show join questions modal
    if (group.requiresApproval) {
      setShowJoinModal(true);
    } else {
      // Direct join without questions
      if (onJoin) {
        onJoin(group.id);
      }
    }
  };

  const handleJoinWithAnswers = async (answers: JoinAnswer[]) => {
    if (onJoin) {
      await onJoin(group.id, answers);
    }
  };

  const handleLeaveClick = () => {
    if (onLeave && !isLoading) {
      onLeave(group.id);
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSettings && !isLoading) {
      onSettings(group.id);
    }
  };

  const renderActionButton = () => {
    if (!showActions) return null;

    // If user is already a member, show Leave button
    if (isMember) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLeaveClick}
          disabled={isLoading}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Leave
        </Button>
      );
    }

    // If user has a pending request, show Pending button
    if (isPending) {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-orange-600 border-orange-200 bg-orange-50"
        >
          Pending
        </Button>
      );
    }

    // If user is not a member and no pending request, show Join button
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={handleJoinClick}
        disabled={isLoading}
      >
        {group.requiresApproval ? 'Request to Join' : 'Join'}
      </Button>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Cover Image */}
      {group.coverUrl && (
        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <img
            src={group.coverUrl}
            alt={`${group.name} cover`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Group Info */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Group Avatar */}
          <div className="flex-shrink-0">
            <Avatar
              user={{
                avatarUrl: group.avatarUrl,
                displayName: group.name,
                userId: group.id
              }}
              size="md"
              className="ring-2 ring-white shadow-sm"
            />
          </div>
          
          {/* Group Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <Link
                to={`/groups/${group.id}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
              >
                {group.name}
              </Link>
              
              {/* Privacy Icon */}
              <div className="flex items-center space-x-1 text-gray-500">
                {isPrivate ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                {canManage && (
                  <button
                    onClick={handleSettingsClick}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    title="Group Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Description */}
            {group.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {group.description}
              </p>
            )}
            
            {/* Stats */}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{group.memberCount} members</span>
              </div>
              
              {/* Membership Status Badge */}
              {isMember && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                  Joined
                </span>
              )}
              
              {isPending && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                  Pending
                </span>
              )}
              
              {group.privacy === 'private_' && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Private
                </span>
              )}
              
              {group.requiresApproval && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  Approval Required
                </span>
              )}
            </div>
            
            {/* Owner Info */}
            {(group.ownerDisplayName || group.owner) && (
              <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                <span>Created by</span>
                {group.owner ? (
                  <Link
                    to={`/profile/${group.owner.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {group.owner.displayName}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-700">
                    {group.ownerDisplayName}
                  </span>
                )}
              </div>
            )}
            
            {/* Action Button */}
            <div className="mt-3">
              {renderActionButton()}
            </div>
          </div>
        </div>
      </div>

      {/* Join Questions Modal */}
      <JoinQuestionsModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        groupId={group.id}
        groupName={group.name}
        onJoin={handleJoinWithAnswers}
        isLoading={isLoading}
      />
    </div>
  );
};
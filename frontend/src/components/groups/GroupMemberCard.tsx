import React, { useState } from 'react';
import { GroupMember } from '../../types';
import { Avatar } from '../Avatar';
import { Button } from '../ui/Button';
import { MoreVertical, Shield, UserX, Crown } from 'lucide-react';

interface GroupMemberCardProps {
  member: GroupMember;
  currentUserRole?: 'owner' | 'moderator' | 'member' | 'admin' | null;
  currentUserId?: number;
  onPromoteToModerator?: (userId: number) => void;
  onDemoteToMember?: (userId: number) => void;
  onRemoveMember?: (userId: number) => void;
  isLoading?: boolean;
}

export const GroupMemberCard: React.FC<GroupMemberCardProps> = ({
  member,
  currentUserRole,
  currentUserId,
  onPromoteToModerator,
  onDemoteToMember,
  onRemoveMember,
  isLoading = false
}) => {
  const [showActions, setShowActions] = useState(false);

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'moderator' || currentUserRole === 'admin';
  const isCurrentUser = currentUserId === member.userId;
  const canPromote = currentUserRole === 'owner' && member.role === 'member';
  const canDemote = currentUserRole === 'owner' && member.role === 'moderator';
  const canRemove = canManageMembers && !isCurrentUser && member.role !== 'owner';

  const getRoleIcon = () => {
    switch (member.role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = () => {
    const badges = {
      owner: 'bg-yellow-100 text-yellow-800',
      moderator: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800',
      admin: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[member.role] || badges.member}`}>
        {getRoleIcon()}
        <span className="ml-1 capitalize">{member.role}</span>
      </span>
    );
  };

  const handlePromoteToModerator = () => {
    if (onPromoteToModerator && !isLoading) {
      onPromoteToModerator(member.userId);
      setShowActions(false);
    }
  };

  const handleDemoteToMember = () => {
    if (onDemoteToMember && !isLoading) {
      onDemoteToMember(member.userId);
      setShowActions(false);
    }
  };

  const handleRemoveMember = () => {
    if (onRemoveMember && !isLoading) {
      const displayName = member.displayName || member.user?.displayName || 'this member';
      if (window.confirm(`Are you sure you want to remove ${displayName} from the group?`)) {
        onRemoveMember(member.userId);
        setShowActions(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Avatar */}
        <Avatar
          user={{
            avatarUrl: member.avatarUrl || member.user?.avatarUrl,
            displayName: member.displayName || member.user?.displayName,
            userId: member.userId || member.user?.id
          }}
          size="md"
        />
        
        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {member.displayName || member.user?.displayName}
            </h4>
            {isCurrentUser && (
              <span className="text-xs text-gray-500">(You)</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            {getRoleBadge()}
            <span className="text-xs text-gray-500">
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </span>
          </div>
          
          {(member.user?.bio) && (
            <p className="text-xs text-gray-600 mt-1 truncate">
              {member.user.bio}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {(canPromote || canDemote || canRemove) && (
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1">
                {canPromote && (
                  <button
                    onClick={handlePromoteToModerator}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Promote to Moderator</span>
                  </button>
                )}
                
                {canDemote && (
                  <button
                    onClick={handleDemoteToMember}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span>Demote to Member</span>
                  </button>
                )}
                
                {canRemove && (
                  <button
                    onClick={handleRemoveMember}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Remove from Group</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close actions menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};
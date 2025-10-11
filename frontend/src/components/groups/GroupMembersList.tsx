import React, { useState } from 'react';
import { GroupMember } from '../../types';
import { GroupMemberCard } from './GroupMemberCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Users, Search, UserPlus, Filter } from 'lucide-react';

interface GroupMembersListProps {
  members: GroupMember[];
  currentUserRole?: 'owner' | 'moderator' | 'member' | 'admin' | null;
  currentUserId?: number;
  isLoading?: boolean;
  onPromoteToModerator?: (userId: number) => void;
  onDemoteToMember?: (userId: number) => void;
  onRemoveMember?: (userId: number) => void;
  onInviteMembers?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  totalMembers?: number;
  className?: string;
}

type RoleFilter = 'all' | 'owner' | 'moderator' | 'member' | 'admin';

export const GroupMembersList: React.FC<GroupMembersListProps> = ({
  members,
  currentUserRole,
  currentUserId,
  isLoading = false,
  onPromoteToModerator,
  onDemoteToMember,
  onRemoveMember,
  onInviteMembers,
  onLoadMore,
  hasMore = false,
  totalMembers,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'moderator' || currentUserRole === 'admin';

  // Filter members based on search and role filter
  const filteredMembers = members.filter(member => {
    const displayName = member.displayName || member.user?.displayName || '';
    const username = member.username || member.user?.username || '';
    
    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Group members by role for display order
  const groupedMembers = {
    owner: filteredMembers.filter(m => m.role === 'owner'),
    admin: filteredMembers.filter(m => m.role === 'admin'),
    moderator: filteredMembers.filter(m => m.role === 'moderator'),
    member: filteredMembers.filter(m => m.role === 'member')
  };

  const orderedMembers = [
    ...groupedMembers.owner,
    ...groupedMembers.admin,
    ...groupedMembers.moderator,
    ...groupedMembers.member
  ];

  const getRoleCount = (role: RoleFilter) => {
    if (role === 'all') return members.length;
    return members.filter(m => m.role === role).length;
  };

  return (
    <div className={className}>
      <Card>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                <p className="text-sm text-gray-500">
                  {totalMembers || members.length} member{(totalMembers || members.length) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {canManageMembers && onInviteMembers && (
              <Button
                variant="primary"
                size="sm"
                onClick={onInviteMembers}
                className="flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Members
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="space-y-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-1">
              <Filter className="w-4 h-4 text-gray-500 mr-2" />
              {(['all', 'owner', 'admin', 'moderator', 'member'] as RoleFilter[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                    roleFilter === role
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                  <span className="ml-1 text-xs opacity-75">
                    ({getRoleCount(role)})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-4 text-sm text-gray-600">
              Found {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} 
              matching "{searchQuery}"
            </div>
          )}

          {/* Members List */}
          {isLoading && members.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orderedMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No members found' : 'No members yet'}
              </h4>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No members match your search for "${searchQuery}"`
                  : 'This group doesn\'t have any members yet.'
                }
              </p>
              {!searchQuery && canManageMembers && onInviteMembers && (
                <Button variant="primary" onClick={onInviteMembers}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite First Members
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {orderedMembers.map((member) => (
                <GroupMemberCard
                  key={member.id}
                  member={member}
                  currentUserRole={currentUserRole}
                  currentUserId={currentUserId}
                  onPromoteToModerator={onPromoteToModerator}
                  onDemoteToMember={onDemoteToMember}
                  onRemoveMember={onRemoveMember}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && onLoadMore && !searchQuery && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={onLoadMore}
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Members'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
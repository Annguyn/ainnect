import React from 'react';
import { Group } from '../../types';
import { GroupCard } from './GroupCard';
import { EmptyState } from '../EmptyState';
import { Button } from '../ui/Button';
import { Plus, Users } from 'lucide-react';

interface GroupListProps {
  groups: Group[];
  isLoading?: boolean;
  error?: string | null;
  onJoinGroup?: (groupId: number) => void;
  onLeaveGroup?: (groupId: number) => void;
  onSettingsGroup?: (groupId: number) => void;
  onCreateGroup?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  title?: string;
  showCreateButton?: boolean;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  className?: string;
}

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  isLoading = false,
  error,
  onJoinGroup,
  onLeaveGroup,
  onSettingsGroup,
  onCreateGroup,
  onLoadMore,
  hasMore = false,
  title,
  showCreateButton = false,
  emptyStateTitle = "No groups found",
  emptyStateMessage = "There are no groups to display at the moment.",
  className = '',
}) => {
  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-sm mb-4">
            <span className="font-medium">Error loading groups:</span> {error}
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoading && groups.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <EmptyState
          type="empty"
          title={emptyStateTitle}
          description={emptyStateMessage}
          buttonText={showCreateButton && onCreateGroup ? "Create Group" : undefined}
          onButtonClick={showCreateButton && onCreateGroup ? onCreateGroup : undefined}
        />
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 ${className}`}>
      {/* Header */}
      {(title || showCreateButton) && (
        <div className="flex items-center justify-between mb-6">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          )}
          {showCreateButton && onCreateGroup && (
            <Button variant="primary" onClick={onCreateGroup}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          )}
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onJoin={onJoinGroup}
            onLeave={onLeaveGroup}
            onSettings={onSettingsGroup}
            isLoading={isLoading}
          />
        ))}
        
        {/* Loading skeleton cards */}
        {isLoading && groups.length === 0 && (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="h-24 bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={onLoadMore}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More Groups'}
          </Button>
        </div>
      )}
    </div>
  );
};
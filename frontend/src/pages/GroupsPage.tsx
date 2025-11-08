import React, { useState, useEffect } from 'react';
import { useGroups } from '../hooks/useGroups';
import { useAuth } from '../hooks/useAuth';
import { GroupList, GroupForm } from '../components/groups';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { Users, Search, Filter, Plus } from 'lucide-react';
import { CreateGroupRequest, UpdateGroupRequest } from '../types';

type TabType = 'all' | 'my-groups' | 'joined';

export const GroupsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    groups,
    isLoading,
    error,
    pagination,
    loadGroups,
    loadOwnerGroups,
    loadMemberGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    clearError
  } = useGroups();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load groups based on active tab
  useEffect(() => {
    const loadGroupsData = async () => {
      try {
        switch (activeTab) {
          case 'all':
            await loadGroups(0, 12);
            break;
          case 'my-groups':
            if (user?.id) {
              await loadOwnerGroups(user.id, 0, 12);
            }
            break;
          case 'joined':
            if (user?.id) {
              await loadMemberGroups(user.id, 0, 12);
            }
            break;
        }
      } catch (error) {
        console.error('Failed to load groups:', error);
      }
    };

    loadGroupsData();
  }, [activeTab, user?.id, loadGroups, loadOwnerGroups, loadMemberGroups]);

  const handleCreateGroup = async (groupData: CreateGroupRequest | UpdateGroupRequest) => {
    setIsSubmitting(true);
    try {
      // Since we're only creating groups on this page, cast to CreateGroupRequest
      await createGroup(groupData as CreateGroupRequest);
      setShowCreateForm(false);
      // Refresh the current tab
      if (activeTab === 'my-groups' && user?.id) {
        await loadOwnerGroups(user.id, 0, 12);
      } else if (activeTab === 'all') {
        await loadGroups(0, 12);
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async (groupId: number, answers?: any[]) => {
    try {
      if (answers && answers.length > 0) {
        // Handle join with answers (for groups requiring approval)
        await joinGroup(groupId, answers);
      } else {
        // Direct join without answers
        await joinGroup(groupId);
      }
      
      // Refresh groups to update membership status
      switch (activeTab) {
        case 'all':
          await loadGroups(0, 12);
          break;
        case 'joined':
          if (user?.id) {
            await loadMemberGroups(user.id, 0, 12);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: number) => {
    try {
      await leaveGroup(groupId);
      // Refresh groups to update membership status
      switch (activeTab) {
        case 'all':
          await loadGroups(0, 12);
          break;
        case 'joined':
          if (user?.id) {
            await loadMemberGroups(user.id, 0, 12);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  const handleLoadMore = async () => {
    const nextPage = pagination.currentPage + 1;
    try {
      switch (activeTab) {
        case 'all':
          await loadGroups(nextPage, 12);
          break;
        case 'my-groups':
          if (user?.id) {
            await loadOwnerGroups(user.id, nextPage, 12);
          }
          break;
        case 'joined':
          if (user?.id) {
            await loadMemberGroups(user.id, nextPage, 12);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to load more groups:', error);
    }
  };

  const filteredGroups = groups?.filter(group =>
    group?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group?.description && group?.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const hasMore = pagination.currentPage < pagination.totalPages - 1;

  const getEmptyStateProps = () => {
    switch (activeTab) {
      case 'my-groups':
        return {
          title: "Bạn chưa tạo nhóm nào",
          message: "Tạo nhóm đầu tiên của bạn để kết nối mọi người có cùng sở thích.",
          showCreateButton: true
        };
      case 'joined':
        return {
          title: "Bạn chưa tham gia nhóm nào",
          message: "Khám phá và tham gia các nhóm phù hợp với sở thích của bạn.",
          showCreateButton: false
        };
      default:
        return {
          title: "Không tìm thấy nhóm nào",
          message: "Hiện tại chưa có nhóm nào được tạo.",
          showCreateButton: true
        };
    }
  };

  const emptyStateProps = getEmptyStateProps();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={false} showUserMenu={true} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && groups.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải nhóm...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <Button variant="outline" onClick={() => {
              clearError();
              loadGroups(0, 12);
            }}>
              Thử lại
            </Button>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                Nhóm
              </h1>
              <p className="text-gray-600 mt-2">
                Khám phá và tham gia các cộng đồng cùng sở thích
              </p>
            </div>
            
            {user && (
              <Button
                variant="primary"
                onClick={() => setShowCreateForm(true)}
                className="flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tạo nhóm mới
              </Button>
            )}
          </div>
        </div>

        {/* Tabs and Search */}
        <Card className="mb-6 bg-white">
          <div className="p-6">
            {/* Tabs */}
            {user && (
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Tất cả nhóm
                </button>
                <button
                  onClick={() => setActiveTab('my-groups')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'my-groups'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Nhóm của tôi
                </button>
                <button
                  onClick={() => setActiveTab('joined')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'joined'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Đã tham gia
                </button>
              </div>
            )}

            {/* Search */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhóm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <Button variant="outline" className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </Button>
            </div>

            {/* Results count */}
            {searchQuery && (
              <div className="mt-4 text-sm text-gray-600">
                Tìm thấy {filteredGroups.length} nhóm phù hợp với từ khóa "{searchQuery}"
              </div>
            )}
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-red-600 text-sm">
                    <span className="font-medium">Error:</span> {error}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={clearError}>
                  Dismiss
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Groups List */}
        <GroupList
          groups={searchQuery ? filteredGroups : (groups || [])}
          isLoading={isLoading}
          error={null} // We handle error display above
          onJoinGroup={handleJoinGroup}
          onLeaveGroup={handleLeaveGroup}
          onCreateGroup={() => setShowCreateForm(true)}
          onLoadMore={!searchQuery ? handleLoadMore : undefined}
          hasMore={!searchQuery && hasMore}
          showCreateButton={emptyStateProps.showCreateButton && !!user}
          emptyStateTitle={emptyStateProps.title}
          emptyStateMessage={emptyStateProps.message}
        />

        {/* Create Group Form */}
        <GroupForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateGroup}
          isLoading={isSubmitting}
          title="Tạo nhóm mới"
        />
      </main>
    </div>
  );
};
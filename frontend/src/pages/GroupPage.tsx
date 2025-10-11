import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroups } from '../hooks/useGroups';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../services/apiClient';
import { groupService } from '../services/groupService';
import { GroupForm, GroupPostCard, CreateGroupPost } from '../components/groups';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/Avatar';
import {
  Users,
  Settings,
  UserPlus,
  UserMinus,
  Globe,
  Lock,
  Calendar,
  ArrowLeft,
  MessageSquare,
  Image
} from 'lucide-react';
import { UpdateGroupRequest } from '../types';
import { Post } from '../services/postService';

export const GroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentGroup,
    members,
    isLoading: groupLoading,
    error: groupError,
    getGroup,
    joinGroup,
    leaveGroup,
    updateGroup,
    loadMembers,
    clearError
  } = useGroups();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groupIdNum = groupId ? parseInt(groupId, 10) : null;

  // Load group data
  useEffect(() => {
    if (groupIdNum) {
      console.log('Loading group data for ID:', groupIdNum);
      getGroup(groupIdNum);
      loadMembers(groupIdNum, 0, 20).catch(error => {
        console.error('Failed to load members:', error);
      });
      loadGroupPosts();
    }
  }, [groupIdNum]);

  const loadGroupPosts = async () => {
    if (groupIdNum) {
      setPostsLoading(true);
      setPostsError(null);
      try {
        const response = await groupService.getGroupPosts(groupIdNum, 0, 10);
        setPosts(response.content);
      } catch (error: any) {
        setPostsError(error.message || 'Failed to load group posts');
        console.error('Failed to load group posts:', error);
      } finally {
        setPostsLoading(false);
      }
    }
  };

  const handleJoinGroup = async () => {
    if (!groupIdNum) return;
    
    setIsSubmitting(true);
    try {
      const joinResponse = await joinGroup(groupIdNum);
      
      // Show success message
      const roleTranslations: Record<string, string> = {
        'member': 'thành viên',
        'moderator': 'điều hành viên',
        'admin': 'quản trị viên',
        'owner': 'chủ sở hữu'
      };
      const roleText = roleTranslations[joinResponse.role] || joinResponse.role;
      alert(`Đã tham gia nhóm "${joinResponse.groupName}" với vai trò ${roleText}`);
      
      // Refresh group data to update membership status
      await getGroup(groupIdNum);
      await loadMembers(groupIdNum, 0, 20);
    } catch (error) {
      console.error('Failed to join group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupIdNum) return;
    
    if (window.confirm('Bạn có chắc chắn muốn rời khỏi nhóm này?')) {
      setIsSubmitting(true);
      try {
        const leaveResponse = await leaveGroup(groupIdNum);
        
        // Show success message
        alert(`Đã rời khỏi nhóm "${leaveResponse.groupName}" thành công`);
        
        // Refresh group data
        await getGroup(groupIdNum);
        await loadMembers(groupIdNum, 0, 20);
      } catch (error) {
        console.error('Failed to leave group:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditGroup = async (updateData: UpdateGroupRequest) => {
    if (!groupIdNum) return;
    
    setIsSubmitting(true);
    try {
      await updateGroup(groupIdNum, updateData);
      setShowEditForm(false);
      // Refresh group data
      await getGroup(groupIdNum);
    } catch (error) {
      console.error('Failed to update group:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePost = async (content: string, mediaFiles?: File[]) => {
    if (!groupIdNum) return;
    
    try {
      // Use postService to create post with media in one request
      const { postService } = await import('../services/postService');
      
      const post = await postService.createPost({
        content,
        visibility: 'public_', // Group posts are always public within the group
        groupId: groupIdNum,
        mediaFiles: mediaFiles || []
      });
      
      console.log('Group post created successfully:', post);
      
      // Refresh posts
      await loadGroupPosts();
    } catch (error) {
      console.error('Failed to create group post:', error);
      throw error;
    }
  };

  if (groupLoading && !currentGroup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group...</p>
        </div>
      </div>
    );
  }

  if (groupError || !currentGroup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <h2 className="text-xl font-semibold">Group Not Found</h2>
            <p className="text-gray-600 mt-2">
              {groupError || 'The group you are looking for does not exist or you do not have access to it.'}
            </p>
          </div>
          <div className="space-x-3">
            <Button variant="outline" onClick={() => navigate('/groups')}>
              Back to Groups
            </Button>
            {groupError && (
              <Button variant="primary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const isMember = currentGroup.userMembershipStatus === 'joined';
  const isPending = currentGroup.userMembershipStatus === 'pending';
  const canManage = currentGroup.userRole === 'owner' || currentGroup.userRole === 'moderator' || currentGroup.userRole === 'admin';
  const isOwner = currentGroup.userRole === 'owner' || currentGroup.isOwner;
  const canPost = isMember;

  // Debug logging
  console.log('GroupPage render - members:', members, 'members type:', typeof members, 'members length:', members?.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/groups')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </div>

        {/* Group Header */}
        <Card className="mb-8">
          {/* Cover Image */}
          {currentGroup.coverUrl && (
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative overflow-hidden">
              <img
                src={currentGroup.coverUrl}
                alt={`${currentGroup.name} cover`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Group Avatar */}
                <Avatar
                  user={{
                    avatarUrl: currentGroup.avatarUrl,
                    displayName: currentGroup.name,
                    userId: currentGroup.id
                  }}
                  size="xl"
                  className="ring-4 ring-white shadow-lg"
                />
                
                {/* Group Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {currentGroup.name}
                    </h1>
                    
                    {/* Privacy Badge */}
                    <div className="flex items-center space-x-1 text-gray-500">
                      {currentGroup.privacy === 'private_' ? (
                        <>
                          <Lock className="w-5 h-5" />
                          <span className="text-sm">Private</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-5 h-5" />
                          <span className="text-sm">Public</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  {currentGroup.description && (
                    <p className="text-gray-600 mb-4 max-w-2xl">
                      {currentGroup.description}
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{currentGroup.memberCount} members</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(currentGroup.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {currentGroup.requiresApproval && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                        Approval Required
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {user && !isMember && !isPending && (
                  <Button
                    variant="primary"
                    onClick={handleJoinGroup}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {currentGroup.requiresApproval ? 'Request to Join' : 'Join Group'}
                  </Button>
                )}
                
                {isPending && (
                  <Button variant="outline" disabled className="flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Request Pending
                  </Button>
                )}
                
                {isMember && !isOwner && (
                  <Button
                    variant="outline"
                    onClick={handleLeaveGroup}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Leave Group
                  </Button>
                )}
                
                {canManage && (
                  <Button
                    variant="outline"
                    onClick={() => setShowEditForm(true)}
                    className="flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            {canPost && (
              <div data-create-post>
                <CreateGroupPost
                  groupId={groupIdNum!}
                  groupName={currentGroup.name}
                  onCreatePost={handleCreatePost}
                  isLoading={isSubmitting}
                />
              </div>
            )}

            {/* Posts */}
            <div className="space-y-6">
              {postsLoading && posts.length === 0 && (
                <Card className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading posts...</p>
                </Card>
              )}
              
              {!postsLoading && posts.length === 0 && (
                <Card className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-4">
                    {canPost 
                      ? "Be the first to share something with this group!"
                      : "No posts have been shared in this group yet."
                    }
                  </p>
                  {canPost && (
                    <Button variant="primary" onClick={() => {
                      // Scroll to the create post component
                      const createPostElement = document.querySelector('[data-create-post]');
                      if (createPostElement) {
                        createPostElement.scrollIntoView({ behavior: 'smooth' });
                        // Trigger the textarea click
                        const textarea = createPostElement.querySelector('textarea');
                        if (textarea) {
                          textarea.focus();
                        }
                      }
                    }}>
                      Create First Post
                    </Button>
                  )}
                </Card>
              )}
              
              {posts.map((post) => (
                <GroupPostCard
                  key={post.id}
                  post={post}
                  onReact={async () => {}}
                  onComment={async () => {}}
                  onShare={async () => {}}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                  <span className="text-sm text-gray-500">{currentGroup.memberCount}</span>
                </div>
                
                <div className="space-y-3">
                  {members && Array.isArray(members) && members.length > 0 ? members.slice(0, 8).map((member) => (
                    <div key={member.id || member.userId} className="flex items-center space-x-3">
                      <Avatar
                        user={{
                          avatarUrl: member.avatarUrl || member.user?.avatarUrl,
                          displayName: member.displayName || member.user?.displayName,
                          userId: member.userId || member.user?.id
                        }}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.displayName || member.user?.displayName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500">No members loaded</p>
                  )}
                  
                  {members && Array.isArray(members) && members.length > 8 && (
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View all members
                    </button>
                  )}
                </div>
              </div>
            </Card>

            {/* Group Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Privacy:</span>
                    <span className="text-gray-900 capitalize">
                      {currentGroup.privacy === 'private_' ? 'Private' : 'Public'}
                    </span>
                  </div>
                  
                  {(currentGroup.ownerDisplayName || currentGroup.owner) && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Created by:</span>
                      <span className="text-gray-900">
                        {currentGroup.ownerDisplayName || currentGroup.owner?.displayName}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">
                      {new Date(currentGroup.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Edit Group Form */}
        {showEditForm && (
          <GroupForm
            isOpen={showEditForm}
            onClose={() => setShowEditForm(false)}
            onSubmit={async (data) => {
              // Ensure we only pass UpdateGroupRequest data, not FormData
              if (!(data instanceof FormData)) {
                await handleEditGroup({
                  name: data.name,
                  description: data.description,
                  privacy: data.privacy,
                  requiresApproval: data.requiresApproval,
                  avatarUrl: data.avatarUrl,
                  coverUrl: data.coverUrl
                });
              }
            }}
            initialData={{
              name: currentGroup.name,
              description: currentGroup.description || '',
              privacy: currentGroup.privacy,
              avatarUrl: currentGroup.avatarUrl,
              coverUrl: currentGroup.coverUrl,
              requiresApproval: currentGroup.requiresApproval
            }}
            isEditing={true}
            isLoading={isSubmitting}
            title="Edit Group"
          />
        )}

      </div>
    </div>
  );
};
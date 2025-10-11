import React from 'react';
import { Modal } from '../ui/Modal';
import { CreatePost } from '../CreatePost';

interface CreateGroupPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (content: string, visibility?: 'public_' | 'friends' | 'private_' | 'group', mediaFiles?: File[]) => Promise<void>;
  isLoading?: boolean;
  groupName?: string;
}

export const CreateGroupPostModal: React.FC<CreateGroupPostModalProps> = ({
  isOpen,
  onClose,
  onCreatePost,
  isLoading = false,
  groupName
}) => {
  const handleCreatePost = async (content: string, visibility?: 'public_' | 'friends' | 'private_' | 'group', mediaFiles?: File[]) => {
    try {
      await onCreatePost(content, visibility, mediaFiles);
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      // Don't close modal on error, let user retry
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create Post${groupName ? ` in ${groupName}` : ''}`}
      size="lg"
    >
      <div className="p-4">
        <CreatePost
          onCreatePost={handleCreatePost}
          isLoading={isLoading}
        />
      </div>
    </Modal>
  );
};
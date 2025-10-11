import { UserRelationship, RelationshipStatus, RelationshipAction } from '../types/social';

export type FriendshipButtonStatus = 'none' | 'friends' | 'pending_request' | 'request_sent' | 'blocked';

/**
 * Convert API relationship status to friendship button status
 */
export const toFriendshipButtonStatus = (status: RelationshipStatus): FriendshipButtonStatus => {
  switch (status) {
    case 'friends':
      return 'friends';
    case 'pending_request':
      return 'pending_request';
    case 'request_sent':
      return 'request_sent';
    case 'blocked':
      return 'blocked';
    case 'following':
    case 'followers':
    case 'mutual_follow':
    case 'none':
      return 'none';
    default:
      return 'none';
  }
};

/**
 * Get the available action based on current relationship status
 */
export const getAvailableAction = (relationship: UserRelationship): RelationshipAction => {
  switch (relationship.relationshipStatus) {
    case 'friends':
      return 'remove_friend';
    case 'following':
      return 'unfollow';
    case 'followers':
      return 'follow';
    case 'mutual_follow':
      return 'unfollow';
    case 'pending_request':
      return 'accept_friend_request';
    case 'request_sent':
      return 'cancel_friend_request';
    case 'blocked':
      return 'unblock';
    case 'none':
      // For 'none' status, determine if we should follow or send friend request
      // based on whether friend requests are allowed
      return relationship.canSendFriendRequest ? 'send_friend_request' : 'follow';
    default:
      throw new Error(`Unknown relationship status: ${relationship.relationshipStatus}`);
  }
};

/**
 * Calculate the relationship status based on relationship flags
 */
export const calculateRelationshipStatus = (relationship: Omit<UserRelationship, 'relationshipStatus' | 'actionAvailable'>): RelationshipStatus => {
  if (relationship.isBlocked || relationship.isBlockedBy) {
    return 'blocked';
  }

  if (relationship.isFriend) {
    return 'friends';
  }

  if (relationship.friendshipStatus === 'pending') {
    return relationship.canSendFriendRequest ? 'pending_request' : 'request_sent';
  }

  if (relationship.isFollowing && relationship.isFollowedBy) {
    return 'mutual_follow';
  }

  if (relationship.isFollowing) {
    return 'following';
  }

  if (relationship.isFollowedBy) {
    return 'followers';
  }

  return 'none';
};

/**
 * Helper to check if user can interact with target user
 */
export const canInteractWithUser = (relationship: UserRelationship): boolean => {
  return !relationship.isBlocked && !relationship.isBlockedBy;
};

/**
 * Helper to check if user can send messages to target user
 */
export const canSendMessage = (relationship: UserRelationship): boolean => {
  return canInteractWithUser(relationship) && (
    relationship.isFriend || relationship.isMutualFollow
  );
};
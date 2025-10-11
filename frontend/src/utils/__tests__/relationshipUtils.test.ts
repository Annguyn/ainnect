import { UserRelationship } from '../../types/social';
import { 
  getAvailableAction, 
  calculateRelationshipStatus, 
  canInteractWithUser,
  canSendMessage 
} from '../relationshipUtils';

describe('relationshipUtils', () => {
  describe('getAvailableAction', () => {
    const testCases: Array<[Partial<UserRelationship>, string]> = [
      [{
        relationshipStatus: 'friends',
        canSendFriendRequest: true
      }, 'remove_friend'],
      [{
        relationshipStatus: 'following',
        canSendFriendRequest: true
      }, 'unfollow'],
      [{
        relationshipStatus: 'followers',
        canSendFriendRequest: true
      }, 'follow'],
      [{
        relationshipStatus: 'mutual_follow',
        canSendFriendRequest: true
      }, 'unfollow'],
      [{
        relationshipStatus: 'pending_request',
        canSendFriendRequest: true
      }, 'accept_friend_request'],
      [{
        relationshipStatus: 'request_sent',
        canSendFriendRequest: true
      }, 'cancel_friend_request'],
      [{
        relationshipStatus: 'blocked',
        canSendFriendRequest: true
      }, 'unblock'],
      [{
        relationshipStatus: 'none',
        canSendFriendRequest: true
      }, 'send_friend_request'],
      [{
        relationshipStatus: 'none',
        canSendFriendRequest: false
      }, 'follow']
    ];

    test.each(testCases)(
      'returns correct action for relationship %j',
      (relationship, expectedAction) => {
        expect(getAvailableAction(relationship as UserRelationship)).toBe(expectedAction);
      }
    );
  });

  describe('calculateRelationshipStatus', () => {
    it('returns blocked when user is blocked', () => {
      const relationship = {
        isBlocked: true,
        isBlockedBy: false,
        isFriend: false,
        isFollowing: false,
        isFollowedBy: false,
        isMutualFollow: false,
        canSendFriendRequest: false,
        friendshipStatus: null
      };
      expect(calculateRelationshipStatus(relationship)).toBe('blocked');
    });

    it('returns friends when users are friends', () => {
      const relationship = {
        isBlocked: false,
        isBlockedBy: false,
        isFriend: true,
        isFollowing: true,
        isFollowedBy: true,
        isMutualFollow: true,
        canSendFriendRequest: true,
        friendshipStatus: 'accepted'
      };
      expect(calculateRelationshipStatus(relationship)).toBe('friends');
    });

    it('returns mutual_follow when users follow each other', () => {
      const relationship = {
        isBlocked: false,
        isBlockedBy: false,
        isFriend: false,
        isFollowing: true,
        isFollowedBy: true,
        isMutualFollow: true,
        canSendFriendRequest: true,
        friendshipStatus: null
      };
      expect(calculateRelationshipStatus(relationship)).toBe('mutual_follow');
    });
  });

  describe('canInteractWithUser', () => {
    it('returns false when user is blocked', () => {
      const relationship = {
        isBlocked: true,
        isBlockedBy: false
      } as UserRelationship;
      expect(canInteractWithUser(relationship)).toBe(false);
    });

    it('returns false when user is blocked by target', () => {
      const relationship = {
        isBlocked: false,
        isBlockedBy: true
      } as UserRelationship;
      expect(canInteractWithUser(relationship)).toBe(false);
    });

    it('returns true when no blocking exists', () => {
      const relationship = {
        isBlocked: false,
        isBlockedBy: false
      } as UserRelationship;
      expect(canInteractWithUser(relationship)).toBe(true);
    });
  });

  describe('canSendMessage', () => {
    it('returns true for friends', () => {
      const relationship = {
        isBlocked: false,
        isBlockedBy: false,
        isFriend: true,
        isMutualFollow: false
      } as UserRelationship;
      expect(canSendMessage(relationship)).toBe(true);
    });

    it('returns true for mutual followers', () => {
      const relationship = {
        isBlocked: false,
        isBlockedBy: false,
        isFriend: false,
        isMutualFollow: true
      } as UserRelationship;
      expect(canSendMessage(relationship)).toBe(true);
    });

    it('returns false when blocked', () => {
      const relationship = {
        isBlocked: true,
        isBlockedBy: false,
        isFriend: true,
        isMutualFollow: true
      } as UserRelationship;
      expect(canSendMessage(relationship)).toBe(false);
    });
  });
});
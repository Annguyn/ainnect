import { useState, useCallback } from 'react';
import { messageReactionService } from '../services/messageReactionService';
import { debugLogger } from '../utils/debugLogger';

export type ReactionType = 'like' | 'love' | 'wow' | 'sad' | 'angry' | 'haha';

export interface MessageReactionCounts {
  like: number;
  love: number;
  wow: number;
  sad: number;
  angry: number;
  haha: number;
}

export interface UseMessageReactionsReturn {
  reactionCounts: Record<number, MessageReactionCounts>;
  currentUserReactions: Record<number, ReactionType | null>;
  isReacting: Record<number, boolean>;
  reactToMessage: (messageId: number, reactionType: ReactionType) => Promise<void>;
  removeReaction: (messageId: number) => Promise<void>;
  updateReactionFromWebSocket: (messageId: number, counts: MessageReactionCounts, userReaction: ReactionType | null) => void;
  setInitialReactions: (messageId: number, counts: MessageReactionCounts, userReaction: ReactionType | null) => void;
  setInitialReactionsBatch: (reactionsData: Record<number, MessageReactionCounts>, userReactionsData: Record<number, ReactionType | null>) => void;
}

export const useMessageReactions = (): UseMessageReactionsReturn => {
  const [reactionCounts, setReactionCounts] = useState<Record<number, MessageReactionCounts>>({});
  const [currentUserReactions, setCurrentUserReactions] = useState<Record<number, ReactionType | null>>({});
  const [isReacting, setIsReacting] = useState<Record<number, boolean>>({});

  const setInitialReactions = useCallback((
    messageId: number,
    counts: MessageReactionCounts,
    userReaction: ReactionType | null
  ) => {
    setReactionCounts(prev => ({
      ...prev,
      [messageId]: counts
    }));
    setCurrentUserReactions(prev => ({
      ...prev,
      [messageId]: userReaction
    }));
  }, []);

  const setInitialReactionsBatch = useCallback((
    reactionsData: Record<number, MessageReactionCounts>,
    userReactionsData: Record<number, ReactionType | null>
  ) => {
    setReactionCounts(reactionsData);
    setCurrentUserReactions(userReactionsData);
  }, []);

  const updateReactionFromWebSocket = useCallback((
    messageId: number,
    counts: MessageReactionCounts,
    userReaction: ReactionType | null
  ) => {
    debugLogger.log('MessageReactions', 'Updating from WebSocket', {
      messageId,
      counts,
      userReaction
    });

    setReactionCounts(prev => ({
      ...prev,
      [messageId]: counts
    }));

    // Only update current user reaction if it's for the current user
    if (userReaction !== undefined) {
      setCurrentUserReactions(prev => ({
        ...prev,
        [messageId]: userReaction
      }));
    }
  }, []);

  const reactToMessage = useCallback(async (messageId: number, reactionType: ReactionType) => {
    setIsReacting(prev => ({ ...prev, [messageId]: true }));

    try {
      // Optimistic update
      const optimisticCounts = { ...reactionCounts[messageId] };
      const previousReaction = currentUserReactions[messageId];

      // Remove previous reaction count
      if (previousReaction) {
        optimisticCounts[previousReaction] = Math.max(0, (optimisticCounts[previousReaction] || 0) - 1);
      }

      // Add new reaction count
      optimisticCounts[reactionType] = (optimisticCounts[reactionType] || 0) + 1;

      setReactionCounts(prev => ({
        ...prev,
        [messageId]: optimisticCounts
      }));

      setCurrentUserReactions(prev => ({
        ...prev,
        [messageId]: reactionType
      }));

      // Call API (backend will send WebSocket update)
      await messageReactionService.reactToMessage(messageId, reactionType);

      debugLogger.log('MessageReactions', 'Reacted to message', {
        messageId,
        reactionType
      });
    } catch (error) {
      debugLogger.log('MessageReactions', 'Failed to react to message', { error });
      
      // Revert optimistic update on error
      // The WebSocket will send the correct state
      console.error('Failed to react to message:', error);
    } finally {
      setIsReacting(prev => ({ ...prev, [messageId]: false }));
    }
  }, [reactionCounts, currentUserReactions]);

  const removeReaction = useCallback(async (messageId: number) => {
    setIsReacting(prev => ({ ...prev, [messageId]: true }));

    try {
      const previousReaction = currentUserReactions[messageId];

      // Optimistic update
      if (previousReaction) {
        const optimisticCounts = { ...reactionCounts[messageId] };
        optimisticCounts[previousReaction] = Math.max(0, (optimisticCounts[previousReaction] || 0) - 1);

        setReactionCounts(prev => ({
          ...prev,
          [messageId]: optimisticCounts
        }));
      }

      setCurrentUserReactions(prev => ({
        ...prev,
        [messageId]: null
      }));

      // Call API (backend will send WebSocket update)
      await messageReactionService.removeReaction(messageId);

      debugLogger.log('MessageReactions', 'Removed reaction from message', { messageId });
    } catch (error) {
      debugLogger.log('MessageReactions', 'Failed to remove reaction', { error });
      console.error('Failed to remove reaction:', error);
    } finally {
      setIsReacting(prev => ({ ...prev, [messageId]: false }));
    }
  }, [reactionCounts, currentUserReactions]);

  return {
    reactionCounts,
    currentUserReactions,
    isReacting,
    reactToMessage,
    removeReaction,
    updateReactionFromWebSocket,
    setInitialReactions,
    setInitialReactionsBatch
  };
};

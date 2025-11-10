import { apiClient } from './apiClient';
import { debugLogger } from '../utils/debugLogger';

export type ReactionType = 'like' | 'love' | 'wow' | 'sad' | 'angry' | 'haha';

interface MessageReactionResponse {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data?: any;
}

class MessageReactionService {
  private baseUrl = '/api/messages';

  /**
   * React to a message
   */
  async reactToMessage(messageId: number, reactionType: ReactionType): Promise<void> {
    const endpoint = `${this.baseUrl}/${messageId}/reactions`;
    debugLogger.logApiCall('POST', endpoint, { reactionType });

    try {
      const response = await apiClient.post<MessageReactionResponse>(endpoint, {
        type: reactionType
      });

      debugLogger.logApiResponse('POST', endpoint, response);

      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }

      debugLogger.log('MessageReactionService', '👍 Reacted to message', { messageId, reactionType });
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      console.error('Failed to react to message:', error);
      throw error;
    }
  }

  /**
   * Remove reaction from a message
   */
  async removeReaction(messageId: number): Promise<void> {
    const endpoint = `${this.baseUrl}/${messageId}/reactions`;
    debugLogger.logApiCall('DELETE', endpoint, { messageId });

    try {
      const response = await apiClient.delete<MessageReactionResponse>(endpoint);

      debugLogger.logApiResponse('DELETE', endpoint, response);

      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }

      debugLogger.log('MessageReactionService', '🚫 Removed reaction from message', { messageId });
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      console.error('Failed to remove reaction:', error);
      throw error;
    }
  }
}

export const messageReactionService = new MessageReactionService();

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { SocialNotification } from '../types/social'
import { socialService } from '../services/socialService'

export const useSocial = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<SocialNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const followUser = useCallback(async (userId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await socialService.followUser({ followeeId: userId })
      console.log('Successfully followed user:', userId)
    } catch (err) {
      setError('Không thể theo dõi người dùng này')
      console.error('Follow user error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const unfollowUser = useCallback(async (userId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await socialService.unfollowUser(userId)
      console.log('Successfully unfollowed user:', userId)
    } catch (err) {
      setError('Không thể bỏ theo dõi người dùng này')
      console.error('Unfollow user error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendFriendRequest = useCallback(async (userId: number, message?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await socialService.sendFriendRequest({ friendId: userId })
      console.log('Successfully sent friend request to:', userId)
    } catch (err) {
      setError('Không thể gửi lời mời kết bạn')
      console.error('Send friend request error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const acceptFriendRequest = useCallback(async (otherUserId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await socialService.acceptFriendRequest({ 
        otherUserId
      })
      console.log('Successfully accepted friend request:', otherUserId)
    } catch (err) {
      setError('Không thể chấp nhận lời mời kết bạn')
      console.error('Accept friend request error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const declineFriendRequest = useCallback(async (otherUserId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await socialService.rejectFriendRequest({
        otherUserId
      })
      console.log('Successfully declined friend request:', otherUserId)
    } catch (err) {
      setError('Không thể từ chối lời mời kết bạn')
      console.error('Decline friend request error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeFriend = useCallback(async (userId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await socialService.removeFriend(userId)
      console.log('Successfully removed friend:', userId)
    } catch (err) {
      setError('Không thể xóa bạn bè')
      console.error('Remove friend error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const blockUser = useCallback(async (userId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await socialService.blockUser({ 
        blockedUserId: userId, 
        reason: 'User requested block' 
      })
      console.log('Successfully blocked user:', userId)
    } catch (err) {
      setError('Không thể chặn người dùng này')
      console.error('Block user error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const unblockUser = useCallback(async (userId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await socialService.unblockUser(userId)
      console.log('Successfully unblocked user:', userId)
    } catch (err) {
      setError('Không thể bỏ chặn người dùng này')
      console.error('Unblock user error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sharePost = useCallback(async (postId: number, message?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await socialService.sharePost({ 
        postId, 
        comment: message 
      })
      console.log('Successfully shared post:', postId)
      return result
    } catch (err) {
      setError('Không thể chia sẻ bài viết này')
      console.error('Share post error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const checkFollowingStatus = useCallback(async (userId: number): Promise<boolean> => {
    try {
      const result = await socialService.checkFollowingStatus(userId)
      return result
    } catch (err) {
      console.error('Check following status error:', err)
      return false
    }
  }, [])

  const checkFriendStatus = useCallback(async (userId: number): Promise<boolean> => {
    try {
      const result = await socialService.checkFriendStatus(userId)
      return result
    } catch (err) {
      console.error('Check friend status error:', err)
      return false
    }
  }, [])

  const checkBlockStatus = useCallback(async (userId: number): Promise<boolean> => {
    try {
      const result = await socialService.checkBlockStatus(userId)
      return result
    } catch (err) {
      console.error('Check block status error:', err)
      return false
    }
  }, [])

  const getUserSocialStats = useCallback(async (userId: number): Promise<any> => {
    try {
      const result = await socialService.getSocialStats(userId)
      return result
    } catch (err) {
      console.error('Get user social stats error:', err)
      return {
        userId,
        username: '',
        displayName: '',
        avatarUrl: '',
        followersCount: 0,
        followingCount: 0,
        friendsCount: 0,
        sharesCount: 0,
        canSendFriendRequest: false,
        following: false,
        friend: false,
        blocked: false
      }
    }
  }, [])

  const reportUser = useCallback(async (userId: number, reason: string, description: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await socialService.reportUser({
        targetId: userId,
        reason: reason as any,
        description
      })
      console.log('Successfully reported user:', userId)
    } catch (err) {
      setError('Không thể báo cáo người dùng này')
      console.error('Report user error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reportPost = useCallback(async (postId: number, reason: string, description: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await socialService.reportPost({
        targetId: postId,
        reason: reason as any,
        description
      })
      console.log('Successfully reported post:', postId)
    } catch (err) {
      setError('Không thể báo cáo bài viết này')
      console.error('Report post error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reportComment = useCallback(async (commentId: number, reason: string, description: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await socialService.reportComment({
        targetId: commentId,
        reason: reason as any,
        description
      })
      console.log('Successfully reported comment:', commentId)
    } catch (err) {
      setError('Không thể báo cáo bình luận này')
      console.error('Report comment error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCommonFriends = useCallback(async (otherUserId: number, page: number = 0, size: number = 10) => {
    try {
      const result = await socialService.getCommonFriends(otherUserId, page, size)
      return result
    } catch (err) {
      console.error('Get common friends error:', err)
      return { content: [], totalElements: 0 }
    }
  }, [])

  const getCommonFriendsCount = useCallback(async (otherUserId: number): Promise<number> => {
    try {
      const result = await socialService.getCommonFriendsCount(otherUserId)
      return result
    } catch (err) {
      console.error('Get common friends count error:', err)
      return 0
    }
  }, [])

  const getMyReports = useCallback(async (page: number = 0, size: number = 10) => {
    try {
      const result = await socialService.getMyReports(page, size)
      return result
    } catch (err) {
      console.error('Get my reports error:', err)
      return { content: [], totalElements: 0 }
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const markNotificationAsRead = useCallback(async (notificationId: number) => {
    console.log('Marking notification as read:', notificationId)
  }, [])

  const markAllNotificationsAsRead = useCallback(async () => {
    console.log('Marking all notifications as read')
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    followUser,
    unfollowUser,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    sharePost,
    checkFollowingStatus,
    checkFriendStatus,
    checkBlockStatus,
    getUserSocialStats,
    reportUser,
    reportPost,
    reportComment,
    getCommonFriends,
    getCommonFriendsCount,
    getMyReports,
    clearError,
    markNotificationAsRead,
    markAllNotificationsAsRead
  }
}
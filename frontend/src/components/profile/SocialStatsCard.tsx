import React from 'react'
import { cn } from '../../lib/utils'

interface SocialStatsCardProps {
  stats: {
    followers: number
    following: number
    friends: number
    posts: number
    likes?: number
    comments?: number
    shares?: number
  }
  onStatClick?: (statType: string) => void
  className?: string
}

export const SocialStatsCard: React.FC<SocialStatsCardProps> = ({
  stats,
  onStatClick,
  className
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getStatIcon = (type: string) => {
    switch (type) {
      case 'posts':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'followers':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      case 'following':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case 'friends':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        )
      case 'likes':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        )
      case 'comments':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'shares':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        )
      default:
        return null
    }
  }

  const getStatLabel = (type: string): string => {
    switch (type) {
      case 'posts': return 'Bài viết'
      case 'followers': return 'Người theo dõi'
      case 'following': return 'Đang theo dõi'
      case 'friends': return 'Bạn bè'
      case 'likes': return 'Lượt thích'
      case 'comments': return 'Bình luận'
      case 'shares': return 'Chia sẻ'
      default: return ''
    }
  }

  const getStatColor = (type: string): string => {
    switch (type) {
      case 'posts': return 'text-blue-600 bg-blue-100'
      case 'followers': return 'text-green-600 bg-green-100'
      case 'following': return 'text-purple-600 bg-purple-100'
      case 'friends': return 'text-orange-600 bg-orange-100'
      case 'likes': return 'text-red-600 bg-red-100'
      case 'comments': return 'text-indigo-600 bg-indigo-100'
      case 'shares': return 'text-pink-600 bg-pink-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const statsArray = [
    { key: 'posts', value: stats.posts },
    { key: 'followers', value: stats.followers },
    { key: 'following', value: stats.following },
    { key: 'friends', value: stats.friends },
    ...(stats.likes ? [{ key: 'likes', value: stats.likes }] : []),
    ...(stats.comments ? [{ key: 'comments', value: stats.comments }] : []),
    ...(stats.shares ? [{ key: 'shares', value: stats.shares }] : [])
  ]

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê xã hội</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsArray.map((stat) => (
          <div
            key={stat.key}
            onClick={() => onStatClick?.(stat.key)}
            className={cn(
              'p-4 rounded-lg transition-all duration-200',
              onStatClick ? 'cursor-pointer hover:shadow-md' : '',
              getStatColor(stat.key)
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getStatIcon(stat.key)}
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold">{formatNumber(stat.value)}</div>
                <div className="text-sm font-medium opacity-90">
                  {getStatLabel(stat.key)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Rate */}
      {stats.likes && stats.comments && stats.shares && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Tỷ lệ tương tác</h4>
              <p className="text-xs text-gray-500">Dựa trên bài viết gần đây</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {stats.posts > 0 ? Math.round(((stats.likes + stats.comments + stats.shares) / stats.posts) * 100) / 100 : 0}
              </div>
              <div className="text-xs text-gray-500">tương tác/bài viết</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

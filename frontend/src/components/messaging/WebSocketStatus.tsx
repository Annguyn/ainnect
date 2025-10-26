import React from 'react'
import { cn } from '../../lib/utils'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

interface WebSocketStatusProps {
  isConnected: boolean
  error?: string | null
  reconnectAttempts?: number
  className?: string
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  isConnected,
  error,
  reconnectAttempts = 0,
  className
}) => {
  if (isConnected && !error) {
    return null // Don't show anything when connected
  }

  const getStatusInfo = () => {
    if (error) {
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        text: `Lỗi kết nối: ${error}`,
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-400'
      }
    } else if (reconnectAttempts > 0) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: `Đang kết nối lại... (${reconnectAttempts})`,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-400'
      }
    } else {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'Đang kết nối...',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-400'
      }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className={cn(
      "flex items-center space-x-2 px-3 py-2 rounded-lg border",
      statusInfo.bgColor,
      statusInfo.textColor,
      statusInfo.borderColor,
      className
    )}>
      {statusInfo.icon}
      <span className="text-sm font-medium">{statusInfo.text}</span>
    </div>
  )
}
